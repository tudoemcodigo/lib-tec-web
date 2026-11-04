import { IntlMessageFormat } from 'intl-messageformat';

/**
 * Tradutor de mensagens de interface (FRT-ACE-08/09): ICU MessageFormat (plural, seleção), locale sempre explícito e nenhum
 * HTML interpretado. Texto de interface vem de um catálogo, nunca solto no JSX.
 */
export type Messages = Readonly<Record<string, string>>;
export type Values = Readonly<Record<string, string | number>>;

/** Catálogos por idioma: `{ 'pt-BR': {...}, en: {...} }`. */
export type Catalogs = Readonly<Record<string, Messages>>;

export interface Translator<K extends string = string> {
  readonly locale: string;
  /** Traduz a chave. Chave ausente ou mensagem ICU inválida devolve a própria chave (nunca lança). */
  t(key: K, values?: Values): string;
  has(key: string): boolean;
}

export interface TranslatorOptions<M extends Messages> {
  readonly locale: string;
  readonly messages: M;
  /** Catálogo do idioma padrão, usado para chave que falta em `messages`. */
  readonly fallbackMessages?: Messages;
  /** Chamado uma vez por chave ausente (telemetria/log do sistema). Não recebe valores. */
  readonly onMissing?: (key: string) => void;
}

/** Cria um tradutor para um idioma. Os formatadores ICU são compilados sob demanda e reaproveitados. */
export function createTranslator<M extends Messages>(
  options: TranslatorOptions<M>,
): Translator<Extract<keyof M, string>> {
  const { locale, messages, fallbackMessages, onMissing } = options;
  const compiled = new Map<string, IntlMessageFormat | null>();
  const reported = new Set<string>();

  const lookup = (key: string): string | undefined =>
    Object.hasOwn(messages, key)
      ? messages[key]
      : fallbackMessages && Object.hasOwn(fallbackMessages, key)
        ? fallbackMessages[key]
        : undefined;

  const missing = (key: string): string => {
    if (!reported.has(key)) {
      reported.add(key);
      onMissing?.(key);
    }
    return key;
  };

  return {
    locale,
    has: (key) => lookup(key) !== undefined,
    t(key, values) {
      const source = lookup(key);
      if (source === undefined) return missing(key);
      let formatter = compiled.get(key);
      if (formatter === undefined) {
        try {
          formatter = new IntlMessageFormat(source, locale);
        } catch {
          formatter = null;
        }
        compiled.set(key, formatter);
      }
      if (formatter === null) return missing(key);
      try {
        const result = formatter.format(values);
        return typeof result === 'string' ? result : String(result);
      } catch {
        // Valor faltando para um placeholder: a chave aparece em vez de derrubar a tela
        return missing(key);
      }
    },
  };
}
