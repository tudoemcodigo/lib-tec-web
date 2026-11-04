import type { ComponentProps, ReactNode } from 'react';

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
  /** Ação em andamento: bloqueia novo clique e anuncia `aria-busy`, sem trocar o texto do botão. */
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
  return (
    <button
      type={type}
      className={`ui-button ${className ?? ''}`.trim()}
      data-variant={variant}
      aria-busy={loading || undefined}
      disabled={disabled === true || loading}
      {...rest}
    >
      {icon !== undefined ? <span className="ui-button-icon">{icon}</span> : null}
      {children}
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

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

/** Situação de um registro. O texto informa; a cor e o ponto só reforçam (nunca só cor). */
export function Badge({
  tone,
  children,
}: {
  readonly tone: BadgeTone;
  readonly children: ReactNode;
}) {
  return (
    <span className="ui-badge" data-tone={tone}>
      {children}
    </span>
  );
}
