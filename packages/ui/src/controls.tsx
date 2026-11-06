import type { ComponentProps, ReactNode } from 'react';
import {
  IconError,
  IconInfo,
  IconSuccess,
  IconToneDiamond,
  IconToneRing,
  IconToneSquare,
  IconWarning,
} from './icons.js';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/** Atributos de um botão visual: para dar a aparência de botão a um link do roteador (`<Link {...buttonAttributes()}>`). */
export function buttonAttributes(variant: ButtonVariant = 'primary'): {
  readonly className: string;
  readonly 'data-variant': ButtonVariant;
} {
  return { className: 'ui-button', 'data-variant': variant };
}

export interface ButtonProps extends ComponentProps<'button'> {
  readonly variant?: ButtonVariant;
  /**
   * Ação em andamento: bloqueia novo clique e anuncia `aria-busy`. A largura não muda: o indicador toma o lugar do ícone ou,
   * sem ícone, fica sobre o texto (que segue ocupando o espaço e dando o nome ao botão).
   */
  readonly loading?: boolean;
  readonly icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  icon,
  type = 'button',
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const spinner = <span className="ui-button-spinner" aria-hidden="true" />;
  const overlay = loading && icon === undefined;
  return (
    <button
      type={type}
      className={`ui-button ${className ?? ''}`.trim()}
      data-variant={variant}
      data-overlay={overlay || undefined}
      aria-busy={loading || undefined}
      disabled={disabled === true || loading}
      {...rest}
    >
      {icon !== undefined ? (
        <span className="ui-button-icon">{loading ? spinner : icon}</span>
      ) : null}
      <span className="ui-button-label">{children}</span>
      {overlay ? spinner : null}
    </button>
  );
}

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children' | 'aria-label'> {
  /** Nome da ação ("Editar cliente"): vira o nome acessível e a dica ao passar o mouse. Obrigatório: ícone sozinho não tem texto. */
  readonly label: string;
  readonly icon: ReactNode;
  readonly tone?: 'default' | 'danger';
}

/** Atributos de um botão de ícone: para dar a aparência a um link do roteador (`<Link {...iconButtonAttributes()} aria-label=...>`). */
export function iconButtonAttributes(tone: 'default' | 'danger' = 'default'): {
  readonly className: string;
  readonly 'data-tone': 'default' | 'danger';
} {
  return { className: 'ui-icon-action', 'data-tone': tone };
}

/** Ação compacta só com ícone (linha de tabela): alvo mínimo de 24 px, nome e dica pelo `label`. */
export function IconButton({
  label,
  icon,
  tone = 'default',
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`ui-icon-action ${className ?? ''}`.trim()}
      data-tone={tone}
      {...rest}
    >
      {icon}
    </button>
  );
}

/**
 * Tons semânticos (`success`, `warning`, `error`, `info`) dizem o resultado de algo; os categóricos (`blue`, `violet`, `teal`)
 * só distinguem etapas de um fluxo (por exemplo, a situação de um pedido) e não carregam sentido de estado.
 */
export type BadgeTone =
  'neutral' | 'success' | 'warning' | 'error' | 'info' | 'blue' | 'violet' | 'teal';

const BADGE_ICONS: Readonly<Record<Exclude<BadgeTone, 'neutral'>, () => ReactNode>> = {
  success: IconSuccess,
  warning: IconWarning,
  error: IconError,
  info: IconInfo,
  blue: IconToneRing,
  violet: IconToneDiamond,
  teal: IconToneSquare,
};

/** Situação de um registro: texto, ícone próprio do tom (neutro tem só um ponto) e cor. Nunca só cor (WCAG 1.4.1). */
export function Badge({
  tone,
  children,
}: {
  readonly tone: BadgeTone;
  readonly children: ReactNode;
}) {
  const Icon = tone === 'neutral' ? null : BADGE_ICONS[tone];
  return (
    <span className="ui-badge" data-tone={tone}>
      {Icon !== null ? (
        <span className="ui-badge-icon">
          <Icon />
        </span>
      ) : null}
      {children}
    </span>
  );
}
