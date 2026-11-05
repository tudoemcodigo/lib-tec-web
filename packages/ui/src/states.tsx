import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { IconError, IconInbox } from './icons.js';
import { useUiText } from './messages.js';

export interface ErrorStateProps {
  /** O que deu errado, em linguagem de quem usa ("Não foi possível carregar os clientes"). */
  readonly title: string;
  /** O que a pessoa pode fazer. Nunca o texto cru do servidor. */
  readonly message?: string | undefined;
  /** Identificador de rastreio (`traceId`) para o suporte. */
  readonly supportCode?: string | undefined;
  readonly onRetry?: (() => void) | undefined;
  /** Ação extra (por exemplo, um link "Voltar à lista"). */
  readonly action?: ReactNode;
  /** Nível do título: `1` quando o estado ocupa a página inteira (não há outro `h1`); padrão `2`. */
  readonly headingLevel?: 1 | 2;
}

/** Falha de carga ou de ação que ocupa a área: anunciada de imediato, com nova tentativa e código para o suporte. */
export function ErrorState({
  title,
  message,
  supportCode,
  onRetry,
  action,
  headingLevel = 2,
}: ErrorStateProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const text = useUiText();
  const titleId = useId();
  const [copied, setCopied] = useState(false);

  const copy = (): void => {
    if (supportCode === undefined) return;
    void navigator.clipboard.writeText(supportCode).then(
      () => {
        setCopied(true);
      },
      () => undefined,
    );
  };

  return (
    <section className="ui-state" data-kind="error" role="alert" aria-labelledby={titleId}>
      <span className="ui-state-icon">
        <IconError />
      </span>
      <Heading id={titleId} className="ui-state-title">
        {title}
      </Heading>
      {message !== undefined ? <p className="ui-state-text">{message}</p> : null}
      {supportCode !== undefined ? (
        <p className="ui-state-support">
          {text('ui.error.support')} <code>{supportCode}</code>{' '}
          <button type="button" className="ui-link-button" onClick={copy}>
            {copied ? text('ui.error.copied') : text('ui.error.copy')}
          </button>
        </p>
      ) : null}
      <div className="ui-state-actions">
        {onRetry ? (
          <button type="button" className="ui-button" data-variant="secondary" onClick={onRetry}>
            {text('ui.error.retry')}
          </button>
        ) : null}
        {action}
      </div>
    </section>
  );
}

export interface EmptyStateProps {
  readonly title: string;
  readonly description?: string | undefined;
  /** Próximo passo possível: um botão ou link. Tela vazia é um convite para agir. */
  readonly action?: ReactNode;
  readonly icon?: ReactNode;
  /** Nível do título: `1` quando o estado ocupa a página inteira (404, acesso negado); padrão `2`. */
  readonly headingLevel?: 1 | 2;
}

/** Nada para mostrar (lista vazia, busca sem resultado, acesso negado, página inexistente). */
export function EmptyState({
  title,
  description,
  action,
  icon,
  headingLevel = 2,
}: EmptyStateProps) {
  const titleId = useId();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section className="ui-state" data-kind="empty" role="status" aria-labelledby={titleId}>
      <span className="ui-state-icon">{icon ?? <IconInbox />}</span>
      <Heading id={titleId} className="ui-state-title">
        {title}
      </Heading>
      {description !== undefined ? <p className="ui-state-text">{description}</p> : null}
      {action !== undefined ? <div className="ui-state-actions">{action}</div> : null}
    </section>
  );
}

export interface LoadingStateProps {
  /** Sem rótulo, usa "Carregando…" do catálogo. */
  readonly label?: string;
  /** Número de linhas de esqueleto. */
  readonly rows?: number;
  /** `table` espelha a geometria de uma tabela (cabeçalho e linhas), para a carga não deslocar a página. */
  readonly variant?: 'lines' | 'table';
  /** Colunas do esqueleto de tabela (1 a 12). */
  readonly columns?: number;
}

/** Limita ao intervalo; valor que não é número finito (NaN, Infinity) cai no mínimo, nunca em zero itens. */
const clamp = (value: number, min: number, max: number): number =>
  Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), min), max) : min;

/** Esqueleto de carga: ocupa o lugar do conteúdo (sem salto de layout) e anuncia "Carregando…" uma vez. */
export function LoadingState({
  label,
  rows = 4,
  variant = 'lines',
  columns = 4,
}: LoadingStateProps) {
  const text = useUiText();
  const count = clamp(rows, 1, 12);
  if (variant === 'table') {
    const cols = clamp(columns, 1, 12);
    const cells = Array.from({ length: cols }, (_, index) => index);
    return (
      <div role="status" aria-busy="true">
        <span className="ui-sr">{label ?? text('ui.loading')}</span>
        <div
          className="ui-skeleton-table"
          aria-hidden="true"
          style={{ '--ui-columns': cols } as CSSProperties}
        >
          {Array.from({ length: count + 1 }, (_, row) => (
            <div key={row} className="ui-skeleton-row" data-head={row === 0 || undefined}>
              {cells.map((cell) => (
                <span key={cell} className="ui-skeleton" data-line={(row + cell) % 3} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div role="status" aria-busy="true" className="ui-skeleton-group">
      <span className="ui-sr">{label ?? text('ui.loading')}</span>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="ui-skeleton" aria-hidden="true" data-line={index % 3} />
      ))}
    </div>
  );
}

/**
 * Atualização em segundo plano (os dados já na tela continuam legíveis): uma linha fina no topo da região. Ocupa sempre os
 * mesmos 2 px, ativa ou não, para ligar e desligar não deslocar nada. É só visual; quem lê com leitor de tela tem o `aria-busy`
 * da região.
 */
export function RefreshBar({ active }: { readonly active: boolean }) {
  return <div className="ui-refresh" aria-hidden="true" data-active={active || undefined} />;
}
