/**
 * Formatadores com locale SEMPRE explícito (FRT-ACE-09; `toLocaleString()` sem argumento é erro de lint). Instantes chegam em UTC
 * e aparecem no fuso da pessoa; data sem hora (`AAAA-MM-DD`) é formatada em UTC para nunca recuar um dia pelo fuso.
 */
export interface Formatters {
  readonly locale: string;
  formatNumber(value: number): string;
  formatCurrency(value: number, currency: string): string;
  /** Instante ISO 8601 (com fuso) mostrado no fuso da pessoa; inválido devolve texto vazio. */
  formatDateTime(instant: string): string;
  /** Data `AAAA-MM-DD`; inválida (formato ou calendário) devolve texto vazio. */
  formatDate(isoDate: string): string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function createFormatters(locale: string): Formatters {
  const number = new Intl.NumberFormat(locale);
  const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeZone: 'UTC' });
  const currencies = new Map<string, Intl.NumberFormat>();

  return {
    locale,
    formatNumber: (value) => number.format(value),
    formatCurrency(value, currency) {
      let format = currencies.get(currency);
      if (format === undefined) {
        format = new Intl.NumberFormat(locale, { style: 'currency', currency });
        currencies.set(currency, format);
      }
      return format.format(value);
    },
    formatDateTime(instant) {
      const parsed = new Date(instant);
      return Number.isNaN(parsed.getTime()) ? '' : dateTime.format(parsed);
    },
    formatDate(isoDate) {
      if (!ISO_DATE.test(isoDate)) return '';
      const parsed = new Date(`${isoDate}T00:00:00Z`);
      // 2026-02-30 vira 2 de março no Date: só vale se o dia voltar igual
      return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== isoDate
        ? ''
        : date.format(parsed);
    },
  };
}
