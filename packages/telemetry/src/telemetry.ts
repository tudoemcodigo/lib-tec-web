/**
 * Telemetria do cliente sem dado pessoal (FRT-OPE-06). Todo evento passa por `redact` antes de sair;
 * o destino (`TelemetrySink`) é escolhido pelo sistema, pois o pacote não presume fornecedor.
 */

export interface TelemetryEvent {
  readonly type: 'error' | 'metric' | 'route';
  readonly name: string;
  readonly detail?: string | undefined;
  readonly value?: number | undefined;
  readonly route?: string | undefined;
  readonly traceId?: string | null | undefined;
}

export type TelemetrySink = (event: TelemetryEvent) => void;

const PATTERNS: readonly (readonly [RegExp, string])[] = [
  [/\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g, '[email]'],
  [/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]'],
  [/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '[cnpj]'],
  [/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, '[token]'],
  [/\b(?:bearer|basic)\s+[\w.~+/=-]+/gi, '[credencial]'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[id]'],
  [/\(?\b\d{2}\)?\s?9?\d{4}-?\d{4}\b/g, '[telefone]'],
];

const TEXT_LIMIT = 500;

/** Substitui dado pessoal e credencial por marcadores e limita o tamanho. */
export function redact(text: string): string {
  let output = text;
  for (const [pattern, marker] of PATTERNS) output = output.replace(pattern, marker);
  return output.length > TEXT_LIMIT ? `${output.slice(0, TEXT_LIMIT)}…` : output;
}

/** Rota parametrizada: `/clientes/123?q=ana` vira `/clientes/:id`; query e fragmento saem (FRT-OPE-06). */
export function parameterizeRoute(path: string): string {
  const withoutQuery = path.split(/[?#]/, 1)[0] ?? '';
  return withoutQuery
    .split('/')
    .map((part) =>
      /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(part) || /^\d+$/.test(part)
        ? ':id'
        : part,
    )
    .join('/');
}

function redactEvent(event: TelemetryEvent): TelemetryEvent {
  return {
    ...event,
    name: redact(event.name),
    detail: event.detail === undefined ? undefined : redact(event.detail),
    route: event.route === undefined ? undefined : parameterizeRoute(event.route),
  };
}

let sink: TelemetrySink | null = null;

/** Define o destino dos eventos; devolve a função que o remove (útil em testes). */
export function setSink(destination: TelemetrySink | null): () => void {
  sink = destination;
  return () => {
    sink = null;
  };
}

/** Registra um evento já redigido; falha do destino nunca derruba a interface. */
export function track(event: TelemetryEvent): void {
  if (!sink) return;
  try {
    sink(redactEvent(event));
  } catch {
    // telemetria é melhor esforço
  }
}

export function trackError(error: unknown, route?: string): void {
  const name = error instanceof Error ? error.name : 'UnknownError';
  const traceId = error instanceof Error && 'traceId' in error ? String(error.traceId) : null;
  const detail = error instanceof Error ? error.message : undefined;
  track({ type: 'error', name, detail, route, traceId });
}
