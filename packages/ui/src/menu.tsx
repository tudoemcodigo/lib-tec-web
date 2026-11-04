import type { ReactElement, ReactNode } from 'react';
import { Menu } from '@base-ui/react/menu';
import { IconMore } from './icons.js';

export interface ActionMenuItem {
  /** Nome da ação ("Editar", "Excluir"): é o texto do item. */
  readonly label: string;
  readonly icon?: ReactNode;
  /** Link: o item navega (`role="menuitem"` de um `<a>`). Sem `href`, o item chama `onSelect`. */
  readonly href?: string;
  readonly onSelect?: () => void;
  /** Ação destrutiva: o item fica vermelho. */
  readonly tone?: 'default' | 'danger';
  readonly disabled?: boolean;
  /** Linha separadora acima do item (agrupa as ações destrutivas). */
  readonly separatorBefore?: boolean;
}

export interface ActionMenuProps {
  /** Nome do botão que abre o menu ("Ações de Maria da Silva"): obrigatório, o botão só tem ícone. */
  readonly label: string;
  readonly items: readonly ActionMenuItem[];
  /** Cria o elemento do link do item (por exemplo, o `Link` do roteador). Padrão: `<a href>`. */
  readonly renderLink?: (item: ActionMenuItem) => ReactElement;
  /** Abre o menu já na primeira renderização (para quem só monta o componente depois do clique no botão). */
  readonly defaultOpen?: boolean;
}

/**
 * Menu suspenso de ações de uma linha: um botão de três pontos abre a lista. Teclado (setas, Enter, Esc, digitar para ir a um
 * item), foco e leitor de tela vêm do Base UI; Esc devolve o foco ao botão. Item de ação chama `onSelect` (que pode abrir um
 * diálogo de confirmação) e item de link navega.
 */
export function ActionMenu({ label, items, renderLink, defaultOpen = false }: ActionMenuProps) {
  return (
    <Menu.Root defaultOpen={defaultOpen}>
      <Menu.Trigger className="ui-icon-action" data-tone="default" aria-label={label} title={label}>
        <IconMore />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={4} align="end" className="ui-menu-position">
          <Menu.Popup className="ui-menu">
            {items.map((item) => {
              const content = (
                <>
                  {item.icon !== undefined ? (
                    <span className="ui-menu-icon">{item.icon}</span>
                  ) : null}
                  {item.label}
                </>
              );
              return (
                <div key={item.label} className="ui-menu-entry">
                  {item.separatorBefore === true ? (
                    <div role="separator" className="ui-menu-separator" />
                  ) : null}
                  {item.href !== undefined ? (
                    <Menu.LinkItem
                      className="ui-menu-item"
                      data-tone={item.tone ?? 'default'}
                      // eslint-disable-next-line jsx-a11y/anchor-has-content -- o Base UI injeta o conteúdo do item neste elemento
                      render={renderLink?.(item) ?? <a href={item.href} />}
                    >
                      {content}
                    </Menu.LinkItem>
                  ) : (
                    <Menu.Item
                      className="ui-menu-item"
                      data-tone={item.tone ?? 'default'}
                      disabled={item.disabled === true}
                      onClick={item.onSelect}
                    >
                      {content}
                    </Menu.Item>
                  )}
                </div>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
