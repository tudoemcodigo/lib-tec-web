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
