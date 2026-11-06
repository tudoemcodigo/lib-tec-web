import { lazy, Suspense, useState } from 'react';
import { IconChevron } from '@tudoemcodigo/ui';
import { ShellIcon } from './icons.js';
import { useShellText } from './messages.js';
import { initials } from './permissions.js';

const Popup = lazy(() =>
  import('./UserMenuPopup.js').then((module) => ({ default: module.UserMenuPopup })),
);

interface UserMenuProps {
  readonly name: string;
  readonly profileTo: string | null;
  readonly onSignOut: () => void;
}

function Trigger({ name, onClick }: { readonly name: string; readonly onClick?: () => void }) {
  const text = useShellText();
  return (
    <button
      type="button"
      className="shell-user-trigger"
      aria-haspopup="menu"
      aria-expanded="false"
      aria-label={text('shell.user.menu', { name })}
      onClick={onClick}
    >
      <span className="shell-avatar" data-initials={initials(name)} aria-hidden="true" />
      <span className="shell-user-name">{name}</span>
      <span className="shell-user-arrow">
        <ShellIcon icon={IconChevron} small />
      </span>
    </button>
  );
}

/**
 * Menu da conta. O código do menu flutuante (posicionamento, teclado, tipagem por letra) só é baixado no primeiro clique, para
 * caber no orçamento de JavaScript da carga inicial (FRT-EST-07); até lá, um botão idêntico ocupa o lugar.
 */
export function UserMenu({ name, profileTo, onSignOut }: UserMenuProps) {
  const [requested, setRequested] = useState(false);
  if (!requested) {
    return (
      <Trigger
        name={name}
        onClick={() => {
          setRequested(true);
        }}
      />
    );
  }
  return (
    <Suspense fallback={<Trigger name={name} />}>
      <Popup name={name} profileTo={profileTo} openOnMount onSignOut={onSignOut} />
    </Suspense>
  );
}
