// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  applyPreferences,
  getPreferences,
  initPreferences,
  readPreferences,
  setPreferences,
  usePreferences,
} from '../src/preferences.js';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  initPreferences();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('readPreferences', () => {
  it('sem nada guardado, devolve o padrão', () => {
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('lê o que foi guardado', () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: 'dark',
        textSize: 'large',
        contrast: 'high',
        motion: 'reduced',
        shortcuts: false,
        seasonal: 'off',
      }),
    );
    expect(readPreferences()).toEqual({
      theme: 'dark',
      textSize: 'large',
      contrast: 'high',
      motion: 'reduced',
      shortcuts: false,
      seasonal: 'off',
    });
  });

  it('valor inválido num campo não derruba os outros e campo extra é descartado', () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: 'neon',
        textSize: 'larger',
        contrast: 7,
        shortcuts: 'sim',
        token: 'segredo',
      }),
    );
    expect(readPreferences()).toEqual({ ...DEFAULT_PREFERENCES, textSize: 'larger' });
  });

  it.each([
    ['JSON malformado', '{nao-e-json'],
    ['lista', '[1,2]'],
    ['texto', '"dark"'],
    ['null', 'null'],
    ['texto gigante', JSON.stringify({ theme: 'dark', pad: 'x'.repeat(600) })],
  ])('armazenamento hostil devolve o padrão: %s', (_name, stored) => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, stored);
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('armazenamento indisponível devolve o padrão', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('chave herdada do protótipo não vale (__proto__)', () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, '{"__proto__":{"theme":"dark"}}');
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
  });
});

describe('setPreferences e applyPreferences', () => {
  it('grava só a chave permitida e reflete no documento', () => {
    expect(
      setPreferences({ theme: 'dark', textSize: 'larger', contrast: 'high', motion: 'reduced' }),
    ).toBe(true);
    const root = document.documentElement;
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.getAttribute('data-text-size')).toBe('larger');
    expect(root.getAttribute('data-contrast')).toBe('high');
    expect(root.getAttribute('data-motion')).toBe('reduced');
    expect(localStorage.length).toBe(1);
    expect(
      Object.keys(
        JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}') as object,
      ).sort(),
    ).toEqual(['contrast', 'motion', 'seasonal', 'shortcuts', 'textSize', 'theme']);
  });

  it('voltar ao padrão remove os atributos', () => {
    setPreferences({ theme: 'dark', textSize: 'large' });
    setPreferences({ theme: 'system', textSize: 'default' });
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(document.documentElement.hasAttribute('data-text-size')).toBe(false);
  });

  it('valor fora do conjunto é recusado e o estado não muda', () => {
    const before = getPreferences();
    expect(setPreferences({ theme: 'neon' as never })).toBe(false);
    expect(setPreferences({ shortcuts: 'sim' as never })).toBe(false);
    expect(setPreferences({ seasonal: 'talvez' as never })).toBe(false);
    expect(getPreferences()).toBe(before);
    expect(localStorage.getItem(PREFERENCES_STORAGE_KEY)).toBeNull();
  });

  it('falha ao gravar não derruba: a preferência vale na visita', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cota');
    });
    expect(setPreferences({ theme: 'dark' })).toBe(true);
    expect(getPreferences().theme).toBe('dark');
  });

  it('aplica em outra raiz sem tocar a do documento', () => {
    const other = document.createElement('html');
    applyPreferences({ ...DEFAULT_PREFERENCES, theme: 'light' }, other);
    expect(other.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

describe('usePreferences', () => {
  it('re-renderiza quando a preferência muda', () => {
    const { result } = renderHook(() => usePreferences());
    expect(result.current.theme).toBe('system');
    act(() => {
      setPreferences({ theme: 'dark' });
    });
    expect(result.current.theme).toBe('dark');
  });
});
