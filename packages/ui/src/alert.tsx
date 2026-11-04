import type { ReactNode } from 'react';
import { IconClose, IconError, IconInfo, IconSuccess, IconWarning } from './icons.js';
import { useUiText } from './messages.js';

export type Tone = 'success' | 'info' | 'warning' | 'error';

const ICONS = {
  success: IconSuccess,
  info: IconInfo,
  warning: IconWarning,
  error: IconError,
} as const satisfies Record<Tone, () => ReactNode>;

export interface AlertProps {
  readonly tone: Tone;
  /** Frase curta que diz o que aconteceu. Opcional quando `children` já basta. */
  readonly title?: ReactNode;
  /** Detalhe: o que fazer agora. */
  readonly children?: ReactNode;
  /** Botão ou link da ação principal (por exemplo, "Tentar de novo"). */
  readonly action?: ReactNode;
  /** Quando informado, mostra o botão de dispensar. */
  readonly onDismiss?: () => void;
  readonly className?: string;
}

/**
 * Aviso permanente na página (não some sozinho). Erro é anunciado de imediato (`role="alert"`); sucesso, informação e atenção,
 * com educação (`role="status"`). O tom nunca é só cor: ícone e nome do tom (para leitor de tela) acompanham.
 */
export function Alert({ tone, title, children, action, onDismiss, className }: AlertProps) {
  const text = useUiText();
  const Icon = ICONS[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`ui-alert ${className ?? ''}`.trim()}
      data-tone={tone}
    >
      <span className="ui-alert-icon">
        <Icon />
      </span>
      <div className="ui-alert-body">
        <span className="ui-sr">{`${text(`ui.tone.${tone}`)}: `}</span>
        {title !== undefined ? <p className="ui-alert-title">{title}</p> : null}
        {children !== undefined ? <div className="ui-alert-text">{children}</div> : null}
        {action !== undefined ? <div className="ui-alert-action">{action}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="ui-icon-button"
          aria-label={text('ui.alert.dismiss')}
          onClick={onDismiss}
        >
          <IconClose />
        </button>
      ) : null}
    </div>
  );
}
