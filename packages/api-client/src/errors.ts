/** Um erro do envelope `ApiResponse.errors` (contrato do backend: ARQ-API). */
export interface ErrorDetail {
  readonly code: string;
  readonly message: string;
  readonly field: string | null;
}

export interface ApiErrorInit {
  readonly status: number;
  readonly code: string;
  readonly field?: string | null;
  readonly traceId?: string | null;
  readonly details?: readonly ErrorDetail[];
  readonly retryAfterSeconds?: number | null;
}

/**
 * Falha de uma chamada à API, já normalizada (FRT-API-04).
 *
 * `message` é sempre o `code`: o texto do servidor nunca vira mensagem de exceção, pois pode vir de
 * 5xx ou de um servidor hostil. A interface traduz o `code` para pt-BR no catálogo de mensagens.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field: string | null;
  readonly traceId: string | null;
  readonly details: readonly ErrorDetail[];
  readonly retryAfterSeconds: number | null;

  constructor(init: ApiErrorInit) {
    super(init.code);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.field = init.field ?? null;
    this.traceId = init.traceId ?? null;
    this.details = init.details ?? [];
    this.retryAfterSeconds = init.retryAfterSeconds ?? null;
  }

  /**
   * 428 sem `If-Match`, ou 409 de versão divergente (`*_CONCORRENCIA` ou o `CONFLITO` genérico): o fluxo é
   * recarregar e reaplicar a edição (FRT-API-05). Outro 409 (duplicidade, idempotência em andamento) é erro
   * de negócio comum e mostra a própria mensagem.
   */
  get requiresReload(): boolean {
    return (
      this.status === 428 ||
      (this.status === 409 && /(?:^CONFLITO$|_CONCORRENCIA$)/.test(this.code))
    );
  }
}

/** Códigos próprios do cliente, para falhas que não chegam a ter envelope. */
export const ClientErrorCode = {
  Network: 'REDE_INDISPONIVEL',
  Timeout: 'TEMPO_ESGOTADO',
  InvalidResponse: 'RESPOSTA_INVALIDA',
  ContractViolated: 'CONTRATO_VIOLADO',
} as const;

/** Código de erro quando o servidor não traz um no envelope. */
export function defaultCode(status: number): string {
  if (status === 401) return 'NAO_AUTENTICADO';
  if (status === 403) return 'ACESSO_NEGADO';
  if (status === 404) return 'NAO_ENCONTRADO';
  if (status === 409) return 'CONFLITO';
  if (status === 413) return 'CORPO_GRANDE_DEMAIS';
  if (status === 428) return 'IF_MATCH_OBRIGATORIO';
  if (status === 429) return 'MUITAS_REQUISICOES';
  if (status >= 500) return 'ERRO_NO_SERVIDOR';
  return 'REQUISICAO_INVALIDA';
}
