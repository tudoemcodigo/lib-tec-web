import { useId } from 'react';
import { Button } from './controls.js';
import { fillUiText, useUiLocale, useUiText } from './messages.js';

/** Tamanhos de página oferecidos em todos os sistemas (o servidor limita o máximo; 100 cabe em qualquer consulta). */
export const PAGE_SIZES = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

export interface PaginationProps {
  readonly page: number;
  /** Total de páginas; `0` quando não se sabe (mostra só o número da página). */
  readonly totalPages: number;
  /** Total de registros da consulta. */
  readonly total: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
  readonly onChange: (page: number) => void;
  /** Registros por página em uso. Junto com `onPageSizeChange` mostra o seletor "Registros por página". */
  readonly pageSize?: number | undefined;
  readonly onPageSizeChange?: ((pageSize: number) => void) | undefined;
  /** Opções do seletor; o padrão é `PAGE_SIZES`. O tamanho em uso entra na lista mesmo que não conste dela. */
  readonly pageSizeOptions?: readonly number[] | undefined;
}

/** Navegação entre páginas de uma consulta, com a contagem de registros no idioma e no formato do sistema. */
export function Pagination({
  page,
  totalPages,
  total,
  hasPrevious,
  hasNext,
  onChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZES,
}: PaginationProps) {
  const text = useUiText();
  const sizeId = useId();
  const sizes =
    pageSize === undefined || pageSizeOptions.includes(pageSize)
      ? pageSizeOptions
      : [...pageSizeOptions, pageSize].sort((a, b) => a - b);
  const locale = useUiLocale();
  const count = new Intl.NumberFormat(locale).format(total);
  const totalText =
    total === 0
      ? text('ui.pagination.none')
      : fillUiText(text(total === 1 ? 'ui.pagination.one' : 'ui.pagination.other'), { count });
  return (
    <nav aria-label={text('ui.pagination.label')} className="ui-pagination">
      <Button
        variant="secondary"
        disabled={!hasPrevious}
        onClick={() => {
          onChange(page - 1);
        }}
      >
        {text('ui.pagination.previous')}
      </Button>
      <span aria-current="page">
        {fillUiText(text('ui.pagination.page'), { page })}
        {totalPages > 0 ? ` / ${String(totalPages)}` : ''}
      </span>
      <Button
        variant="secondary"
        disabled={!hasNext}
        onClick={() => {
          onChange(page + 1);
        }}
      >
        {text('ui.pagination.next')}
      </Button>
      <span className="ui-pagination-total">{totalText}</span>
      {pageSize !== undefined && onPageSizeChange !== undefined ? (
        <span className="ui-pagination-size">
          <label htmlFor={sizeId}>{text('ui.pagination.pageSize')}</label>
          <select
            id={sizeId}
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value));
            }}
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {new Intl.NumberFormat(locale).format(size)}
              </option>
            ))}
          </select>
        </span>
      ) : null}
    </nav>
  );
}
