import { useId, type ReactNode } from 'react';
import { IconChevron } from './icons.js';
import { useUiText } from './messages.js';

export interface BreadcrumbItem {
  readonly label: string;
  /** Sem `href`, o item é texto (o último é sempre a página atual). */
  readonly href?: string;
}

export interface PageHeaderProps {
  readonly title: string;
  /** Trilha até a página, do início até o pai imediato; a página atual é o `title`. */
  readonly breadcrumb?: readonly BreadcrumbItem[];
  /** Situação do registro (um `Badge`). */
  readonly status?: ReactNode;
  /** Ações da página (botões): a principal à direita. */
  readonly actions?: ReactNode;
  readonly description?: string;
  /** Renderiza o link da trilha (por exemplo, com o `Link` do roteador do sistema). Padrão: `<a href>`. */
  readonly renderLink?: (item: BreadcrumbItem, children: ReactNode) => ReactNode;
  readonly titleId?: string;
}

/** Cabeçalho único de toda página: trilha, título (o único `h1`), situação, descrição e ações. */
export function PageHeader({
  title,
  breadcrumb,
  status,
  actions,
  description,
  renderLink,
  titleId,
}: PageHeaderProps) {
  const text = useUiText();
  return (
    <div className="ui-page-header">
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label={text('ui.breadcrumb')} className="ui-breadcrumb">
          <ol>
            {breadcrumb.map((item) => (
              <li key={`${item.label}-${item.href ?? ''}`}>
                {item.href === undefined
                  ? item.label
                  : (renderLink?.(item, item.label) ?? <a href={item.href}>{item.label}</a>)}
                <IconChevron />
              </li>
            ))}
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
      ) : null}
      <div className="ui-page-header-row">
        <div className="ui-page-header-title">
          <h1 id={titleId}>{title}</h1>
          {status}
        </div>
        {actions !== undefined ? <div className="ui-page-header-actions">{actions}</div> : null}
      </div>
      {description !== undefined ? <p className="ui-page-header-text">{description}</p> : null}
    </div>
  );
}

export interface SectionProps {
  readonly title?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  /** Corpo sem margem interna: para tabela ou lista que deve encostar nas bordas do cartão. */
  readonly flush?: boolean;
  readonly children: ReactNode;
}

/** Bloco de conteúdo com superfície própria: agrupa campos ou dados relacionados sob um `h2`. */
export function Section({ title, description, actions, flush, children }: SectionProps) {
  const titleId = useId();
  return (
    <section
      className="ui-section"
      {...(flush === true ? { 'data-flush': '' } : {})}
      {...(title === undefined ? {} : { 'aria-labelledby': titleId })}
    >
      {title !== undefined || actions !== undefined ? (
        <div className="ui-section-header">
          <div>
            {title !== undefined ? <h2 id={titleId}>{title}</h2> : null}
            {description !== undefined ? <p className="ui-section-text">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className="ui-section-body">{children}</div>
    </section>
  );
}

export interface DataItem {
  readonly label: string;
  readonly value: ReactNode;
}

/** Dados de leitura (rótulo e valor) em grade; valor vazio mostra um travessão para a lacuna não parecer defeito. */
export function DataList({ items }: { readonly items: readonly DataItem[] }) {
  return (
    <dl className="ui-data-list">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value === '' || item.value == null ? '—' : item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface SummaryRow {
  readonly label: string;
  readonly value: ReactNode;
  /** Linha de destaque (o total). */
  readonly emphasis?: boolean;
}

/** Resumo de valores alinhados à direita, com o total em destaque. */
export function SummaryList({ rows }: { readonly rows: readonly SummaryRow[] }) {
  return (
    <dl className="ui-summary">
      {rows.map((row) => (
        <div key={row.label} {...(row.emphasis === true ? { 'data-emphasis': '' } : {})}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Região com rolagem horizontal (tabela larga em tela estreita): precisa de foco por teclado para que quem não usa mouse
 * consiga rolar (WCAG 2.1.1; regra `scrollable-region-focusable` do axe).
 */
export function ScrollRegion({
  label,
  stickyHeader = false,
  children,
}: {
  readonly label?: string;
  /** Cabeçalho da tabela fixo no topo da região, que passa a ter altura máxima e rolar na vertical. */
  readonly stickyHeader?: boolean;
  readonly children: ReactNode;
}) {
  const text = useUiText();
  return (
    <div
      className="ui-scroll"
      data-sticky-header={stickyHeader || undefined}
      role="region"
      aria-label={label ?? text('ui.scroll.region')}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- região rolável exige foco por teclado (WCAG 2.1.1)
      tabIndex={0}
    >
      {children}
    </div>
  );
}
