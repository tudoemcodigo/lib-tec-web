import { createContext, useContext } from 'react';
import type { ResolvedRoutes } from './permissions.js';
import type { ShellNavItem, ShellUser } from './types.js';

/** O que as partes da casca (e as páginas de perfil, ajuda e acessibilidade) leem do `AppShell` sem passar por props. */
export interface ShellContextValue {
  readonly appName: string;
  readonly user: ShellUser;
  readonly nav: readonly ShellNavItem[];
  readonly routes: ResolvedRoutes;
  readonly onSignOut: () => void;
  readonly hasSearch: boolean;
  /** Atalhos de uma tecla ligados pelo sistema (a pessoa ainda pode desligá-los nas preferências). */
  readonly shortcuts: boolean;
  readonly permissionLabels: Readonly<Record<string, string>>;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

/** Contexto da casca; as páginas da casca só funcionam dentro de um `AppShell`, e falham alto se não estiverem. */
export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (value === null) {
    throw new Error('Este componente da casca precisa estar dentro de um AppShell.');
  }
  return value;
}
