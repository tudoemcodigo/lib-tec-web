/**
 * Escolha do idioma: do que a pessoa pede (preferência do navegador) para o que o sistema suporta. Casa exato (`pt-BR`), depois
 * pelo idioma base (`pt` casa `pt-BR`), e cai no padrão. Entrada hostil (texto enorme, lixo) nunca lança.
 */
const MAX_TAG_LENGTH = 35;
const MAX_REQUESTED = 20;

export function resolveLocale(
  requested: readonly string[],
  supported: readonly string[],
  fallback: string,
): string {
  const normalized = new Map(supported.map((locale) => [locale.toLowerCase(), locale]));
  const byLanguage = new Map<string, string>();
  for (const locale of supported) {
    const language = locale.toLowerCase().split('-')[0] ?? '';
    if (!byLanguage.has(language)) byLanguage.set(language, locale);
  }

  for (const tag of requested.slice(0, MAX_REQUESTED)) {
    if (typeof tag !== 'string' || tag.length === 0 || tag.length > MAX_TAG_LENGTH) continue;
    const lower = tag.toLowerCase();
    const exact = normalized.get(lower);
    if (exact !== undefined) return exact;
    const language = byLanguage.get(lower.split('-')[0] ?? '');
    if (language !== undefined) return language;
  }
  return fallback;
}
