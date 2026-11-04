import { useSyncExternalStore } from 'react';

/**
 * Preferências de exibição da pessoa: tema, tamanho do texto, contraste, movimento, atalhos e tema sazonal.
 *
 * É o ÚNICO lugar que escreve em `localStorage` (FRT-SEG-16): uma chave, campos de valor fechado, validados ao
 * ler e ao gravar. Nenhum dado pessoal, token ou identificador entra aqui (FRT-SEG-01).
 */
export const THEMES = ['system', 'light', 'dark'] as const;
export const TEXT_SIZES = ['default', 'large', 'larger'] as const;
export const CONTRASTS = ['default', 'high'] as const;
export const MOTIONS = ['system', 'reduced'] as const;
export const SEASONALS = ['on', 'off'] as const;

export interface Preferences {
  readonly theme: (typeof THEMES)[number];
  readonly textSize: (typeof TEXT_SIZES)[number];
  readonly contrast: (typeof CONTRASTS)[number];
  readonly motion: (typeof MOTIONS)[number];
  /** Atalhos de uma tecla só valem se a pessoa puder desligá-los (WCAG 2.1.4). */
  readonly shortcuts: boolean;
  /** `off` recusa qualquer tema sazonal (FRT-TEM-04). */
  readonly seasonal: (typeof SEASONALS)[number];
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  textSize: 'default',
  contrast: 'default',
  motion: 'system',
  shortcuts: true,
  seasonal: 'on',
};

export const PREFERENCES_STORAGE_KEY = 'tec.preferences.v1';
const MAX_STORED_LENGTH = 512;

const ENUMS = {
  theme: THEMES,
  textSize: TEXT_SIZES,
  contrast: CONTRASTS,
  motion: MOTIONS,
  seasonal: SEASONALS,
} as const;

type EnumKey = keyof typeof ENUMS;

function isAllowed(key: EnumKey, value: unknown): boolean {
  return (ENUMS[key] as readonly unknown[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Tolerante: cada campo inválido cai no padrão, sem derrubar os outros; campo extra é descartado. */
function parseTolerant(value: unknown): Preferences {
  if (!isRecord(value)) return DEFAULT_PREFERENCES;
  const pick = <K extends EnumKey>(key: K): Preferences[K] =>
    (Object.hasOwn(value, key) && isAllowed(key, value[key])
      ? value[key]
      : DEFAULT_PREFERENCES[key]) as Preferences[K];
  return {
    theme: pick('theme'),
    textSize: pick('textSize'),
    contrast: pick('contrast'),
    motion: pick('motion'),
    shortcuts:
      Object.hasOwn(value, 'shortcuts') && typeof value.shortcuts === 'boolean'
        ? value.shortcuts
        : DEFAULT_PREFERENCES.shortcuts,
    seasonal: pick('seasonal'),
  };
}

/** Estrito: qualquer campo fora do conjunto recusa a mudança inteira (devolve `null`). */
function parseStrict(value: Record<string, unknown>): Preferences | null {
  for (const key of Object.keys(ENUMS) as EnumKey[]) {
    if (!isAllowed(key, value[key])) return null;
  }
  if (typeof value.shortcuts !== 'boolean') return null;
  return parseTolerant(value);
}

/** Lê e valida o que está guardado; qualquer falha (sem armazenamento, texto grande, JSON ruim) devolve o padrão. */
export function readPreferences(): Preferences {
  try {
    const text = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (text === null || text.length > MAX_STORED_LENGTH) return DEFAULT_PREFERENCES;
    return parseTolerant(JSON.parse(text));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writePreferences(preferences: Preferences): void {
  try {
    // eslint-disable-next-line no-restricted-syntax -- única escrita permitida em storage: preferência não sensível (FRT-SEG-16)
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Sem armazenamento (modo privado, cota): a preferência vale só nesta visita
  }
}

/** Reflete as preferências em atributos do `<html>`, que o CSS lê; o valor neutro remove o atributo. */
export function applyPreferences(
  preferences: Preferences,
  root: HTMLElement = document.documentElement,
): void {
  const set = (name: string, value: string, neutral: string) => {
    if (value === neutral) root.removeAttribute(`data-${name}`);
    else root.setAttribute(`data-${name}`, value);
  };
  set('theme', preferences.theme, 'system');
  set('text-size', preferences.textSize, 'default');
  set('contrast', preferences.contrast, 'default');
  set('motion', preferences.motion, 'system');
}

let current: Preferences = DEFAULT_PREFERENCES;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

/** Estado atual (para quem não usa React). */
export function getPreferences(): Preferences {
  return current;
}

/** Lê o armazenamento, aplica no documento e passa a valer como estado atual. Chame antes de renderizar. */
export function initPreferences(): Preferences {
  current = readPreferences();
  applyPreferences(current);
  notify();
  return current;
}

/** Aplica uma mudança parcial. Valor fora do conjunto: nada muda. Devolve `true` se mudou. */
export function setPreferences(change: Partial<Preferences>): boolean {
  const next = parseStrict({ ...current, ...change });
  if (next === null) return false;
  current = next;
  applyPreferences(current);
  writePreferences(current);
  notify();
  return true;
}

/** Assina mudanças das preferências; devolve a função que cancela. */
export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribePreferences, getPreferences);
}
