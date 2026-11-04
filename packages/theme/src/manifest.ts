import { isTokenName, type ColorPair, type TokenName } from './palette.js';

/**
 * Manifesto de tema sazonal: JSON de esquema FECHADO (FRT-TEM-01). Campo desconhecido, tipo errado ou valor fora
 * do formato recusa o manifesto inteiro. A fonte da verdade é `schema/themes.schema.json`; os casos de
 * `test/cases/themes-cases.json` são compartilhados com a validação em C# do `TEC.Bff` (FRT-TEM-07).
 * As mensagens de erro nunca repetem o valor recebido.
 */
export const CONTRACT_VERSION = 1;
export const MAX_THEMES = 64;
export const ANIMATIONS = ['none', 'snow'] as const;
export type SeasonalAnimation = (typeof ANIMATIONS)[number];

export interface ThemeAssets {
  readonly banner?: string;
  readonly logo?: string;
}

export type ThemeTokens = Readonly<Partial<Record<TokenName, ColorPair>>>;

/** Tema como publicado no repositório `themes`: janela de datas e nomes de arquivo de asset. */
export interface SeasonalTheme {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly tokens: ThemeTokens;
  readonly assets: ThemeAssets;
  readonly animation: SeasonalAnimation;
}

export interface ThemesDocument {
  readonly contract: typeof CONTRACT_VERSION;
  readonly themes: readonly SeasonalTheme[];
}

/** Tema ativo como o BFF entrega à SPA: sem janela e com os assets já como URLs da mesma origem. */
export interface ActiveTheme {
  readonly id: string;
  readonly tokens: ThemeTokens;
  readonly assets: ThemeAssets;
  readonly animation: SeasonalAnimation;
}

export interface ActiveThemeResponse {
  readonly contract: typeof CONTRACT_VERSION;
  readonly theme: ActiveTheme | null;
}

export type ParseResult<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR = /^#[0-9a-fA-F]{6}$/;
const ASSET_FILE = /^(?!.*\.\.)[a-z0-9][a-z0-9._-]{0,63}\.(png|webp|avif)$/;
const ASSET_URL =
  /^\/bff\/theme\/assets\/[a-z0-9][a-z0-9-]{0,63}\/(?!.*\.\.)[a-z0-9][a-z0-9._-]{0,63}\.(png|webp|avif)$/;
const ASSET_KEYS = ['banner', 'logo'] as const;

const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });
const ok = <T>(value: T): { ok: true; value: T } => ({ ok: true, value });

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value) as unknown;
  return proto === Object.prototype || proto === null;
}

/** Devolve a chave que não está na lista permitida, ou `null` se todas estão. */
function unknownKey(value: Record<string, unknown>, allowed: readonly string[]): string | null {
  return Object.keys(value).find((key) => !allowed.includes(key)) ?? null;
}

/** Data de calendário real (`2026-02-30` não existe). */
export function isRealDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const [year = 0, month = 0, day = 0] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function parseTokens(value: unknown, path: string): ParseResult<ThemeTokens> {
  if (!isPlainObject(value)) return fail(`${path}: deve ser um objeto`);
  const tokens: Partial<Record<TokenName, ColorPair>> = {};
  for (const [name, pair] of Object.entries(value)) {
    if (!isTokenName(name)) return fail(`${path}: token desconhecido ou protegido`);
    if (!isPlainObject(pair) || unknownKey(pair, ['light', 'dark']) !== null) {
      return fail(`${path}.${name}: deve ter somente light e dark`);
    }
    const { light, dark } = pair;
    if (
      typeof light !== 'string' ||
      typeof dark !== 'string' ||
      !COLOR.test(light) ||
      !COLOR.test(dark)
    ) {
      return fail(`${path}.${name}: cor deve ser #rrggbb`);
    }
    tokens[name] = { light: light.toLowerCase(), dark: dark.toLowerCase() };
  }
  return ok(tokens);
}

function parseAssets(value: unknown, path: string, pattern: RegExp): ParseResult<ThemeAssets> {
  if (value === undefined) return ok({});
  if (!isPlainObject(value)) return fail(`${path}: deve ser um objeto`);
  if (unknownKey(value, ASSET_KEYS) !== null) return fail(`${path}: asset desconhecido`);
  const assets: { banner?: string; logo?: string } = {};
  for (const key of ASSET_KEYS) {
    const asset = value[key];
    if (asset === undefined) continue;
    if (typeof asset !== 'string' || !pattern.test(asset))
      return fail(`${path}.${key}: arquivo inválido`);
    assets[key] = asset;
  }
  return ok(assets);
}

function parseAnimation(value: unknown, path: string): ParseResult<SeasonalAnimation> {
  if (value === undefined) return ok('none');
  if (typeof value !== 'string' || !(ANIMATIONS as readonly string[]).includes(value)) {
    return fail(`${path}: animação desconhecida`);
  }
  return ok(value as SeasonalAnimation);
}

function parseId(value: unknown, path: string): ParseResult<string> {
  return typeof value === 'string' && ID.test(value) ? ok(value) : fail(`${path}: id inválido`);
}

function parseSource(value: unknown, path: string): ParseResult<SeasonalTheme> {
  if (!isPlainObject(value)) return fail(`${path}: deve ser um objeto`);
  if (unknownKey(value, ['id', 'from', 'to', 'tokens', 'assets', 'animation']) !== null) {
    return fail(`${path}: campo desconhecido`);
  }
  const id = parseId(value.id, `${path}.id`);
  if (!id.ok) return id;
  const { from, to } = value;
  if (typeof from !== 'string' || typeof to !== 'string' || !isRealDate(from) || !isRealDate(to)) {
    return fail(`${path}: from e to devem ser datas AAAA-MM-DD reais`);
  }
  if (from > to) return fail(`${path}: from não pode ser depois de to`);
  const tokens = parseTokens(value.tokens, `${path}.tokens`);
  if (!tokens.ok) return tokens;
  const assets = parseAssets(value.assets, `${path}.assets`, ASSET_FILE);
  if (!assets.ok) return assets;
  const animation = parseAnimation(value.animation, `${path}.animation`);
  if (!animation.ok) return animation;
  return ok({
    id: id.value,
    from,
    to,
    tokens: tokens.value,
    assets: assets.value,
    animation: animation.value,
  });
}

/** Valida o documento publicado no repositório `themes` (contrato, limites, ids únicos). */
export function parseThemesDocument(input: unknown): ParseResult<ThemesDocument> {
  if (!isPlainObject(input)) return fail('documento: deve ser um objeto');
  if (unknownKey(input, ['contract', 'themes']) !== null)
    return fail('documento: campo desconhecido');
  if (input.contract !== CONTRACT_VERSION) return fail('documento: contract não suportado');
  const raw = input.themes;
  if (!Array.isArray(raw)) return fail('themes: deve ser uma lista');
  if (raw.length > MAX_THEMES) return fail(`themes: no máximo ${String(MAX_THEMES)} temas`);
  const themes: SeasonalTheme[] = [];
  const ids = new Set<string>();
  for (const [index, item] of (raw as unknown[]).entries()) {
    const parsed = parseSource(item, `themes[${String(index)}]`);
    if (!parsed.ok) return parsed;
    if (ids.has(parsed.value.id)) return fail(`themes[${String(index)}]: id duplicado`);
    ids.add(parsed.value.id);
    themes.push(parsed.value);
  }
  return ok({ contract: CONTRACT_VERSION, themes });
}

/**
 * Escolhe o tema ativo na data `today` (AAAA-MM-DD, fuso America/Sao_Paulo calculado por quem chama): janela
 * inclusiva; com sobreposição vence o de início mais recente e, no empate, o de menor id (FRT-TEM-06).
 */
export function selectActiveTheme(document: ThemesDocument, today: string): SeasonalTheme | null {
  if (!isRealDate(today)) return null;
  const candidates = document.themes
    .filter((theme) => theme.from <= today && today <= theme.to)
    .sort((a, b) =>
      a.from === b.from ? a.id.localeCompare(b.id, 'en') : b.from.localeCompare(a.from, 'en'),
    );
  return candidates[0] ?? null;
}

/** Converte o tema publicado no que o BFF entrega: assets viram URLs da mesma origem (FRT-TEM-05). */
export function toActiveTheme(theme: SeasonalTheme): ActiveTheme {
  const assets: { banner?: string; logo?: string } = {};
  for (const key of ASSET_KEYS) {
    const file = theme.assets[key];
    if (file !== undefined) assets[key] = `/bff/theme/assets/${theme.id}/${file}`;
  }
  return { id: theme.id, tokens: theme.tokens, assets, animation: theme.animation };
}

/** Valida a resposta do BFF na SPA: o mesmo rigor, com assets como URLs da mesma origem. */
export function parseActiveThemeResponse(input: unknown): ParseResult<ActiveThemeResponse> {
  if (!isPlainObject(input)) return fail('resposta: deve ser um objeto');
  if (unknownKey(input, ['contract', 'theme']) !== null)
    return fail('resposta: campo desconhecido');
  if (input.contract !== CONTRACT_VERSION) return fail('resposta: contract não suportado');
  const raw = input.theme;
  if (raw === null) return ok({ contract: CONTRACT_VERSION, theme: null });
  if (!isPlainObject(raw)) return fail('theme: deve ser um objeto ou null');
  if (unknownKey(raw, ['id', 'tokens', 'assets', 'animation']) !== null)
    return fail('theme: campo desconhecido');
  const id = parseId(raw.id, 'theme.id');
  if (!id.ok) return id;
  const tokens = parseTokens(raw.tokens, 'theme.tokens');
  if (!tokens.ok) return tokens;
  const assets = parseAssets(raw.assets, 'theme.assets', ASSET_URL);
  if (!assets.ok) return assets;
  const prefix = `/bff/theme/assets/${id.value}/`;
  const urls = [assets.value.banner, assets.value.logo];
  if (urls.some((url) => url !== undefined && !url.startsWith(prefix))) {
    return fail('theme.assets: o asset deve pertencer ao próprio tema');
  }
  const animation = parseAnimation(raw.animation, 'theme.animation');
  if (!animation.ok) return animation;
  const theme: ActiveTheme = {
    id: id.value,
    tokens: tokens.value,
    assets: assets.value,
    animation: animation.value,
  };
  return ok({ contract: CONTRACT_VERSION, theme });
}
