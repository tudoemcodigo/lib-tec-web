import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';

/**
 * Textos próprios dos componentes (rótulos de acessibilidade e botões). pt-BR é o padrão (FRT-PKG-06); o sistema troca o idioma
 * ou sobrescreve qualquer chave pelo `UiProvider`, normalmente com o catálogo do pacote i18n (`mergeCatalogs`).
 */
export const uiMessages = {
  'pt-BR': {
    'ui.alert.dismiss': 'Dispensar aviso',
    'ui.toast.region': 'Notificações',
    'ui.toast.dismiss': 'Fechar notificação',
    'ui.toast.success': 'Sucesso',
    'ui.toast.info': 'Informação',
    'ui.toast.warning': 'Atenção',
    'ui.toast.error': 'Erro',
    'ui.tone.success': 'Sucesso',
    'ui.tone.info': 'Informação',
    'ui.tone.warning': 'Atenção',
    'ui.tone.error': 'Erro',
    'ui.error.retry': 'Tentar novamente',
    'ui.error.support': 'Se o problema continuar, informe este código ao suporte:',
    'ui.error.copy': 'Copiar código',
    'ui.error.copied': 'Código copiado',
    'ui.loading': 'Carregando…',
    'ui.busy': 'Processando…',
    'ui.palette.title': 'Paleta de comandos',
    'ui.palette.label': 'Comando',
    'ui.palette.placeholder': 'Digite uma página ou ação',
    'ui.palette.empty': 'Nenhum comando encontrado.',
    'ui.palette.one': '{count} comando',
    'ui.palette.other': '{count} comandos',
    'ui.breadcrumb': 'Você está em',
    'ui.back': 'Voltar',
    'ui.confirm.cancel': 'Cancelar',
    'ui.confirm.pending': 'Aguarde…',
    'ui.form.required': '(obrigatório)',
    'ui.form.requiredLegend': 'Campos marcados com * são obrigatórios.',
    'ui.form.errorSummary': 'Corrija os campos abaixo para continuar',
    'ui.scroll.region': 'Tabela com rolagem',
    'ui.sheet.close': 'Fechar painel',
    'ui.pagination.label': 'Paginação',
    'ui.pagination.previous': 'Anterior',
    'ui.pagination.next': 'Próxima',
    'ui.pagination.pageSize': 'Registros por página',
    'ui.pagination.page': 'Página {page}',
    'ui.pagination.none': 'Nenhum registro',
    'ui.pagination.one': '{count} registro',
    'ui.pagination.other': '{count} registros',
  },
  en: {
    'ui.alert.dismiss': 'Dismiss notice',
    'ui.toast.region': 'Notifications',
    'ui.toast.dismiss': 'Close notification',
    'ui.toast.success': 'Success',
    'ui.toast.info': 'Information',
    'ui.toast.warning': 'Warning',
    'ui.toast.error': 'Error',
    'ui.tone.success': 'Success',
    'ui.tone.info': 'Information',
    'ui.tone.warning': 'Warning',
    'ui.tone.error': 'Error',
    'ui.error.retry': 'Try again',
    'ui.error.support': 'If the problem continues, give this code to support:',
    'ui.error.copy': 'Copy code',
    'ui.error.copied': 'Code copied',
    'ui.loading': 'Loading…',
    'ui.busy': 'Working…',
    'ui.palette.title': 'Command palette',
    'ui.palette.label': 'Command',
    'ui.palette.placeholder': 'Type a page or action',
    'ui.palette.empty': 'No commands found.',
    'ui.palette.one': '{count} command',
    'ui.palette.other': '{count} commands',
    'ui.breadcrumb': 'You are here',
    'ui.back': 'Back',
    'ui.confirm.cancel': 'Cancel',
    'ui.confirm.pending': 'Please wait…',
    'ui.form.required': '(required)',
    'ui.form.requiredLegend': 'Fields marked with * are required.',
    'ui.form.errorSummary': 'Fix the fields below to continue',
    'ui.scroll.region': 'Scrollable table',
    'ui.sheet.close': 'Close panel',
    'ui.pagination.label': 'Pagination',
    'ui.pagination.previous': 'Previous',
    'ui.pagination.next': 'Next',
    'ui.pagination.pageSize': 'Records per page',
    'ui.pagination.page': 'Page {page}',
    'ui.pagination.none': 'No records',
    'ui.pagination.one': '{count} record',
    'ui.pagination.other': '{count} records',
  },
} as const;

export type UiMessageKey = keyof (typeof uiMessages)['pt-BR'];
export type UiMessages = Readonly<Partial<Record<UiMessageKey, string>>>;

const DEFAULT_LOCALE = 'pt-BR';

const TextContext = createContext<UiMessages>(uiMessages[DEFAULT_LOCALE]);
const LocaleContext = createContext<string>(DEFAULT_LOCALE);

export interface UiProviderProps {
  /** Idioma dos textos padrão do pacote. Idioma sem catálogo cai em pt-BR. */
  readonly locale?: string;
  /** Sobrescreve chaves (por exemplo, com o catálogo do sistema). */
  readonly messages?: UiMessages;
  readonly children: ReactNode;
}

/** Define idioma e sobrescritas dos textos dos componentes; sem ele, valem os textos em pt-BR. */
export function UiProvider({ locale = DEFAULT_LOCALE, messages, children }: UiProviderProps) {
  const base: UiMessages = Object.hasOwn(uiMessages, locale)
    ? uiMessages[locale as keyof typeof uiMessages]
    : uiMessages[DEFAULT_LOCALE];
  const value = useMemo<UiMessages>(() => ({ ...base, ...messages }), [base, messages]);
  return createElement(
    LocaleContext.Provider,
    { value: locale },
    createElement(TextContext.Provider, { value }, children),
  );
}

/** Texto do componente para a chave; chave sem texto devolve o pt-BR padrão, nunca vazio. */
export function useUiText(): (key: UiMessageKey) => string {
  const messages = useContext(TextContext);
  return (key) => messages[key] ?? uiMessages[DEFAULT_LOCALE][key];
}

/** Idioma do `UiProvider` (padrão pt-BR), para formatar números com o locale certo. */
export function useUiLocale(): string {
  return useContext(LocaleContext);
}

/** Texto com `{nome}` trocado pelos valores (sem ICU: os textos do pacote só interpolam). */
export function fillUiText(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replaceAll(/\{(\w+)\}/g, (inteiro, nome: string) =>
    Object.hasOwn(values, nome) ? String(values[nome]) : inteiro,
  );
}
