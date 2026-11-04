import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MAX_THEMES,
  isRealDate,
  parseActiveThemeResponse,
  parseThemesDocument,
  selectActiveTheme,
  toActiveTheme,
  type ThemesDocument,
} from '../src/manifest.js';

interface Cases {
  validDocuments: { name: string; document: unknown }[];
  invalidDocuments: { name: string; document: unknown; structural: boolean }[];
  selection: { name: string; document: ThemesDocument; today: string; expectedId: string | null }[];
}

const cases = JSON.parse(
  readFileSync(join(import.meta.dirname, 'cases', 'themes-cases.json'), 'utf8'),
) as Cases;

describe('parseThemesDocument (casos compartilhados com o BFF)', () => {
  it.each(cases.validDocuments)('aceita: $name', ({ document }) => {
    expect(parseThemesDocument(document).ok).toBe(true);
  });

  it.each(cases.invalidDocuments)('recusa: $name', ({ document }) => {
    expect(parseThemesDocument(document).ok).toBe(false);
  });

  it('a mensagem de erro nunca repete o valor hostil recebido', () => {
    const hostile = '<script>alert(1)</script>';
    const result = parseThemesDocument({
      contract: 1,
      themes: [{ id: hostile, from: '2026-12-01', to: '2026-12-02', tokens: {} }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).not.toContain('script');
  });

  it('normaliza cores para minúsculas', () => {
    const result = parseThemesDocument({
      contract: 1,
      themes: [
        {
          id: 'a',
          from: '2026-12-01',
          to: '2026-12-02',
          tokens: { 'color-accent': { light: '#B3001B', dark: '#FF9AA6' } },
        },
      ],
    });
    expect(result.ok && result.value.themes[0]?.tokens['color-accent']).toEqual({
      light: '#b3001b',
      dark: '#ff9aa6',
    });
  });

  it('o limite de temas é imposto (65 recusa, 64 passa)', () => {
    const theme = (n: number) => ({
      id: `t${String(n)}`,
      from: '2026-01-01',
      to: '2026-01-02',
      tokens: {},
    });
    const make = (count: number) => ({
      contract: 1,
      themes: Array.from({ length: count }, (_unused, n) => theme(n)),
    });
    expect(parseThemesDocument(make(MAX_THEMES)).ok).toBe(true);
    expect(parseThemesDocument(make(MAX_THEMES + 1)).ok).toBe(false);
  });

  it('recusa objeto com protótipo estranho (não é JSON puro)', () => {
    class Weird {
      contract = 1;
      themes: unknown[] = [];
    }
    expect(parseThemesDocument(new Weird()).ok).toBe(false);
  });
});

describe('selectActiveTheme (casos compartilhados com o BFF)', () => {
  it.each(cases.selection)('$name', ({ document, today, expectedId }) => {
    expect(selectActiveTheme(document, today)?.id ?? null).toBe(expectedId);
  });
});

describe('isRealDate', () => {
  it('só datas reais do calendário', () => {
    expect(isRealDate('2028-02-29')).toBe(true);
    expect(isRealDate('2027-02-29')).toBe(false);
    expect(isRealDate('2026-04-31')).toBe(false);
    expect(isRealDate('2026-1-1')).toBe(false);
    expect(isRealDate('')).toBe(false);
  });
});

describe('toActiveTheme e parseActiveThemeResponse', () => {
  const source = parseThemesDocument({
    contract: 1,
    themes: [
      {
        id: 'christmas-2026',
        from: '2026-12-01',
        to: '2026-12-26',
        tokens: { 'color-accent': { light: '#b3001b', dark: '#ff9aa6' } },
        assets: { banner: 'banner.webp' },
        animation: 'snow',
      },
    ],
  });

  it('assets viram URLs da mesma origem e a resposta passa na validação da SPA', () => {
    if (!source.ok) throw new Error('fixture inválida');
    const active = toActiveTheme(source.value.themes[0] ?? (undefined as never));
    expect(active.assets.banner).toBe('/bff/theme/assets/christmas-2026/banner.webp');
    expect(active.assets.logo).toBeUndefined();
    expect(parseActiveThemeResponse({ contract: 1, theme: active }).ok).toBe(true);
  });

  it('"sem tema" é uma resposta válida', () => {
    expect(parseActiveThemeResponse({ contract: 1, theme: null })).toEqual({
      ok: true,
      value: { contract: 1, theme: null },
    });
  });

  const base = { id: 'a', tokens: {}, assets: {}, animation: 'none' };
  it.each([
    ['null', null],
    ['contract 2', { contract: 2, theme: null }],
    ['campo extra na raiz', { contract: 1, theme: null, extra: 1 }],
    ['theme é texto', { contract: 1, theme: 'x' }],
    ['campo extra no tema (css)', { contract: 1, theme: { ...base, css: 'x' } }],
    ['id inválido', { contract: 1, theme: { ...base, id: 'A/B' } }],
    [
      'token protegido',
      {
        contract: 1,
        theme: { ...base, tokens: { 'color-error': { light: '#000000', dark: '#ffffff' } } },
      },
    ],
    [
      'asset é URL externa',
      { contract: 1, theme: { ...base, assets: { banner: 'https://evil.example/x.png' } } },
    ],
    [
      'asset sem prefixo da origem',
      { contract: 1, theme: { ...base, assets: { banner: 'banner.png' } } },
    ],
    [
      'asset de outro tema',
      { contract: 1, theme: { ...base, assets: { banner: '/bff/theme/assets/other/banner.png' } } },
    ],
    [
      'asset com travessia',
      { contract: 1, theme: { ...base, assets: { banner: '/bff/theme/assets/a/../x.png' } } },
    ],
    [
      'asset SVG',
      { contract: 1, theme: { ...base, assets: { logo: '/bff/theme/assets/a/logo.svg' } } },
    ],
    ['animação desconhecida', { contract: 1, theme: { ...base, animation: 'confetti' } }],
  ])('recusa resposta hostil do BFF: %s', (_name, input) => {
    expect(parseActiveThemeResponse(input).ok).toBe(false);
  });

  it('assets do próprio tema passam', () => {
    expect(
      parseActiveThemeResponse({
        contract: 1,
        theme: {
          ...base,
          assets: {
            banner: '/bff/theme/assets/a/banner.webp',
            logo: '/bff/theme/assets/a/logo.png',
          },
        },
      }).ok,
    ).toBe(true);
  });
});
