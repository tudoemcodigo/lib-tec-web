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
] as const;

export type ProtectedTokenName = (typeof PROTECTED_TOKEN_NAMES)[number];
export type PaletteName = TokenName | ProtectedTokenName;
export type Palette = Readonly<Record<PaletteName, ColorPair>>;

const both = (value: string): ColorPair => ({ light: value, dark: value });

export const DEFAULT_PALETTE: Palette = {
  'color-bg': { light: '#f7f9f9', dark: '#222a3f' },
  'color-surface': { light: '#ffffff', dark: '#2c344b' },
  'color-text': { light: '#0b1020', dark: '#e8eaf2' },
  'color-text-muted': { light: '#3a4160', dark: '#b6bcd2' },
  'color-border': { light: '#6b7390', dark: '#7f88a8' },
  'color-border-subtle': { light: '#d5d9e6', dark: '#444d6b' },
  'color-accent': { light: '#5562d6', dark: '#8c97fa' },
  'color-on-accent': { light: '#ffffff', dark: '#0f1426' },
  'color-accent-subtle': { light: '#eef0fc', dark: '#283058' },
  'color-table-header': { light: '#eef1f7', dark: '#2a3247' },
  'color-row-hover': { light: '#f4f5fd', dark: '#343d5a' },
  'shell-bg': { light: '#2a3558', dark: '#1f2640' },
  'shell-hover': { light: '#323e66', dark: '#2a3252' },
  'shell-active': { light: '#3a466f', dark: '#343d60' },
  'shell-border': { light: '#46517a', dark: '#414a6c' },
  'shell-text': both('#e6e9f7'),
  'shell-text-muted': both('#b9c1e6'),
  'shell-accent': both('#8c97fa'),
  'color-error': { light: '#b42318', dark: '#fda29b' },
  'color-error-bg': { light: '#fef3f2', dark: '#3d2a30' },
  'color-success': { light: '#05603a', dark: '#6ce9a6' },
  'color-warning': { light: '#8a4b00', dark: '#fec84b' },
  'color-info': { light: '#1d4ed8', dark: '#8fb8ff' },
};

const TOKEN_SET: ReadonlySet<string> = new Set(TOKEN_NAMES);

export function isTokenName(name: string): name is TokenName {
  return TOKEN_SET.has(name);
}
