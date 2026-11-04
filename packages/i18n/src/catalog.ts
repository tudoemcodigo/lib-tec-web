import type { Catalogs, Messages } from './translator.js';

/**
 * Junta catálogos de vários pacotes e do sistema (`ui`, `shell`, o próprio sistema...). Chave repetida com TEXTO DIFERENTE no
 * mesmo idioma é conflito e lança: dois donos para a mesma chave é defeito, não preferência (falha na subida, não na tela).
 */
export function mergeCatalogs(...catalogs: readonly Catalogs[]): Catalogs {
  const merged: Record<string, Record<string, string>> = {};
  for (const catalog of catalogs) {
    for (const [locale, messages] of Object.entries(catalog)) {
      const target = (merged[locale] ??= {});
      for (const [key, text] of Object.entries(messages)) {
        if (Object.hasOwn(target, key) && target[key] !== text) {
          throw new Error(
            `Conflito de catálogo: a chave "${key}" tem textos diferentes em "${locale}".`,
          );
        }
        target[key] = text;
      }
    }
  }
  return merged;
}

/** Chaves que o idioma padrão tem e o outro idioma não (para o teste do sistema falhar antes da tela). */
export function missingKeys(reference: Messages, other: Messages): string[] {
  return Object.keys(reference).filter((key) => !Object.hasOwn(other, key));
}
