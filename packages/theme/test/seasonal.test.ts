// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ActiveTheme } from '../src/manifest.js';
import { DEFAULT_PREFERENCES, initPreferences, setPreferences } from '../src/preferences.js';
import {
  applySeasonalTheme,
  buildSeasonalCss,
  clearSeasonalTheme,
  getActiveTheme,
  loadSeasonalTheme,
  useActiveSeasonalTheme,
  watchPreferencesForSeasonalTheme,
  type SeasonalEnvironment,
  type SheetLike,
} from '../src/seasonal.js';

interface FakeSheet extends SheetLike {
  text: string;
}

/** Ambiente falso: o jsdom não implementa adoptedStyleSheets; a prova em navegador real é o teste E2E. */
function makeEnv(options: { failCreate?: boolean } = {}) {
  const root = document.createElement('html');
  const adopted: SheetLike[] = [];
  const created: FakeSheet[] = [];
  const env: SeasonalEnvironment = {
    root,
    adoptedStyleSheets: adopted,
    setAdoptedStyleSheets: (next) => {
      adopted.splice(0, adopted.length, ...next);
    },
    createSheet: () => {
      if (options.failCreate === true) throw new Error('sem suporte');
      const sheet: FakeSheet = {
        text: '',
        replaceSync(text) {
          this.text = text;
        },
      };
      created.push(sheet);
      return sheet;
    },
  };
  return { env, root, adopted, created };
}

const christmas: ActiveTheme = {
  id: 'christmas-2026',
  tokens: {
    'color-accent': { light: '#b3001b', dark: '#ff9aa6' },
    'color-on-accent': { light: '#ffffff', dark: '#1a0004' },
  },
  assets: { banner: '/bff/theme/assets/christmas-2026/banner.webp' },
  animation: 'snow',
};

const response = (theme: ActiveTheme | null) => ({ contract: 1, theme });

beforeEach(() => {
  localStorage.clear();
  initPreferences();
});

describe('buildSeasonalCss', () => {
  it('gera light-dark só para tokens validados, em camada própria e fora do contraste alto', () => {
    const css = buildSeasonalCss(christmas);
    expect(css).toContain('@layer tec-seasonal');
    expect(css).toContain(":root:not([data-contrast='high'])");
    expect(css).toContain('--tec-color-accent: light-dark(#b3001b, #ff9aa6);');
    expect(css).not.toMatch(/url\(|@import|expression/i);
  });

  it('tema sem tokens gera só a declaração de camadas', () => {
    expect(buildSeasonalCss({ ...christmas, tokens: {} })).not.toContain(':root');
  });

  it('recusa token ou cor hostil mesmo que alguém pule a validação', () => {
    const hostile = (tokens: unknown) => ({ ...christmas, tokens }) as ActiveTheme;
    expect(() =>
      buildSeasonalCss(hostile({ 'color-error': { light: '#000000', dark: '#ffffff' } })),
    ).toThrow();
    expect(() =>
      buildSeasonalCss(hostile({ 'color-accent': { light: '#fff;}body{x:y', dark: '#ffffff' } })),
    ).toThrow();
    expect(() =>
      buildSeasonalCss(hostile({ 'color-accent': { light: '#FFFFFF', dark: '#ffffff' } })),
    ).toThrow();
  });
});

describe('applySeasonalTheme', () => {
  it('adota a folha e marca o tema e a animação no <html>', () => {
    const { env, root, adopted, created } = makeEnv();
    expect(applySeasonalTheme(christmas, DEFAULT_PREFERENCES, env)).toEqual({ applied: true });
    expect(adopted).toHaveLength(1);
    expect(created[0]?.text).toContain('--tec-color-accent');
    expect(root.getAttribute('data-seasonal')).toBe('christmas-2026');
    expect(root.getAttribute('data-seasonal-animation')).toBe('snow');
  });

  it('animação "none" não marca o atributo', () => {
    const { env, root } = makeEnv();
    applySeasonalTheme({ ...christmas, animation: 'none' }, DEFAULT_PREFERENCES, env);
    expect(root.hasAttribute('data-seasonal-animation')).toBe(false);
  });

  it('sem tema: nada aplicado', () => {
    const { env, adopted } = makeEnv();
    expect(applySeasonalTheme(null, DEFAULT_PREFERENCES, env)).toEqual({
      applied: false,
      reason: 'none',
    });
    expect(adopted).toHaveLength(0);
  });

  it('a opção "sem tema sazonal" do usuário vence', () => {
    const { env, adopted, root } = makeEnv();
    expect(applySeasonalTheme(christmas, { ...DEFAULT_PREFERENCES, seasonal: 'off' }, env)).toEqual(
      {
        applied: false,
        reason: 'opt-out',
      },
    );
    expect(adopted).toHaveLength(0);
    expect(root.hasAttribute('data-seasonal')).toBe(false);
  });

  it('tema que reprova no contraste é recusado por inteiro', () => {
    const { env, adopted } = makeEnv();
    const bad: ActiveTheme = {
      ...christmas,
      tokens: { 'color-accent': { light: '#f7f9f9', dark: '#222a3f' } },
    };
    expect(applySeasonalTheme(bad, DEFAULT_PREFERENCES, env)).toEqual({
      applied: false,
      reason: 'contrast',
    });
    expect(adopted).toHaveLength(0);
  });

  it('navegador sem adoptedStyleSheets: falha fechada e limpa o que tiver marcado', () => {
    const { env, root } = makeEnv({ failCreate: true });
    expect(applySeasonalTheme(christmas, DEFAULT_PREFERENCES, env)).toEqual({
      applied: false,
      reason: 'unsupported',
    });
    expect(root.hasAttribute('data-seasonal')).toBe(false);
  });

  it('trocar de tema substitui a folha anterior em vez de acumular', () => {
    const { env, adopted } = makeEnv();
    applySeasonalTheme(christmas, DEFAULT_PREFERENCES, env);
    applySeasonalTheme({ ...christmas, id: 'new-year' }, DEFAULT_PREFERENCES, env);
    expect(adopted).toHaveLength(1);
  });

  it('clearSeasonalTheme remove folha e atributos e é idempotente', () => {
    const { env, adopted, root } = makeEnv();
    applySeasonalTheme(christmas, DEFAULT_PREFERENCES, env);
    clearSeasonalTheme(env);
    clearSeasonalTheme(env);
    expect(adopted).toHaveLength(0);
    expect(root.hasAttribute('data-seasonal')).toBe(false);
  });

  it('não toca folhas que não são suas', () => {
    const { env, adopted } = makeEnv();
    const foreign: SheetLike = { replaceSync: () => undefined };
    adopted.push(foreign);
    applySeasonalTheme(christmas, DEFAULT_PREFERENCES, env);
    clearSeasonalTheme(env);
    expect(adopted).toEqual([foreign]);
  });
});

describe('loadSeasonalTheme: falha fechada para o tema padrão', () => {
  it('aplica o tema entregue pelo BFF', async () => {
    const { env, adopted } = makeEnv();
    const result = await loadSeasonalTheme(() => Promise.resolve(response(christmas)), { env });
    expect(result).toEqual({ applied: true });
    expect(adopted).toHaveLength(1);
    expect(getActiveTheme()?.id).toBe('christmas-2026');
  });

  it('"sem tema" deixa o padrão', async () => {
    const { env } = makeEnv();
    expect(await loadSeasonalTheme(() => Promise.resolve(response(null)), { env })).toEqual({
      applied: false,
      reason: 'none',
    });
    expect(getActiveTheme()).toBeNull();
  });

  it.each([
    ['rede fora', () => Promise.reject(new Error('rede'))],
    ['JSON malformado', () => Promise.resolve('não é objeto')],
    ['contrato futuro', () => Promise.resolve({ contract: 2, theme: null })],
    [
      'token protegido',
      () =>
        Promise.resolve(
          response({
            ...christmas,
            tokens: { 'color-error': { light: '#000000', dark: '#ffffff' } },
          } as never),
        ),
    ],
  ])('%s: tema padrão, sem lançar', async (_name, fetchTheme) => {
    const { env, adopted } = makeEnv();
    const result = await loadSeasonalTheme(fetchTheme, { env });
    expect(result.applied).toBe(false);
    expect(adopted).toHaveLength(0);
  });

  it('busca que não responde no prazo vira tema padrão', async () => {
    const { env } = makeEnv();
    const never = () => new Promise<unknown>(() => undefined);
    const result = await loadSeasonalTheme(never, { env, timeoutMs: 20 });
    expect(result).toEqual({ applied: false, reason: 'none' });
  });

  it('entrega um AbortSignal à busca', async () => {
    const { env } = makeEnv();
    let received: unknown;
    await loadSeasonalTheme(
      (signal) => {
        received = signal;
        return Promise.resolve(response(null));
      },
      { env },
    );
    expect(received).toBeInstanceOf(AbortSignal);
  });
});

describe('preferências × tema sazonal', () => {
  it('desligar e religar a opção reaplica o mesmo tema (não perde o carregado)', async () => {
    const { env, adopted } = makeEnv();
    await loadSeasonalTheme(() => Promise.resolve(response(christmas)), { env });
    const stop = watchPreferencesForSeasonalTheme(env);

    act(() => {
      setPreferences({ seasonal: 'off' });
    });
    expect(adopted).toHaveLength(0);
    expect(getActiveTheme()).toBeNull();

    act(() => {
      setPreferences({ seasonal: 'on' });
    });
    expect(adopted).toHaveLength(1);
    expect(getActiveTheme()?.id).toBe('christmas-2026');
    stop();
  });

  it('sem tema carregado, mudar preferência não faz nada', async () => {
    const { env, adopted } = makeEnv();
    await loadSeasonalTheme(() => Promise.resolve(response(null)), { env });
    const stop = watchPreferencesForSeasonalTheme(env);
    act(() => {
      setPreferences({ seasonal: 'off' });
    });
    expect(adopted).toHaveLength(0);
    stop();
  });

  it('useActiveSeasonalTheme expõe banner e logo à casca', async () => {
    const { env } = makeEnv();
    const { result } = renderHook(() => useActiveSeasonalTheme());
    expect(result.current).toBeNull();
    await act(async () => {
      await loadSeasonalTheme(() => Promise.resolve(response(christmas)), { env });
    });
    expect(result.current?.assets.banner).toBe('/bff/theme/assets/christmas-2026/banner.webp');
  });
});
