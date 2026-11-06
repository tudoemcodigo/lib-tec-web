import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CONTRAST_REQUIREMENTS,
  contrastRatio,
  findContrastViolations,
  mergePalette,
} from '../src/contrast.js';
import {
  DEFAULT_PALETTE,
  PROTECTED_TOKEN_NAMES,
  TOKEN_NAMES,
  isTokenName,
} from '../src/palette.js';

const css = readFileSync(join(import.meta.dirname, '..', 'src', 'tokens.css'), 'utf8');

/** Lê `--tec-<nome>: light-dark(a, b)` ou `--tec-<nome>: #rrggbb` do bloco `:root` padrão. */
function cssPair(name: string): { light: string; dark: string } | undefined {
  const root = /:root\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
  const pair = new RegExp(
    `--tec-${name}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`,
  ).exec(root);
  if (pair?.[1] !== undefined && pair[2] !== undefined) return { light: pair[1], dark: pair[2] };
  const single = new RegExp(`--tec-${name}:\\s*(#[0-9a-f]{6});`).exec(root);
  return single?.[1] === undefined ? undefined : { light: single[1], dark: single[1] };
}

describe('alto contraste (WCAG 1.4.6)', () => {
  const block = /:root\[data-contrast='high'\]\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
  const pair = (name: string) => {
    const found = new RegExp(
      `--tec-${name}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`,
    ).exec(block);
    return { light: found?.[1] ?? '', dark: found?.[2] ?? '' };
  };

  it.each(['color-tone-violet', 'color-tone-teal', 'color-info'])(
    '%s tem 9:1 ou mais sobre o fundo do alto contraste, claro e escuro',
    (name) => {
      const { light, dark } = pair(name);
      expect(contrastRatio(light, '#ffffff')).toBeGreaterThanOrEqual(9);
      expect(contrastRatio(dark, '#000000')).toBeGreaterThanOrEqual(9);
    },
  );
});

describe('paleta padrão', () => {
  it('tokens.css e palette.ts não divergem (todo token, claro e escuro)', () => {
    for (const [name, pair] of Object.entries(DEFAULT_PALETTE)) {
      expect(cssPair(name), name).toEqual(pair);
    }
  });

  it('tokens trocáveis e protegidos não se misturam', () => {
    for (const name of PROTECTED_TOKEN_NAMES) expect(isTokenName(name)).toBe(false);
    for (const name of TOKEN_NAMES) expect(isTokenName(name)).toBe(true);
    expect(isTokenName('__proto__')).toBe(false);
    expect(isTokenName('focus')).toBe(false);
  });

  it('a paleta padrão cumpre todos os pares de contraste, em claro e escuro', () => {
    expect(findContrastViolations({})).toEqual([]);
    expect(CONTRAST_REQUIREMENTS.length).toBeGreaterThan(20);
  });
});

describe('contrastRatio (WCAG 2.2)', () => {
  it('preto sobre branco é 21 e cor igual é 1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#4f5be8', '#4f5be8')).toBeCloseTo(1, 5);
  });

  it('recusa cor malformada em vez de calcular com lixo', () => {
    expect(() => contrastRatio('#fff', '#000000')).toThrow(/#rrggbb/);
    expect(() => contrastRatio('#000000', 'red')).toThrow(/#rrggbb/);
    expect(() => contrastRatio('#00000g', '#000000')).toThrow(/#rrggbb/);
  });
});

describe('findContrastViolations', () => {
  it('um tema com acento igual ao fundo reprova nos dois modos', () => {
    const violations = findContrastViolations({
      'color-accent': { light: '#f7f9f9', dark: '#222a3f' },
    });
    expect(violations.map((v) => `${v.mode}:${v.foreground}/${v.background}`)).toEqual(
      expect.arrayContaining(['light:color-accent/color-bg', 'dark:color-accent/color-bg']),
    );
  });

  it('o que o tema muda também afeta os pares protegidos (erro sobre o fundo novo)', () => {
    const violations = findContrastViolations({
      'color-bg': { light: '#b42318', dark: '#fda29b' },
    });
    expect(
      violations.some((v) => v.foreground === 'color-error' && v.background === 'color-bg'),
    ).toBe(true);
  });

  it('um tema natalino válido passa', () => {
    expect(
      findContrastViolations({
        'color-accent': { light: '#b3001b', dark: '#ff9aa6' },
        'color-on-accent': { light: '#ffffff', dark: '#1a0004' },
      }),
    ).toEqual([]);
  });

  it('mergePalette nunca deixa um tema trocar token protegido', () => {
    const merged = mergePalette({ 'color-accent': { light: '#000000', dark: '#ffffff' } });
    expect(merged['color-error']).toEqual(DEFAULT_PALETTE['color-error']);
    expect(merged['color-accent']).toEqual({ light: '#000000', dark: '#ffffff' });
  });
});
