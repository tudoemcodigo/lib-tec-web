import type { ComponentType } from 'react';

export interface ShellIconProps {
  /** Ícone do pacote `ui` (por exemplo, `IconHome`). */
  readonly icon: ComponentType;
  /** Tamanho reduzido, para setas e marcas ao lado do texto. */
  readonly small?: boolean;
}

/**
 * Ícone da casca: sempre decorativo (o nome acessível vem do botão ou link) e com o tamanho certo para o menu e o cabeçalho.
 * O sistema o usa para ícones próprios (por exemplo, no botão de busca) com o mesmo aspecto dos da casca.
 */
export function ShellIcon({ icon: Drawing, small = false }: ShellIconProps) {
  return (
    <span className={small ? 'shell-icon shell-icon-small' : 'shell-icon'}>
      <Drawing />
    </span>
  );
}
