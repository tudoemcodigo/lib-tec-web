import { Menu } from '@base-ui/react/menu';
import { Separator } from '@base-ui/react/separator';
import { Link } from '@tanstack/react-router';
import { IconChevron, IconSignOut, IconUser } from '@tudoemcodigo/ui';
import { ShellIcon } from './icons.js';
import { useShellText } from './messages.js';
import { initials } from './permissions.js';

interface UserMenuPopupProps {
  readonly name: string;
  readonly profileTo: string | null;
  /** Abre o menu ao montar (o gatilho leve já foi clicado). */
  readonly openOnMount?: boolean;
  readonly onSignOut: () => void;
}

/** Menu da conta: abre ao clicar no nome; teclado (setas, Enter, Esc) e leitor de tela vêm do Base UI. */
export function UserMenuPopup({
  name,
  profileTo,
  openOnMount = false,
  onSignOut,
}: UserMenuPopupProps) {
  const text = useShellText();
  return (
    <Menu.Root defaultOpen={openOnMount}>
      <Menu.Trigger className="shell-user-trigger" aria-label={text('shell.user.menu', { name })}>
        {/* As iniciais saem por CSS (attr): texto no DOM entraria na regra "rótulo contém o texto visível" (WCAG 2.5.3) */}
        <span className="shell-avatar" data-initials={initials(name)} aria-hidden="true" />
        <span className="shell-user-name">{name}</span>
        <span className="shell-user-arrow">
          <ShellIcon icon={IconChevron} small />
        </span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end" className="shell-popup-position">
          <Menu.Popup className="shell-popup">
            {profileTo === null ? null : (
              <>
                <Menu.Group>
                  <Menu.GroupLabel className="shell-popup-group">
                    {text('shell.user.group')}
                  </Menu.GroupLabel>
                  <Menu.LinkItem className="shell-popup-item" render={<Link to={profileTo} />}>
                    <ShellIcon icon={IconUser} />
                    {text('shell.profile.menu')}
                  </Menu.LinkItem>
                </Menu.Group>
                <Separator className="shell-popup-separator" />
              </>
            )}
            <Menu.Item className="shell-popup-item" onClick={onSignOut}>
              <ShellIcon icon={IconSignOut} />
              {text('shell.user.signOut')}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
