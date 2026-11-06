import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePreferences } from '@tudoemcodigo/theme';
import { SEARCH_ID, SHORTCUTS_ANCHOR } from './ids.js';
import { hasPermission, isShortcutLetter, type ResolvedRoutes } from './permissions.js';
import type { ShellNavItem, ShellUser } from './types.js';

/** Tempo para digitar a letra depois do `g`. */
export const SEQUENCE_WINDOW_MS = 1500;
const IN_FIELD = /^(INPUT|TEXTAREA|SELECT)$/;

/** Há algo recebendo digitação ou navegação própria por letras (campo, menu, janela)? Aí os atalhos não valem. */
function busy(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    IN_FIELD.test(target.tagName) ||
    target.closest('[role="menu"], [role="dialog"], [role="listbox"]') !== null
  );
}

interface ShortcutOptions {
  /** O sistema liga os atalhos de uma tecla? (A pessoa ainda os pode desligar nas preferências.) */
  readonly enabled: boolean;
  readonly user: ShellUser;
  readonly nav: readonly ShellNavItem[];
  readonly routes: ResolvedRoutes;
  readonly hasSearch: boolean;
}

/**
 * Atalhos de teclado: `/` busca, `?` ajuda e `g` seguido da letra de um item do menu para navegar.
 * São teclas únicas, então a pessoa pode desligá-los (WCAG 2.1.4); sem modificador e fora de campos de digitação.
 */
export function useShortcuts({ enabled, user, nav, routes, hasSearch }: ShortcutOptions): void {
  const navigate = useNavigate();
  const { shortcuts } = usePreferences();
  const sequence = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !shortcuts) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (busy(event.target)) return;

      const inSequence =
        sequence.current !== null && Date.now() - sequence.current < SEQUENCE_WINDOW_MS;
      sequence.current = null;

      if (inSequence) {
        const target = nav.find(
          (item) => isShortcutLetter(item.shortcut) && item.shortcut === event.key,
        );
        if (target === undefined || !hasPermission(user, target.permission)) return;
        void navigate({ to: target.to });
        event.preventDefault();
        return;
      }
      if (event.key === 'g') {
        sequence.current = Date.now();
      } else if (event.key === '/' && hasSearch) {
        const field = document.getElementById(SEARCH_ID);
        if (field) {
          event.preventDefault();
          field.focus();
        }
      } else if (event.key === '?' && routes.help !== null) {
        event.preventDefault();
        void navigate({ to: routes.help, hash: SHORTCUTS_ANCHOR });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled, shortcuts, navigate, user, nav, routes, hasSearch]);
}
