import type { ShellRoutes, ShellUser } from './types.js';

/**
 * A pessoa tem a permissão? Sem permissão exigida, todos têm. Só decide o que mostrar: o servidor autoriza de verdade
 * (SEC-IDN-04), e uma permissão que o navegador "inventa" não abre nada além de um botão que o servidor recusa.
 */
export function hasPermission(user: ShellUser, permission: string | undefined): boolean {
  if (permission === undefined) return true;
  const { permissions } = user;
  return Array.isArray(permissions)
    ? (permissions as readonly string[]).includes(permission)
    : (permissions as ReadonlySet<string>).has(permission);
}

export interface ResolvedRoutes {
  readonly home: string;
  readonly profile: string | null;
  readonly help: string | null;
  readonly accessibility: string | null;
}

/** Padrões dos caminhos das páginas da casca; `false` desliga a página (vira `null`). */
export function resolveRoutes(routes: ShellRoutes | undefined): ResolvedRoutes {
  const pick = (value: string | false | undefined, fallback: string): string | null =>
    value === false ? null : (value ?? fallback);
  return {
    home: routes?.home ?? '/',
    profile: pick(routes?.profile, '/perfil'),
    help: pick(routes?.help, '/ajuda'),
    accessibility: pick(routes?.accessibility, '/acessibilidade'),
  };
}

/** Letras de uma casa, minúsculas: o único formato aceito para `shortcut` (texto livre nunca vira atalho). */
const SHORTCUT_LETTER = /^[a-z]$/;
export const isShortcutLetter = (value: string | undefined): value is string =>
  value !== undefined && SHORTCUT_LETTER.test(value);

/** Pessoa sem nome (ou só espaços) aparece como "?", em vez de um botão sem texto. */
export function initials(name: string): string {
  const words = name
    .split(/\s+/u)
    .map((word) => Array.from(word).find((char) => /\p{L}/u.test(char)))
    .filter((char): char is string => char !== undefined);
  if (words.length === 0) return '?';
  const first = words[0] ?? '?';
  const last = words.length > 1 ? (words.at(-1) ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
