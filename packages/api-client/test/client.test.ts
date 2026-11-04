// @vitest-environment node
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { servidor } from './server.js';
import { ApiError, ClientErrorCode } from '../src/errors.js';
import {
  CORRELATION_HEADER,
  CSRF_HEADER,
  IDEMPOTENCY_HEADER,
  createApiClient,
  defaultWait,
  etagOf,
  newIdempotencyKey,
  newTraceparent,
  traceIdOf,
} from '../src/client.js';

beforeAll(() => {
  servidor.listen({ onUnhandledFrame: 'error' });
});
afterEach(() => {
  servidor.resetHandlers();
});
afterAll(() => {
  servidor.close();
});

/**
 * Contrato mínimo do OpenAPI do sistema, só para tipar as chamadas do teste: o cliente do pacote é genérico sobre os `paths`
 * gerados por cada sistema, e o teste exercita o transporte, não o contrato de um sistema.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- o teste não conhece o OpenAPI de nenhum sistema
type LooseApiPaths = any;

interface TestResult {
  readonly data?: { readonly success?: boolean; readonly [chave: string]: unknown };
  readonly response: Response;
}
type TestInit = Record<string, unknown>;
/** Fachada só com os quatro verbos que o teste usa, sem a tipagem por caminho que cada sistema gera. */
interface TestClient {
  GET(path: string, init?: TestInit): Promise<TestResult>;
  POST(path: string, init?: TestInit): Promise<TestResult>;
  PUT(path: string, init?: TestInit): Promise<TestResult>;
  DELETE(path: string, init?: TestInit): Promise<TestResult>;
}

const BASE = 'http://api.test';

const esperas: number[] = [];
const wait = vi.fn((ms: number) => {
  esperas.push(ms);
  return Promise.resolve();
});

const novoCliente = (extra: Parameters<typeof createApiClient<LooseApiPaths>>[0] = {}) =>
  createApiClient<LooseApiPaths>({
    baseUrl: BASE,
    wait,
    random: () => 0,
    ...extra,
  }) as unknown as TestClient;

const falhar = async (acao: () => Promise<unknown>): Promise<ApiError> => {
  try {
    await acao();
  } catch (erro) {
    if (erro instanceof ApiError) return erro;
    throw erro;
  }
  throw new Error('era esperado ApiError');
};

afterEach(() => {
  esperas.length = 0;
  wait.mockClear();
});

describe('caminho feliz', () => {
  it('lê data, envia correlação e não envia CSRF em GET', async () => {
    let cabecalhos: Headers | undefined;
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, ({ request }) => {
        cabecalhos = request.headers;
        return HttpResponse.json({ success: true, data: [] });
      }),
    );
    const { data } = await novoCliente().GET('/api/v1/clientes');
    expect(data?.success).toBe(true);
    expect(cabecalhos?.get(CORRELATION_HEADER)).toMatch(/^[0-9a-f-]{36}$/);
    expect(cabecalhos?.has(CSRF_HEADER)).toBe(false);
  });

  it('envia o header CSRF em métodos que mudam estado', async () => {
    let csrf: string | null = null;
    servidor.use(
      http.post(`${BASE}/api/v1/clientes/:id/ativar`, ({ request }) => {
        csrf = request.headers.get(CSRF_HEADER);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await novoCliente().POST('/api/v1/clientes/{id}/ativar', { params: { path: { id: 'x' } } });
    expect(csrf).toBe('1');
  });

  it('expõe o ETag do GET para o If-Match do PUT', async () => {
    servidor.use(
      http.get(`${BASE}/api/v1/clientes/:id`, () =>
        HttpResponse.json({ success: true }, { headers: { ETag: '"abc"' } }),
      ),
    );
    const { response } = await novoCliente().GET('/api/v1/clientes/{id}', {
      params: { path: { id: '1' } },
    });
    expect(etagOf(response)).toBe('"abc"');
  });

  it('gera chaves de idempotência únicas', () => {
    expect(newIdempotencyKey()).not.toBe(newIdempotencyKey());
  });
});

describe('falhas do contrato viram ApiError', () => {
  it.each([
    [400, 'CAMPO_INVALIDO', 'nome'],
    [403, 'ACESSO_NEGADO', null],
    [404, 'NAO_ENCONTRADO', null],
    [409, 'CONFLITO', null],
    [422, 'REGRA_DE_NEGOCIO', null],
  ])('status %i com envelope', async (status, code, field) => {
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, () =>
        HttpResponse.json(
          { success: false, errors: [{ code, message: 'texto', field }], traceId: 'trace-1' },
          { status },
        ),
      ),
    );
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro).toMatchObject({ status, code, field, traceId: 'trace-1' });
    expect(erro.message).toBe(code);
  });

  it('409 e 428 pedem recarregar a edição', async () => {
    for (const status of [409, 428]) {
      servidor.use(
        http.put(`${BASE}/api/v1/clientes/:id`, () => HttpResponse.json({}, { status })),
      );
      const erro = await falhar(() =>
        novoCliente().PUT('/api/v1/clientes/{id}', { params: { path: { id: '1' } }, body: {} }),
      );
      expect(erro.requiresReload).toBe(true);
    }
  });

  it('401 avisa a sessão expirada e usa o código padrão', async () => {
    const onUnauthenticated = vi.fn();
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, () => new HttpResponse(null, { status: 401 })),
    );
    const erro = await falhar(() => novoCliente({ onUnauthenticated }).GET('/api/v1/clientes'));
    expect(erro.code).toBe('NAO_AUTENTICADO');
    expect(onUnauthenticated).toHaveBeenCalledOnce();
  });

  it('413 e 500 sem body geram código padrão', async () => {
    for (const [status, code] of [
      [413, 'CORPO_GRANDE_DEMAIS'],
      [500, 'ERRO_NO_SERVIDOR'],
    ] as const) {
      servidor.use(http.post(`${BASE}/api/v1/clientes`, () => new HttpResponse(null, { status })));
      const erro = await falhar(() => novoCliente().POST('/api/v1/clientes', { body: {} }));
      expect(erro.code).toBe(code);
    }
  });

  it('5xx nunca carrega o text do servidor, mas guarda o traceId', async () => {
    servidor.use(
      http.post(`${BASE}/api/v1/clientes`, () =>
        HttpResponse.json(
          {
            errors: [{ code: 'FALHA_SQL', message: 'Server=10.0.0.5;Password=x' }],
            traceId: 't-9',
          },
          { status: 500 },
        ),
      ),
    );
    const erro = await falhar(() => novoCliente().POST('/api/v1/clientes', { body: {} }));
    expect(erro.details).toEqual([{ code: 'FALHA_SQL', message: '', field: null }]);
    expect(erro.code).toBe('FALHA_SQL');
    expect(JSON.stringify(erro)).not.toContain('Password');
    expect(erro.traceId).toBe('t-9');
  });
});

describe('entrada hostil do servidor', () => {
  const caso = (body: BodyInit, status = 400) => {
    servidor.use(http.get(`${BASE}/api/v1/clientes`, () => new HttpResponse(body, { status })));
  };

  it('JSON malformado cai no código padrão', async () => {
    caso('{nao e json');
    expect((await falhar(() => novoCliente().GET('/api/v1/clientes'))).code).toBe(
      'REQUISICAO_INVALIDA',
    );
  });

  it('JSON que não é objeto cai no código padrão', async () => {
    caso('[1,2,3]');
    expect((await falhar(() => novoCliente().GET('/api/v1/clientes'))).details).toEqual([]);
  });

  it('código com marcação HTML é descartado', async () => {
    caso(JSON.stringify({ errors: [{ code: '<script>alert(1)</script>', message: 'x' }] }));
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro.code).toBe('REQUISICAO_INVALIDA');
    expect(erro.details).toEqual([]);
  });

  it('traceId hostil é ignorado e items malformados são descartados', async () => {
    caso(JSON.stringify({ traceId: '<b>x</b>', errors: ['texto', { code: 7 }, { code: 'OK_1' }] }));
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro.traceId).toMatch(/^[0-9a-f]{32}$/); // o hostil é descartado; vale o trace do cliente
    expect(erro.details).toEqual([{ code: 'OK_1', message: '', field: null }]);
  });

  it('corpo de erro gigante é cortado sem quebrar', async () => {
    caso('x'.repeat(200_000), 500);
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro.code).toBe('ERRO_NO_SERVIDOR');
  });

  it('errors que não é lista é ignorado', async () => {
    caso(JSON.stringify({ errors: 'nada' }));
    expect((await falhar(() => novoCliente().GET('/api/v1/clientes'))).details).toEqual([]);
  });
});

describe('retentativa (FRT-API-07)', () => {
  it('GET repete em 503 até 3 vezes, com backoff exponencial, e depois falha', async () => {
    let chamadas = 0;
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, () => {
        chamadas++;
        return new HttpResponse(null, { status: 503 });
      }),
    );
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(chamadas).toBe(3);
    expect(erro.status).toBe(503);
    expect(esperas).toEqual([300, 600]);
  });

  it('GET se recupera depois de uma failure transitória', async () => {
    let chamadas = 0;
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, () => {
        chamadas++;
        return chamadas === 1
          ? new HttpResponse(null, { status: 502 })
          : HttpResponse.json({ success: true });
      }),
    );
    const { data } = await novoCliente().GET('/api/v1/clientes');
    expect(data?.success).toBe(true);
    expect(chamadas).toBe(2);
  });

  it('POST sem chave de idempotência nunca repete', async () => {
    let chamadas = 0;
    servidor.use(
      http.post(`${BASE}/api/v1/clientes`, () => {
        chamadas++;
        return new HttpResponse(null, { status: 503 });
      }),
    );
    await falhar(() => novoCliente().POST('/api/v1/clientes', { body: {} }));
    expect(chamadas).toBe(1);
  });

  it('POST com chave de idempotência repete e reenvia a mesma chave e o corpo', async () => {
    const chaves: (string | null)[] = [];
    const corpos: string[] = [];
    servidor.use(
      http.post(`${BASE}/api/v1/clientes`, async ({ request }) => {
        chaves.push(request.headers.get(IDEMPOTENCY_HEADER));
        corpos.push(await request.text());
        return chaves.length < 3
          ? new HttpResponse(null, { status: 504 })
          : HttpResponse.json({ success: true }, { status: 201 });
      }),
    );
    await novoCliente().POST('/api/v1/clientes', {
      body: { nome: 'Ana' },
      headers: { [IDEMPOTENCY_HEADER]: 'chave-1' },
    });
    expect(chaves).toEqual(['chave-1', 'chave-1', 'chave-1']);
    expect(new Set(corpos).size).toBe(1);
  });

  it('nunca repete 4xx', async () => {
    let chamadas = 0;
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, () => {
        chamadas++;
        return HttpResponse.json({}, { status: 400 });
      }),
    );
    await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(chamadas).toBe(1);
  });

  it('429 respeita o Retry-After curto e repete', async () => {
    let chamadas = 0;
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, () => {
        chamadas++;
        return chamadas === 1
          ? new HttpResponse(null, { status: 429, headers: { 'Retry-After': '2' } })
          : HttpResponse.json({ success: true });
      }),
    );
    await novoCliente().GET('/api/v1/clientes');
    expect(esperas).toEqual([2000]);
  });

  it('429 com Retry-After longo não bloqueia: failure e informa a espera', async () => {
    servidor.use(
      http.get(
        `${BASE}/api/v1/clientes`,
        () => new HttpResponse(null, { status: 429, headers: { 'Retry-After': '120' } }),
      ),
    );
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro).toMatchObject({ status: 429, retryAfterSeconds: 120 });
    expect(esperas).toEqual([]);
  });

  it('Retry-After que não é número é ignorado', async () => {
    servidor.use(
      http.get(
        `${BASE}/api/v1/clientes`,
        () => new HttpResponse(null, { status: 429, headers: { 'Retry-After': 'amanhã' } }),
      ),
    );
    expect(
      (await falhar(() => novoCliente().GET('/api/v1/clientes'))).retryAfterSeconds,
    ).toBeNull();
  });
});

describe('rede, tempo e cancelamento', () => {
  it('rede fora vira REDE_INDISPONIVEL depois das tentativas', async () => {
    servidor.use(http.get(`${BASE}/api/v1/clientes`, () => HttpResponse.error()));
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro).toMatchObject({ status: 0, code: ClientErrorCode.Network });
    expect(wait).toHaveBeenCalledTimes(2);
  });

  it('timeout vira TEMPO_ESGOTADO', async () => {
    const fetchImpl = (request: Request) =>
      new Promise<Response>((_, reject) => {
        request.signal.addEventListener('abort', () => {
          reject(request.signal.reason as Error);
        });
      });
    const erro = await falhar(() =>
      novoCliente({ fetchImpl, timeoutMs: 1 }).POST('/api/v1/clientes', { body: {} }),
    );
    expect(erro.code).toBe(ClientErrorCode.Timeout);
  });

  it('cancelamento do usuário propaga o AbortError sem retentativa', async () => {
    const controle = new AbortController();
    const fetchImpl = vi.fn(
      (request: Request) =>
        new Promise<Response>((_, reject) => {
          request.signal.addEventListener('abort', () => {
            reject(request.signal.reason as Error);
          });
        }),
    );
    const promessa = novoCliente({ fetchImpl }).GET('/api/v1/clientes', {
      signal: controle.signal,
    });
    controle.abort();
    await expect(promessa).rejects.not.toBeInstanceOf(ApiError);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});

describe('padrões de produção', () => {
  it('usa o fetch global quando nenhuma implementação é injetada', async () => {
    servidor.use(http.get(`${BASE}/api/v1/clientes`, () => HttpResponse.json({ success: true })));
    const { data } = await (
      createApiClient<LooseApiPaths>({ baseUrl: BASE }) as unknown as TestClient
    ).GET('/api/v1/clientes');
    expect(data?.success).toBe(true);
  });

  it('a delay padrão resolve depois do prazo', async () => {
    vi.useFakeTimers();
    try {
      const delay = defaultWait(500, new AbortController().signal);
      await vi.advanceTimersByTimeAsync(500);
      await expect(delay).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('a delay padrão é interrompida pelo cancelamento', async () => {
    const controle = new AbortController();
    const delay = defaultWait(60_000, controle.signal);
    controle.abort(new Error('cancelado'));
    await expect(delay).rejects.toThrow('cancelado');
  });
});

describe('exigeRecarregar', () => {
  it.each([
    [428, 'IF_MATCH_OBRIGATORIO', true],
    [409, 'CONFLITO', true],
    [409, 'CLIENTE_CONCORRENCIA', true],
    [409, 'PEDIDO_CONCORRENCIA', true],
    [409, 'CLIENTE_DOCUMENTO_DUPLICADO', false],
    [409, 'IDEMPOTENCIA_EM_ANDAMENTO', false],
    [400, 'CONFLITO', false],
    [422, 'PEDIDO_TRANSICAO_INVALIDA', false],
  ])('%i %s -> %s', (status, code, esperado) => {
    expect(new ApiError({ status, code }).requiresReload).toBe(esperado);
  });
});

describe('W3C Trace Context (traceparent)', () => {
  const FORMATO = /^00-([0-9a-f]{32})-([0-9a-f]{16})-01$/;

  it('toda requisição leva um traceparent válido', async () => {
    let recebido = null as string | null;
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, ({ request }) => {
        recebido = request.headers.get('traceparent');
        return HttpResponse.json({ success: true });
      }),
    );
    await novoCliente().GET('/api/v1/clientes');
    expect(recebido).toMatch(FORMATO);
  });

  it('retentativas mantêm o trace e trocam o span', async () => {
    const vistos: string[] = [];
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, ({ request }) => {
        vistos.push(request.headers.get('traceparent') ?? '');
        return vistos.length < 3 ? new HttpResponse(null, { status: 503 }) : HttpResponse.json({});
      }),
    );
    await novoCliente().GET('/api/v1/clientes');
    const partes = vistos.map((v) => FORMATO.exec(v));
    expect(partes.every(Boolean)).toBe(true);
    expect(new Set(partes.map((m) => m?.[1])).size).toBe(1);
    expect(new Set(partes.map((m) => m?.[2])).size).toBe(3);
  });

  it('traceparent válido de quem chama é continuado; inválido é substituído', async () => {
    const vistos: string[] = [];
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, ({ request }) => {
        vistos.push(request.headers.get('traceparent') ?? '');
        return HttpResponse.json({});
      }),
    );
    const trace = 'a'.repeat(32);
    await novoCliente().GET('/api/v1/clientes', {
      headers: { traceparent: `00-${trace}-${'b'.repeat(16)}-01` },
    });
    await novoCliente().GET('/api/v1/clientes', { headers: { traceparent: 'lixo' } });
    expect(vistos[0]).toMatch(new RegExp(`^00-${trace}-[0-9a-f]{16}-01$`));
    expect(vistos[0]).not.toContain('b'.repeat(16));
    expect(vistos[1]).toMatch(FORMATO);
    expect(vistos[1]).not.toContain('lixo');
  });

  it('o ApiError carrega o trace do cliente quando o servidor não manda traceId, inclusive sem rede', async () => {
    let enviado = null as string | null;
    servidor.use(
      http.get(`${BASE}/api/v1/clientes`, ({ request }) => {
        enviado = request.headers.get('traceparent');
        return new HttpResponse(null, { status: 404 });
      }),
    );
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro.traceId).toBe(FORMATO.exec(enviado ?? '')?.[1]);
    const semRede = await falhar(() =>
      novoCliente({ fetchImpl: () => Promise.reject(new TypeError('fora')) }).GET(
        '/api/v1/clientes',
      ),
    );
    expect(semRede.traceId).toMatch(/^[0-9a-f]{32}$/);
  });

  it('newTraceparent nunca devolve trace ou span zerado; traceIdOf recusa formato inválido', () => {
    expect(newTraceparent('0'.repeat(32))).toMatch(/^00-0{31}1-[0-9a-f]{16}-01$/);
    expect(traceIdOf(null)).toBeNull();
    expect(traceIdOf('00-abc-def-01')).toBeNull();
    expect(traceIdOf(`00-${'c'.repeat(32)}-${'d'.repeat(16)}-01`)).toBe('c'.repeat(32));
  });
});

describe('RFC 9457 Problem Details (application/problem+json)', () => {
  const problema = (corpo: unknown, status: number): void => {
    servidor.use(
      http.get(
        `${BASE}/api/v1/clientes`,
        () =>
          new HttpResponse(JSON.stringify(corpo), {
            status,
            headers: { 'Content-Type': 'application/problem+json' },
          }),
      ),
    );
  };

  it('400 com errors por campo vira detalhes e usa o traceId do problema', async () => {
    problema(
      {
        type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: { nome: ['Obrigatório'], email: ['Inválido', 'Outro'] },
        traceId: '00-abc-trace',
      },
      400,
    );
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro).toMatchObject({
      status: 400,
      code: 'REQUISICAO_INVALIDA',
      field: 'nome',
      traceId: '00-abc-trace',
    });
    expect(erro.details.map((d) => d.field)).toEqual(['nome', 'email']);
  });

  it('extensão `code` válida vale; code malformado cai no padrão do status', async () => {
    problema({ title: 'Conflito', status: 409, code: 'CLIENTE_CONCORRENCIA' }, 409);
    expect((await falhar(() => novoCliente().GET('/api/v1/clientes'))).code).toBe(
      'CLIENTE_CONCORRENCIA',
    );
    problema({ title: 'x', status: 409, code: '<script>' }, 409);
    expect((await falhar(() => novoCliente().GET('/api/v1/clientes'))).code).toBe('CONFLITO');
  });

  it('5xx nunca expõe title, detail nem mensagens, mas guarda o traceId para o suporte', async () => {
    problema(
      {
        title: 'Server=10.0.0.5;Password=segredo',
        detail: 'stack',
        status: 500,
        traceId: 'trace-500',
        errors: { x: ['segredo'] },
      },
      500,
    );
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro.traceId).toBe('trace-500');
    expect(JSON.stringify(erro)).not.toContain('segredo');
    expect(erro.details.every((d) => d.message === '')).toBe(true);
  });

  it('errors hostil: valor que não é lista, chave enorme e excesso de campos são limitados', async () => {
    const errors: Record<string, unknown> = { ruim: 'texto', ['k'.repeat(500)]: ['x'] };
    for (let i = 0; i < 200; i++) errors[`campo${String(i)}`] = ['m'];
    problema({ status: 400, errors }, 400);
    const erro = await falhar(() => novoCliente().GET('/api/v1/clientes'));
    expect(erro.details.length).toBeLessThanOrEqual(50);
    expect(erro.details.some((d) => d.field === 'ruim' || (d.field?.length ?? 0) > 128)).toBe(
      false,
    );
  });
});
