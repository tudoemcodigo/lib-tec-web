import { useSyncExternalStore } from 'react';
import { findContrastViolations } from './contrast.js';
import { parseActiveThemeResponse, type ActiveTheme } from './manifest.js';
import { isTokenName } from './palette.js';
import { getPreferences, subscribePreferences, type Preferences } from './preferences.js';

/**
 * Aplicação do tema sazonal (FRT-TEM-02/03/04). O tema só entra por CSSOM (`adoptedStyleSheets`), nunca por
 * `<style>`, atributo `style` ou HTML, e só depois de validado e de passar no contraste. Qualquer falha deixa a
 * SPA no tema padrão.
 */
export interface SheetLike {
  replaceSync(text: string): void;
}

export interface SeasonalEnvironment {
  readonly root: HTMLElement;
  readonly adoptedStyleSheets: SheetLike[];
  readonly setAdoptedStyleSheets: (sheets: SheetLike[]) => void;
  readonly createSheet: () => SheetLike;
}

export type ApplyResult =
  | { readonly applied: true }
  | { readonly applied: false; readonly reason: 'none' | 'opt-out' | 'contrast' | 'unsupported' };

const COLOR = /^#[0-9a-f]{6}$/;
const sheets = new WeakMap<HTMLElement, SheetLike>();

function browserEnvironment(): SeasonalEnvironment {
  return {
    root: document.documentElement,
    adoptedStyleSheets: document.adoptedStyleSheets,
    setAdoptedStyleSheets: (next) => {
      document.adoptedStyleSheets = next as unknown as CSSStyleSheet[];
    },
    createSheet: () => new CSSStyleSheet(),
  };
}

/** CSS do tema a partir de dados já validados; revalida cada token e cor (defesa em profundidade). */
export function buildSeasonalCss(theme: ActiveTheme): string {
  const declarations = Object.entries(theme.tokens).map(([name, pair]) => {
    if (!isTokenName(name) || !COLOR.test(pair.light) || !COLOR.test(pair.dark)) {
      throw new Error('Token de tema inválido: recusado antes de virar CSS.');
    }
    return `    --tec-${name}: light-dark(${pair.light}, ${pair.dark});`;
  });
  const rule =
    declarations.length === 0
      ? ''
      : `\n  :root:not([data-contrast='high']) {\n${declarations.join('\n')}\n  }`;
  return `@layer tec-tokens, tec-seasonal;\n@layer tec-seasonal {${rule}\n}\n`;
}

/** Remove o tema sazonal do documento. */
export function clearSeasonalTheme(env: SeasonalEnvironment = browserEnvironment()): void {
  const previous = sheets.get(env.root);
  if (previous !== undefined) {
    env.setAdoptedStyleSheets(env.adoptedStyleSheets.filter((sheet) => sheet !== previous));
    sheets.delete(env.root);
  }
  env.root.removeAttribute('data-seasonal');
  env.root.removeAttribute('data-seasonal-animation');
}

/** Aplica (ou remove) o tema; precedência: opção "sem tema" do usuário, contraste, depois o tema (FRT-TEM-04). */
export function applySeasonalTheme(
  theme: ActiveTheme | null,
  preferences: Preferences = getPreferences(),
  env: SeasonalEnvironment = browserEnvironment(),
): ApplyResult {
  clearSeasonalTheme(env);
  if (theme === null) return { applied: false, reason: 'none' };
  if (preferences.seasonal === 'off') return { applied: false, reason: 'opt-out' };
  if (findContrastViolations(theme.tokens).length > 0)
    return { applied: false, reason: 'contrast' };
  try {
    const sheet = env.createSheet();
    sheet.replaceSync(buildSeasonalCss(theme));
    env.setAdoptedStyleSheets([...env.adoptedStyleSheets, sheet]);
    sheets.set(env.root, sheet);
  } catch {
    clearSeasonalTheme(env);
    return { applied: false, reason: 'unsupported' };
  }
  env.root.setAttribute('data-seasonal', theme.id);
  if (theme.animation !== 'none') env.root.setAttribute('data-seasonal-animation', theme.animation);
  return { applied: true };
}

/** O que o servidor entregou (já validado) e o que de fato está aplicado: opt-out ou contraste reprovado separam os dois. */
let loadedTheme: ActiveTheme | null = null;
let appliedTheme: ActiveTheme | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

/** Tema sazonal em vigor, ou `null` (a casca lê banner e logo daqui). */
export function getActiveTheme(): ActiveTheme | null {
  return appliedTheme;
}

export function useActiveSeasonalTheme(): ActiveTheme | null {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, getActiveTheme);
}

function reapply(env?: SeasonalEnvironment): ApplyResult {
  const result = applySeasonalTheme(loadedTheme, getPreferences(), env);
  appliedTheme = result.applied ? loadedTheme : null;
  notify();
  return result;
}

function setLoadedTheme(theme: ActiveTheme | null, env?: SeasonalEnvironment): ApplyResult {
  loadedTheme = theme;
  return reapply(env);
}

export interface LoadOptions {
  /** Prazo total da busca; passado o prazo, fica o tema padrão. */
  readonly timeoutMs?: number;
  readonly env?: SeasonalEnvironment;
}

/**
 * Busca o tema ativo por `fetchTheme` (o cliente HTTP do sistema, FRT-API-02), valida e aplica. Nunca lança:
 * rede fora, timeout, resposta inválida ou contraste reprovado deixam o tema padrão.
 */
export async function loadSeasonalTheme(
  fetchTheme: (signal: AbortSignal) => Promise<unknown>,
  options: LoadOptions = {},
): Promise<ApplyResult> {
  const { timeoutMs = 3000, env } = options;
  try {
    const signal = AbortSignal.timeout(timeoutMs);
    const aborted = new Promise<never>((_resolve, reject) => {
      signal.addEventListener('abort', () => {
        reject(new Error('timeout'));
      });
    });
    const raw = await Promise.race([fetchTheme(signal), aborted]);
    const parsed = parseActiveThemeResponse(raw);
    return setLoadedTheme(parsed.ok ? parsed.value.theme : null, env);
  } catch {
    return setLoadedTheme(null, env);
  }
}

/** Reaplica o tema quando as preferências mudam (opção "sem tema sazonal"). Devolve o cancelamento. */
export function watchPreferencesForSeasonalTheme(env?: SeasonalEnvironment): () => void {
  return subscribePreferences(() => {
    if (loadedTheme !== null) reapply(env);
  });
}
