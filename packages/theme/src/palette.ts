/**
 * Paleta padrão e contrato de tokens do tema (FRT-TEM-01/03). É a fonte do `tokens.css`: um teste confere que os
 * dois não divergem. Nomes sem o prefixo `--tec-`.
 */
export interface ColorPair {
  readonly light: string;
  readonly dark: string;
}

/** Tokens que um tema sazonal pode trocar. Foco, erro, aviso e sucesso ficam de fora (FRT-TEM-03). */
export const TOKEN_NAMES = [
  'color-bg',
  'color-surface',
  'color-text',
  'color-text-muted',
  'color-border',
  'color-border-subtle',
  'color-accent',
  'color-on-accent',
  'color-accent-subtle',
  'color-table-header',
  'color-row-hover',
  'shell-bg',
  'shell-hover',
  'shell-active',
  'shell-border',
  'shell-text',
  'shell-text-muted',
  'shell-accent',
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];

/** Tokens protegidos: nenhum manifesto os altera (erro, aviso, sucesso). O foco usa o acento. */
export const PROTECTED_TOKEN_NAMES = [
  'color-error',
  'color-error-bg',
  'color-success',
  'color-warning',
  'color-info',
  'color-tone-violet',
  'color-tone-teal',
] as const;

export type ProtectedTokenName = (typeof PROTECTED_TOKEN_NAMES)[number];
export type PaletteName = TokenName | ProtectedTokenName;
export type Palette = Readonly<Record<PaletteName, ColorPair>>;

export const DEFAULT_PALETTE: Palette = {
  'color-bg': { light: '#f4f6fb', dark: '#0c0e14' },
  'color-surface': { light: '#ffffff', dark: '#141722' },
  'color-text': { light: '#0f1424', dark: '#eceef6' },
  'color-text-muted': { light: '#424a69', dark: '#a9afc5' },
  'color-border': { light: '#6f7795', dark: '#6a7290' },
  'color-border-subtle': { light: '#dde1ee', dark: '#262b3b' },
  'color-accent': { light: '#4a55d4', dark: '#9aa5ff' },
  'color-on-accent': { light: '#ffffff', dark: '#0b0e24' },
  'color-accent-subtle': { light: '#ecedfd', dark: '#1e2350' },
  'color-table-header': { light: '#eef0f8', dark: '#181b27' },
  'color-row-hover': { light: '#f3f4fd', dark: '#1b1f2e' },
  'shell-bg': { light: '#ffffff', dark: '#0a0c11' },
  'shell-hover': { light: '#f0f2f9', dark: '#151824' },
  'shell-active': { light: '#e7e9fc', dark: '#1d2240' },
  'shell-border': { light: '#dde1ee', dark: '#232838' },
  'shell-text': { light: '#1b2140', dark: '#e8eaf3' },
  'shell-text-muted': { light: '#4a5170', dark: '#a3a9bf' },
  'shell-accent': { light: '#4a55d4', dark: '#9aa5ff' },
  'color-error': { light: '#b42318', dark: '#ff9d96' },
  'color-error-bg': { light: '#fef2f1', dark: '#2b1719' },
  'color-success': { light: '#05603a', dark: '#5fe3a1' },
  'color-warning': { light: '#8a4b00', dark: '#f5c04a' },
  'color-info': { light: '#1d4ed8', dark: '#8fb8ff' },
  'color-tone-violet': { light: '#6d28d9', dark: '#c4a8ff' },
  'color-tone-teal': { light: '#0f766e', dark: '#5eead4' },
};

const TOKEN_SET: ReadonlySet<string> = new Set(TOKEN_NAMES);

export function isTokenName(name: string): name is TokenName {
  return TOKEN_SET.has(name);
}
