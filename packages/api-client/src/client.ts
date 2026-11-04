import createClient, { type Client } from 'openapi-fetch';
import { ApiError, ClientErrorCode, defaultCode, type ErrorDetail } from './errors.js';

/**
 * Único módulo que fala HTTP (FRT-API-02) e o único que define `credentials` (FRT-SEG-08).
 * Impõe timeout, cancelamento, retentativa segura, correlação e conversão de falha em `ApiError`.
 */

export const CSRF_HEADER = 'X-TEC-CSRF';
export const CORRELATION_HEADER = 'X-Correlation-ID';
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';
/** W3C Trace Context: o backend continua o mesmo trace (`00-<trace-id>-<span-id>-01`). */
export const TRACEPARENT_HEADER = 'traceparent';

const MAX_ATTEMPTS = 3;
const BACKOFF_BASE_MS = 300;
const RETRY_AFTER_MAX_S = 30;
const ERROR_BODY_MAX_BYTES = 64 * 1024;
const VALID_CODE = /^[A-Z0-9_]{1,64}$/;
const VALID_TRACE = /^[\w.:-]{1,128}$/;
const TRACEPARENT = /^00-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}$/;
const MAX_PROBLEM_FIELDS = 50;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export interface ClientConfig {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly fetchImpl: (request: Request) => Promise<Response>;
  readonly wait: (ms: number, signal: AbortSignal) => Promise<void>;
  readonly random: () => number;
  readonly onUnauthenticated: (() => void) | undefined;
}

export const defaultWait = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason as Error);
      },
      { once: true },
    );
  });

export const defaultConfig: ClientConfig = {
  baseUrl: typeof location === 'undefined' ? '' : location.origin,
  timeoutMs: 15_000,
  fetchImpl: (request) => fetch(request),
  wait: defaultWait,
  random: Math.random,
  onUnauthenticated: undefined,
};

/** Gera uma chave de idempotência: uma por intenção do usuário, reutilizada na retentativa (FRT-API-06). */
export const newIdempotencyKey = (): string => crypto.randomUUID();

/** Lê o `ETag` de um GET para enviá-lo como `If-Match` no PUT (FRT-API-05). */
export const etagOf = (response: Response): string | null => response.headers.get('ETag');

function randomHex(bytes: number): string {
  const buffer = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(buffer, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Novo trace-id (32 hex, nunca zerado) e novo span-id (16 hex) no formato do W3C Trace Context. */
export function newTraceparent(traceId: string = randomHex(16)): string {
  const safeTrace = /^0+$/.test(traceId) ? `${'0'.repeat(31)}1` : traceId;
  const spanId = randomHex(8);
  return `00-${safeTrace}-${/^0+$/.test(spanId) ? `${'0'.repeat(15)}1` : spanId}-01`;
}

/** Extrai o trace-id de um `traceparent` válido; qualquer outra coisa vira `null`. */
export const traceIdOf = (traceparent: string | null): string | null =>
  traceparent === null ? null : (TRACEPARENT.exec(traceparent)?.[1] ?? null);

const isObject = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

async function readLimitedText(response: Response): Promise<string | null> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const parts: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > ERROR_BODY_MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    parts.push(value);
  }
  const joined = new Uint8Array(total);
  let offset = 0;
  for (const parte of parts) {
    joined.set(parte, offset);
    offset += parte.byteLength;
  }
  return new TextDecoder().decode(joined);
}

/** RFC 9457 / ASP.NET `ValidationProblemDetails`: `errors` é `{ campo: [mensagem, ...] }`. */
function readProblemErrors(errors: Record<string, unknown>): ErrorDetail[] {
  const details: ErrorDetail[] = [];
  for (const [field, messages] of Object.entries(errors).slice(0, MAX_PROBLEM_FIELDS)) {
    if (!Array.isArray(messages) || field.length > 128) continue;
    const first: unknown = messages[0];
    details.push({
      code: 'REQUISICAO_INVALIDA',
      message: typeof first === 'string' ? first : '',
      field,
    });
  }
  return details;
}

function readDetails(body: Record<string, unknown>): ErrorDetail[] {
  const errors = body.errors;
  if (isObject(errors)) return readProblemErrors(errors);
  if (!Array.isArray(errors)) return [];
  const details: ErrorDetail[] = [];
  for (const item of errors as unknown[]) {
    if (!isObject(item)) continue;
    const { code, message, field } = item;
    if (typeof code !== 'string' || !VALID_CODE.test(code)) continue;
    details.push({
      code,
      message: typeof message === 'string' ? message : '',
      field: typeof field === 'string' ? field : null,
    });
  }
  return details;
}

function readRetryAfter(response: Response): number | null {
  const raw = response.headers.get('Retry-After');
  if (raw === null || !/^\d{1,6}$/.test(raw)) return null;
  return Number(raw);
}

/** Converte uma resposta de falha em `ApiError`; 5xx nunca carrega o texto do servidor (FRT-API-04). */
async function errorFromResponse(
  response: Response,
  clientTraceId: string | null,
): Promise<ApiError> {
  const status = response.status;
  const retryAfterSeconds = readRetryAfter(response);
  const text = await readLimitedText(response);
  let body: Record<string, unknown> | null = null;
  if (text !== null && text !== '') {
    try {
      const parsed: unknown = JSON.parse(text);
      body = isObject(parsed) ? parsed : null;
    } catch {
      body = null;
    }
  }
  if (body === null) {
    return new ApiError({
      status,
      code: defaultCode(status),
      traceId: clientTraceId,
      retryAfterSeconds,
    });
  }
  const rawTrace = body.traceId;
  // RFC 9457: `traceId` é extensão do problema; sem ele, vale o trace que o próprio cliente iniciou
  const traceId =
    typeof rawTrace === 'string' && VALID_TRACE.test(rawTrace) ? rawTrace : clientTraceId;
  const problemCode =
    typeof body.code === 'string' && VALID_CODE.test(body.code) ? body.code : null;
  // Em 5xx só o código (já validado) sobrevive: o texto e o campo do servidor nunca chegam à interface
  const received = readDetails(body);
  const details =
    status >= 500 ? received.map(({ code }) => ({ code, message: '', field: null })) : received;
  const first = details[0];
  return new ApiError({
    status,
    code: first?.code ?? problemCode ?? defaultCode(status),
    field: first?.field ?? null,
    traceId,
    details,
    retryAfterSeconds,
  });
}

const isRetryable = (status: number): boolean => status === 502 || status === 503 || status === 504;

async function send(original: Request, config: ClientConfig): Promise<Response> {
  const method = original.method.toUpperCase();
  const isMutation = !SAFE_METHODS.has(method);
  const canRepeat = !isMutation || original.headers.has(IDEMPOTENCY_HEADER);
  const maxAttempts = canRepeat ? MAX_ATTEMPTS : 1;

  if (!original.headers.has(CORRELATION_HEADER)) {
    original.headers.set(CORRELATION_HEADER, crypto.randomUUID());
  }
  if (isMutation) original.headers.set(CSRF_HEADER, '1');
  // Um trace por intenção; cada tentativa ganha o próprio span. Valor de fora só vale se for um traceparent válido
  const callerTrace = traceIdOf(original.headers.get(TRACEPARENT_HEADER));
  const clientTraceId = callerTrace ?? randomHex(16);

  for (let attempt = 1; ; attempt++) {
    const signal = AbortSignal.any([original.signal, AbortSignal.timeout(config.timeoutMs)]);
    const request = new Request(original.clone(), { signal: signal, credentials: 'same-origin' });
    request.headers.set(TRACEPARENT_HEADER, newTraceparent(clientTraceId));
    const waitBackoff = async (minMs = 0): Promise<void> => {
      const base = BACKOFF_BASE_MS * 2 ** (attempt - 1);
      const delay = Math.max(minMs, base + config.random() * base);
      await config.wait(delay, original.signal);
    };

    let response: Response;
    try {
      response = await config.fetchImpl(request);
    } catch (failure) {
      if (original.signal.aborted) throw failure;
      if (attempt < maxAttempts) {
        await waitBackoff();
        continue;
      }
      const timedOut =
        signal.aborted && (signal.reason as { name?: string } | undefined)?.name === 'TimeoutError';
      throw new ApiError({
        status: 0,
        code: timedOut ? ClientErrorCode.Timeout : ClientErrorCode.Network,
        traceId: clientTraceId,
      });
    }

    if (response.ok) return response;

    const retryAfter = readRetryAfter(response);
    const retry429 =
      response.status === 429 && retryAfter !== null && retryAfter <= RETRY_AFTER_MAX_S;
    if (attempt < maxAttempts && (isRetryable(response.status) || retry429)) {
      await response.body?.cancel();
      await waitBackoff(retry429 ? retryAfter * 1000 : 0);
      continue;
    }
    if (response.status === 401) config.onUnauthenticated?.();
    throw await errorFromResponse(response, clientTraceId);
  }
}

export type ApiClient<Paths extends object> = Client<Paths>;

/** Cria o cliente tipado pelo OpenAPI; falhas chegam como `ApiError` lançado. */
export function createApiClient<Paths extends object>(
  partial: Partial<ClientConfig> = {},
): ApiClient<Paths> {
  const config: ClientConfig = { ...defaultConfig, ...partial };
  return createClient<Paths>({
    baseUrl: config.baseUrl,
    fetch: (request) => send(request, config),
  });
}

/** Chamada HTTP fora do OpenAPI (rotas `/bff/*`), pelo mesmo caminho seguro do cliente tipado. */
export type Requester = (path: string, init?: RequestInit) => Promise<Response>;

export function createRequester(partial: Partial<ClientConfig> = {}): Requester {
  const config: ClientConfig = { ...defaultConfig, ...partial };
  return (path, init) => send(new Request(new URL(path, config.baseUrl), init), config);
}
