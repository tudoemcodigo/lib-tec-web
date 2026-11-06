import { useNavigate } from '@tanstack/react-router';
import { CommandPalette, IconContrast, type CommandItem } from '@tudoemcodigo/ui';
import { ShellIcon } from './icons.js';
import { useShellText } from './messages.js';
import { hasPermission } from './permissions.js';
import type { ResolvedRoutes } from './permissions.js';
import type { ShellCommand, ShellNavItem, ShellUser } from './types.js';

interface PaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly user: ShellUser;
  readonly nav: readonly ShellNavItem[];
  readonly routes: ResolvedRoutes;
  readonly commands: readonly ShellCommand[];
  readonly onOpenAppearance: () => void;
}

/**
 * Paleta de comandos (`Ctrl/Cmd+K`): ir a uma página ou começar uma ação sem passar pelo menu. A lista só mostra o que a
 * pessoa pode ver, para não oferecer beco sem saída; quem decide o acesso de verdade é o servidor (SEC-IDN-04).
 * Ordem: páginas do menu, Ajuda e Acessibilidade, comandos do sistema e, por fim, "Aparência".
 */
export function Palette({
  open,
  onOpenChange,
  user,
  nav,
  routes,
  commands,
  onOpenAppearance,
}: PaletteProps) {
  const navigate = useNavigate();
  const text = useShellText();
  const navigateGroup = text('shell.palette.group.navigate');
  const actionsGroup = text('shell.palette.group.actions');
  const go = (destination: string): string => text('shell.palette.go', { destination });
  const goTo = (to: string) => () => void navigate({ to });

  const pages: CommandItem[] = nav
    .filter((item) => hasPermission(user, item.permission))
    .map((item) => ({
      id: `nav:${item.to}`,
      label: go(item.label),
      group: navigateGroup,
      icon: <ShellIcon icon={item.icon} />,
      onSelect: goTo(item.to),
    }));

  const own: CommandItem[] = [];
  if (routes.help !== null) {
    own.push({
      id: 'shell:help',
      label: go(text('shell.nav.help')),
      group: navigateGroup,
      onSelect: goTo(routes.help),
    });
  }
  if (routes.accessibility !== null) {
    own.push({
      id: 'shell:accessibility',
      label: go(text('shell.nav.accessibility')),
      group: navigateGroup,
      onSelect: goTo(routes.accessibility),
    });
  }

  const custom: CommandItem[] = commands
    .filter(
      (command) => hasPermission(user, command.permission) && (command.to ?? command.onSelect),
    )
    .map((command) => {
      const { to, onSelect, icon, keywords, group } = command;
      return {
        id: `cmd:${command.id}`,
        label: command.label,
        group: group ?? actionsGroup,
        ...(icon ? { icon: <ShellIcon icon={icon} /> } : {}),
        ...(keywords ? { keywords } : {}),
        onSelect: () => {
          if (onSelect) onSelect();
          else if (to !== undefined) void navigate({ to });
        },
      };
    });

  const appearance: CommandItem = {
    id: 'shell:appearance',
    label: text('shell.appearance.open'),
    group: actionsGroup,
    icon: <ShellIcon icon={IconContrast} />,
    keywords: [text('shell.palette.keywords.appearance')],
    onSelect: onOpenAppearance,
  };

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      items={[...pages, ...own, ...custom, appearance]}
    />
  );
}
