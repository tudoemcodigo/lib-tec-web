import { Button } from './controls.js';
import { fillUiText, useUiLocale, useUiText } from './messages.js';

export interface PaginationProps {
  readonly page: number;
  /** Total de páginas; `0` quando não se sabe (mostra só o número da página). */
  readonly totalPages: number;
  /** Total de registros da consulta. */
  readonly total: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
  readonly onChange: (page: number) => void;
}

/** Navegação entre páginas de uma consulta, com a contagem de registros no idioma e no formato do sistema. */
export function Pagination({
  page,
  totalPages,
  total,
  hasPrevious,
  hasNext,
  onChange,
}: PaginationProps) {
  const text = useUiText();
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
    </nav>
  );
}
