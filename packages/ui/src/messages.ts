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
    'ui.breadcrumb': 'Você está em',
    'ui.back': 'Voltar',
    'ui.confirm.cancel': 'Cancelar',
    'ui.confirm.pending': 'Aguarde…',
    'ui.form.required': '(obrigatório)',
    'ui.form.errorSummary': 'Corrija os campos abaixo para continuar',
    'ui.scroll.region': 'Tabela com rolagem',
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
    'ui.breadcrumb': 'You are here',
    'ui.back': 'Back',
    'ui.confirm.cancel': 'Cancel',
    'ui.confirm.pending': 'Please wait…',
    'ui.form.required': '(required)',
    'ui.form.errorSummary': 'Fix the fields below to continue',
    'ui.scroll.region': 'Scrollable table',
  },
} as const;

export type UiMessageKey = keyof (typeof uiMessages)['pt-BR'];
export type UiMessages = Readonly<Partial<Record<UiMessageKey, string>>>;

const DEFAULT_LOCALE = 'pt-BR';

const TextContext = createContext<UiMessages>(uiMessages[DEFAULT_LOCALE]);

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
  return createElement(TextContext.Provider, { value }, children);
}

/** Texto do componente para a chave; chave sem texto devolve o pt-BR padrão, nunca vazio. */
export function useUiText(): (key: UiMessageKey) => string {
  const messages = useContext(TextContext);
  return (key) => messages[key] ?? uiMessages[DEFAULT_LOCALE][key];
}
