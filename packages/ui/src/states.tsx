import { useId, useState, type ReactNode } from 'react';
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
}

/** Esqueleto de carga: ocupa o lugar do conteúdo (sem salto de layout) e anuncia "Carregando…" uma vez. */
export function LoadingState({ label, rows = 4 }: LoadingStateProps) {
  const text = useUiText();
  const count = Math.min(Math.max(Math.trunc(rows), 1), 12);
  return (
    <div role="status" aria-busy="true" className="ui-skeleton-group">
      <span className="ui-sr">{label ?? text('ui.loading')}</span>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="ui-skeleton" aria-hidden="true" data-line={index % 3} />
      ))}
    </div>
  );
}
