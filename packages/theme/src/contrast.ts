import {
  DEFAULT_PALETTE,
  type ColorPair,
  type Palette,
  type PaletteName,
  type TokenName,
} from './palette.js';

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Luminância relativa de WCAG 2.2 para `#rrggbb`. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste de WCAG 2.2 entre duas cores `#rrggbb`; cor malformada é erro. */
export function contrastRatio(a: string, b: string): number {
  if (!HEX.test(a) || !HEX.test(b)) {
    throw new Error('contrastRatio exige cores no formato #rrggbb.');
  }
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

interface Requirement {
  readonly foreground: PaletteName;
  readonly background: PaletteName;
  /** 4,5 para texto (WCAG 1.4.3) e 3 para componente de interface (1.4.11). */
  readonly minimum: number;
}

const text = (foreground: PaletteName, background: PaletteName): Requirement => ({
  foreground,
  background,
  minimum: 4.5,
});

/** Pares de cores que precisam de contraste em cada modo (claro e escuro). */
export const CONTRAST_REQUIREMENTS: readonly Requirement[] = [
  text('color-text', 'color-bg'),
  text('color-text', 'color-surface'),
  text('color-text', 'color-table-header'),
  text('color-text', 'color-row-hover'),
  text('color-text', 'color-accent-subtle'),
  text('color-text-muted', 'color-bg'),
  text('color-text-muted', 'color-surface'),
  text('color-accent', 'color-bg'),
  text('color-accent', 'color-surface'),
  text('color-on-accent', 'color-accent'),
  text('color-error', 'color-bg'),
  text('color-error', 'color-surface'),
  text('color-error', 'color-error-bg'),
  text('color-success', 'color-bg'),
  text('color-success', 'color-surface'),
  text('color-warning', 'color-bg'),
  text('color-warning', 'color-surface'),
  text('shell-text', 'shell-bg'),
  text('shell-text', 'shell-hover'),
  text('shell-text', 'shell-active'),
  text('shell-text-muted', 'shell-bg'),
  text('shell-accent', 'shell-bg'),
  { foreground: 'color-border', background: 'color-bg', minimum: 3 },
  { foreground: 'color-border', background: 'color-surface', minimum: 3 },
];

export interface ContrastViolation {
  readonly mode: keyof ColorPair;
  readonly foreground: PaletteName;
  readonly background: PaletteName;
  readonly ratio: number;
  readonly minimum: number;
}

/** Junta a paleta padrão com os tokens do tema (os protegidos nunca mudam). */
export function mergePalette(tokens: Readonly<Partial<Record<TokenName, ColorPair>>>): Palette {
  return { ...DEFAULT_PALETTE, ...tokens };
}

/** Confere todos os pares nos dois modos; devolve as violações (vazio quando o tema passa). */
export function findContrastViolations(
  tokens: Readonly<Partial<Record<TokenName, ColorPair>>>,
): ContrastViolation[] {
  const palette = mergePalette(tokens);
  const violations: ContrastViolation[] = [];
  for (const mode of ['light', 'dark'] as const) {
    for (const { foreground, background, minimum } of CONTRAST_REQUIREMENTS) {
      const ratio = contrastRatio(palette[foreground][mode], palette[background][mode]);
      if (ratio < minimum) {
        violations.push({ mode, foreground, background, ratio, minimum });
      }
    }
  }
  return violations;
}
