import type { ReactNode } from 'react';
import { IconSort, IconSortDown, IconSortUp } from './icons.js';

export type SortDirection = 'asc' | 'desc';

/** Ordenação ativa de uma lista: o campo (nome do contrato com a API, nunca texto livre) e o sentido. */
export interface SortState<Field extends string = string> {
  readonly field: Field;
  readonly direction: SortDirection;
}

/**
 * Próximo estado ao clicar no cabeçalho de `field`: sem ordenação ou outro campo → crescente; crescente → decrescente;
 * decrescente → volta à ordenação padrão da lista (`undefined`). É o ciclo do padrão de tabela ordenável do WAI-ARIA APG.
 */
export function nextSort<Field extends string>(
  current: SortState<Field> | undefined,
  field: Field,
): SortState<Field> | undefined {
  if (current?.field !== field) return { field, direction: 'asc' };
  return current.direction === 'asc' ? { field, direction: 'desc' } : undefined;
}

/**
 * Lê a ordenação da URL: `campo` (crescente) ou `-campo` (decrescente). O campo é nome de contrato com a API e só vale se
 * estiver na lista fechada da tela; vazio, texto livre, campo desconhecido ou valor que não é texto voltam à ordem padrão
 * (`undefined`), então o servidor nunca recebe um campo arbitrário.
 */
export function parseSort<Field extends string>(
  value: unknown,
  fields: readonly Field[],
): SortState<Field> | undefined {
  if (typeof value !== 'string') return undefined;
  const descending = value.startsWith('-');
  const name = descending ? value.slice(1) : value;
  const field = fields.find((candidate) => candidate === name);
  return field === undefined ? undefined : { field, direction: descending ? 'desc' : 'asc' };
}

/** Valor da URL para a ordenação (`campo`, `-campo` ou vazio para a ordem padrão); o inverso de `parseSort`. */
export function formatSort(state: SortState | undefined): string {
  return state === undefined ? '' : `${state.direction === 'desc' ? '-' : ''}${state.field}`;
}

/** Valor da URL depois de clicar no cabeçalho de `field`: crescente, decrescente e de volta à ordem padrão. */
export function nextSortValue<Field extends string>(
  current: unknown,
  fields: readonly Field[],
  field: Field,
): string {
  return formatSort(nextSort(parseSort(current, fields), field));
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

export interface SortableHeaderProps {
  /** Rótulo da coluna, que também é o nome acessível do botão. */
  readonly children: ReactNode;
  /** Sentido, quando esta é a coluna ordenada; `undefined` nas demais. */
  readonly direction?: SortDirection | undefined;
  readonly onSort: () => void;
  readonly className?: string;
}

/**
 * Cabeçalho de coluna ordenável (`<th>`): um botão com o rótulo e o indicador de sentido. Só a coluna ordenada leva
 * `aria-sort` (uma por tabela, como pede o APG); o estado nunca é só cor, o ícone muda de forma. A ordenação em si é do servidor
 * (a lista é paginada), então este componente só avisa o clique.
 */
export function SortableHeader({ children, direction, onSort, className }: SortableHeaderProps) {
  const Icon = direction === 'asc' ? IconSortUp : direction === 'desc' ? IconSortDown : IconSort;
  return (
    <th
      scope="col"
      {...(className === undefined ? {} : { className })}
      {...(direction === undefined ? {} : { 'aria-sort': ARIA_SORT[direction] })}
    >
      <button
        type="button"
        className="ui-sort"
        data-active={direction === undefined ? undefined : ''}
        onClick={onSort}
      >
        {children}
        <span className="ui-sort-icon">
          <Icon />
        </span>
      </button>
    </th>
  );
}

export interface SortableColumnProps<Field extends string> {
  readonly field: Field;
  /** Ordenação ativa da lista (a mesma para todas as colunas); só a coluna do `field` mostra o sentido. */
  readonly sort: SortState<Field> | undefined;
  readonly onSort: (field: Field) => void;
  readonly className?: string;
  readonly children: ReactNode;
}

/** Cabeçalho de coluna que ordena a lista pelo `field` ao clicar: liga a ordenação ativa da lista ao `SortableHeader`. */
export function SortableColumn<Field extends string>({
  field,
  sort,
  onSort,
  className,
  children,
}: SortableColumnProps<Field>) {
  return (
    <SortableHeader
      direction={sort?.field === field ? sort.direction : undefined}
      onSort={() => {
        onSort(field);
      }}
      {...(className === undefined ? {} : { className })}
    >
      {children}
    </SortableHeader>
  );
}
