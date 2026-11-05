import { z } from './validation.js';
import { ApiError, ClientErrorCode } from './errors.js';

/**
 * Validação de contrato na borda (FRT-API-03). O OpenAPI do backend marca todos os campos como opcionais e
 * tipa números como `number | string`; estes esquemas produzem modelos estritos e transformam qualquer
 * divergência em `ApiError` de código `CONTRATO_VIOLADO`.
 */

/** Número que o servidor pode serializar como número ou como texto decimal. */
export const apiNumber = z.union([
  z.number(),
  z
    .string()
    .regex(/^-?\d{1,18}(\.\d{1,6})?$/)
    .transform(Number),
]);

export const apiInteger = apiNumber.pipe(z.number().int());

export const apiId = z.guid();

/** Instante ISO 8601 (UTC) como texto, conferido na borda. */
export const apiInstant = z.string().refine((valor) => !Number.isNaN(Date.parse(valor)));

export const apiPagination = z.object({
  page: apiInteger,
  pageSize: apiInteger,
  totalItems: apiInteger,
  totalPages: apiInteger,
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});

export interface Page<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly size: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}

/** Esquema do envelope paginado, já convertido para o modelo `Pagina`. */
export const apiPage = <S extends z.ZodType>(item: S) =>
  z
    .object({ data: z.array(item).nullable(), pagination: apiPagination })
    .transform(({ data, pagination }): Page<z.output<S>> => ({
      items: data ?? [],
      page: pagination.page,
      size: pagination.pageSize,
      total: pagination.totalItems,
      totalPages: pagination.totalPages,
      hasPrevious: pagination.hasPreviousPage,
      hasNext: pagination.hasNextPage,
    }));

/** Envelope de um único dado. */
export const apiEnvelope = <S extends z.ZodType>(data: S) =>
  z.object({ data: data as z.ZodType<z.output<S>> }).transform(({ data }) => data);

/** Valida `dado` contra o esquema; falha vira `CONTRATO_VIOLADO` (sem expor o conteúdo recebido). */
export function readContract<S extends z.ZodType>(
  schema: S,
  data: unknown,
  status = 200,
): z.output<S> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new ApiError({ status, code: ClientErrorCode.ContractViolated });
  return parsed.data;
}
