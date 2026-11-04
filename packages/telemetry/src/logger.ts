import { parameterizeRoute, redact } from './telemetry.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Contexto anexado a toda linha: onde a pessoa estava e qual build rodava. */
export interface LogContext {
  readonly traceId?: string | null | undefined;
  readonly route?: string | undefined;
  readonly version?: string | undefined;
}

export interface LogEntry extends LogContext {
  readonly level: LogLevel;
  readonly time: string;
  readonly message: string;
  readonly data?: Readonly<Record<string, string | number | boolean | null>> | undefined;
}

export interface LoggerOptions {
  /** Em produção `debug` é descartado (FRT-OPE-05). */
  readonly production: boolean;
  /** Lido a cada linha, para refletir a rota e o trace do momento. */
  readonly context?: () => LogContext;
  /** Destino da linha estruturada; o padrão escreve JSON no `console`. */
  readonly write?: (entry: LogEntry) => void;
  readonly now?: () => Date;
}

export interface Logger {
  debug(message: string, data?: Readonly<Record<string, unknown>>): void;
  info(message: string, data?: Readonly<Record<string, unknown>>): void;
  warn(message: string, data?: Readonly<Record<string, unknown>>): void;
  error(message: string, data?: Readonly<Record<string, unknown>>): void;
}

const MAX_DATA_FIELDS = 20;

/** Só escalares sobrevivem (objeto aninhado pode carregar dado pessoal); texto passa pela redação. */
function sanitize(data: Readonly<Record<string, unknown>> | undefined): LogEntry['data'] {
  if (data === undefined) return undefined;
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(data).slice(0, MAX_DATA_FIELDS)) {
    if (typeof value === 'string') output[redact(key)] = redact(value);
    else if (typeof value === 'number' || typeof value === 'boolean' || value === null)
      output[redact(key)] = value;
  }
  return output;
}

const writeToConsole = (entry: LogEntry): void => {
  const line = JSON.stringify(entry);
  if (entry.level === 'error') console.error(line);
  else if (entry.level === 'warn') console.warn(line);
  else console.log(line);
};

/** Logger estruturado: uma linha JSON por evento, sempre redigida, com `traceId`, rota e versão. */
export function createLogger(options: LoggerOptions): Logger {
  const { production, context, write = writeToConsole, now = () => new Date() } = options;
  const emit = (
    level: LogLevel,
    message: string,
    data: Readonly<Record<string, unknown>> | undefined,
  ): void => {
    if (production && level === 'debug') return;
    const ctx = context?.() ?? {};
    try {
      write({
        level,
        time: now().toISOString(),
        message: redact(message),
        traceId: ctx.traceId ?? undefined,
        route: ctx.route === undefined ? undefined : parameterizeRoute(ctx.route),
        version: ctx.version,
        data: sanitize(data),
      });
    } catch {
      // log é melhor esforço: falha do destino nunca derruba a interface
    }
  };
  return {
    debug: (message, data) => {
      emit('debug', message, data);
    },
    info: (message, data) => {
      emit('info', message, data);
    },
    warn: (message, data) => {
      emit('warn', message, data);
    },
    error: (message, data) => {
      emit('error', message, data);
    },
  };
}
