import { useEffect, useRef } from 'react';
import { useMatches, useRouterState } from '@tanstack/react-router';
import { CONTENT_ID } from './ids.js';
import { useShellText } from './messages.js';
import type { ResolvedRoutes } from './permissions.js';

/** Sem a barra final: `/ajuda/` e `/ajuda` são a mesma página. */
const clean = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/**
 * Anuncia a troca de rota para tecnologia assistiva: título da aba (`Página · Sistema`) e foco no conteúdo (FRT-ACE-03).
 * O título das páginas da própria casca vem dos textos dela; o das demais, de `pageTitle` aplicado ao `staticData` da rota.
 * A primeira renderização só põe o título: roubar o foco na carga inicial atrapalharia quem acabou de chegar.
 */
export function useAnnounceRoute(
  appName: string,
  routes: ResolvedRoutes,
  pageTitle: ((staticData: unknown) => string | undefined) | undefined,
): void {
  const text = useShellText();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const staticData: unknown = useMatches({ select: (matches) => matches.at(-1)?.staticData });
  const current = clean(path);
  let title: string | undefined;
  if (routes.profile !== null && current === clean(routes.profile)) {
    title = text('shell.profile.title');
  } else if (routes.help !== null && current === clean(routes.help)) {
    title = text('shell.help.title');
  } else if (routes.accessibility !== null && current === clean(routes.accessibility)) {
    title = text('shell.accessibility.title');
  } else {
    title = pageTitle?.(staticData);
  }
  const first = useRef(true);
  useEffect(() => {
    document.title = title ? `${title} · ${appName}` : appName;
    if (first.current) {
      first.current = false;
      return;
    }
    document.getElementById(CONTENT_ID)?.focus();
  }, [path, title, appName]);
}
