import type { KeyboardEvent, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { IconCollapse, IconExpand } from '@tudoemcodigo/ui';
import { ShellIcon } from './icons.js';
import { MENU_ID } from './ids.js';
import { useShellText } from './messages.js';
import { hasPermission } from './permissions.js';
import type { ShellNavItem, ShellUser } from './types.js';

interface ShellMenuProps {
  readonly appName: string;
  readonly homeTo: string;
  readonly user: ShellUser;
  readonly nav: readonly ShellNavItem[];
  readonly open: boolean;
  readonly collapsed: boolean;
  /** Conteúdo no topo da gaveta (a busca, em telas estreitas). */
  readonly top?: ReactNode;
  readonly onNavigate: () => void;
  readonly onEscape: () => void;
  readonly onToggleCollapse: () => void;
}

/** Menu lateral: fixo e recolhível em telas largas; gaveta (sem prender o foco) em telas estreitas. */
export function ShellMenu({
  appName,
  homeTo,
  user,
  nav,
  open,
  collapsed,
  top,
  onNavigate,
  onEscape,
  onToggleCollapse,
}: ShellMenuProps) {
  const text = useShellText();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) onEscape();
  };
  return (
    // O handler só fecha a gaveta com Esc; os elementos interativos são os links e o botão de dentro.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      id={MENU_ID}
      tabIndex={-1}
      className="shell-menu"
      data-open={open ? '' : undefined}
      data-collapsed={collapsed ? '' : undefined}
      onKeyDown={onKeyDown}
    >
      <Link
        to={homeTo}
        className="shell-menu-brand"
        aria-label={text('shell.nav.home')}
        onClick={onNavigate}
      >
        <span className="shell-brand" role="img" aria-label={appName} />
      </Link>
      {top ? <div className="shell-menu-top">{top}</div> : null}
      <nav aria-label={text('shell.nav.main')}>
        <ul>
          {nav
            .filter((item) => hasPermission(user, item.permission))
            .map(({ to, label, icon, exact }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="shell-menu-item"
                  activeOptions={{ exact: exact === true }}
                  activeProps={{ 'aria-current': 'page' }}
                  title={collapsed ? label : undefined}
                  onClick={onNavigate}
                >
                  <ShellIcon icon={icon} />
                  <span className="shell-menu-label">{label}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>
      <button type="button" className="shell-menu-collapse" onClick={onToggleCollapse}>
        <ShellIcon icon={collapsed ? IconExpand : IconCollapse} />
        <span className="shell-menu-label">
          {collapsed ? text('shell.nav.expand') : text('shell.nav.collapse')}
        </span>
      </button>
    </div>
  );
}
