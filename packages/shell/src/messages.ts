import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import { fillUiText, useUiLocale } from '@tudoemcodigo/ui';

/**
 * Textos próprios da casca. pt-BR é o padrão (FRT-PKG-06); o sistema troca o idioma ou sobrescreve qualquer chave pela
 * propriedade `messages` do `AppShell`. Os textos do sistema (nome, rótulos do menu, busca) entram por props, nunca daqui.
 */
export const shellMessages = {
  'pt-BR': {
    'shell.skip.content': 'Pular para o conteúdo',
    'shell.skip.menu': 'Ir para o menu',
    'shell.skip.search': 'Ir para a busca',
    'shell.nav.main': 'Navegação principal',
    'shell.nav.home': 'Início',
    'shell.nav.help': 'Ajuda',
    'shell.nav.accessibility': 'Acessibilidade',
    'shell.nav.openMenu': 'Abrir menu',
    'shell.nav.closeMenu': 'Fechar menu',
    'shell.nav.collapse': 'Recolher menu',
    'shell.nav.expand': 'Expandir menu',
    'shell.footer.nav': 'Links do rodapé',
    'shell.footer.copyright': '© {year} {app}',
    'shell.footer.version': 'Versão {version}',
    'shell.user.menu': 'Menu do usuário {name}',
    'shell.user.group': 'Conta',
    'shell.user.signOut': 'Sair',
    'shell.backToTop': 'Voltar ao topo',
    'shell.busy': 'Processando…',
    'shell.loading': 'Carregando…',
    'shell.palette.open': 'Abrir paleta de comandos (Ctrl + K)',
    'shell.palette.go': 'Ir para {destination}',
    'shell.palette.group.navigate': 'Navegar',
    'shell.palette.group.actions': 'Ações',
    'shell.palette.keywords.appearance': 'tema escuro contraste texto',
    'shell.appearance.open': 'Aparência e acessibilidade',
    'shell.appearance.title': 'Aparência e acessibilidade',
    'shell.appearance.description': 'Suas escolhas ficam salvas neste navegador.',
    'shell.appearance.theme': 'Tema',
    'shell.appearance.theme.system': 'Padrão do sistema',
    'shell.appearance.theme.light': 'Claro',
    'shell.appearance.theme.dark': 'Escuro',
    'shell.appearance.textSize': 'Tamanho do texto',
    'shell.appearance.textSize.default': 'Padrão',
    'shell.appearance.textSize.large': 'Grande',
    'shell.appearance.textSize.larger': 'Maior',
    'shell.appearance.contrast': 'Contraste',
    'shell.appearance.contrast.default': 'Padrão',
    'shell.appearance.contrast.high': 'Alto contraste',
    'shell.appearance.motion': 'Animações',
    'shell.appearance.motion.system': 'Seguir o sistema',
    'shell.appearance.motion.reduced': 'Reduzir',
    'shell.appearance.seasonal': 'Tema de datas comemorativas',
    'shell.appearance.seasonal.on': 'Mostrar (por exemplo, Natal)',
    'shell.appearance.seasonal.off': 'Não mostrar',
    'shell.appearance.shortcuts': 'Atalhos de teclado',
    'shell.appearance.shortcuts.enable': 'Ativar atalhos de uma tecla',
    'shell.appearance.restore': 'Restaurar o padrão',
    'shell.appearance.close': 'Fechar',
    'shell.profile.menu': 'Meu perfil',
    'shell.profile.title': 'Meu perfil',
    'shell.profile.description': 'Quem você é neste sistema e o que pode fazer nele.',
    'shell.profile.account': 'Conta',
    'shell.profile.name': 'Nome',
    'shell.profile.access': 'Acesso',
    'shell.profile.access.value': 'Login único da empresa',
    'shell.profile.permissions': 'O que você pode fazer',
    'shell.profile.permissions.empty': 'Nenhuma permissão neste sistema.',
    'shell.profile.session': 'Sessão',
    'shell.profile.session.text':
      'Ao sair, você encerra a sessão neste navegador e no login único.',
    'shell.help.title': 'Ajuda',
    'shell.help.navigate.title': 'Como navegar',
    'shell.help.navigate.menu':
      'O menu lateral leva às áreas do sistema. O botão no fim dele recolhe o menu; em telas estreitas, o botão do cabeçalho abre e fecha o menu.',
    'shell.help.navigate.breadcrumb':
      'A trilha logo acima do título mostra onde você está e leva de volta aos níveis acima.',
    'shell.help.navigate.search': 'A busca do cabeçalho procura nos dados do sistema.',
    'shell.help.navigate.account':
      'Seu nome, no canto do cabeçalho, abre o menu da conta, com a aparência, a ajuda e a saída do sistema.',
    'shell.help.shortcuts.title': 'Atalhos de teclado',
    'shell.help.shortcuts.text':
      'Os atalhos de uma tecla não funcionam enquanto você digita em um campo e podem ser desligados em Aparência e acessibilidade.',
    'shell.help.shortcuts.key': 'Tecla',
    'shell.help.shortcuts.action': 'O que faz',
    'shell.help.shortcuts.search': 'Vai para a busca do cabeçalho',
    'shell.help.shortcuts.help': 'Abre esta página de ajuda',
    'shell.help.shortcuts.goto': 'Vai para {destination}',
    'shell.help.shortcuts.palette': 'Abre a paleta de comandos (Cmd + K no Mac)',
    'shell.help.shortcuts.esc': 'Fecha o menu aberto, a janela ou o painel',
    'shell.help.support.title': 'Se algo der errado',
    'shell.help.support.text':
      'Quando um erro mostrar um código de suporte, anote-o e informe à equipe responsável pelo sistema: ele permite encontrar o que aconteceu.',
    'shell.accessibility.title': 'Acessibilidade',
    'shell.accessibility.intro':
      'O sistema segue o nível AA das diretrizes WCAG 2.2 e pode ser usado só com o teclado.',
    'shell.accessibility.features.title': 'Recursos disponíveis',
    'shell.accessibility.features.theme': 'Tema claro, escuro ou o padrão do seu sistema.',
    'shell.accessibility.features.text':
      'Três tamanhos de texto; o layout se adapta sem perder conteúdo.',
    'shell.accessibility.features.contrast':
      'Modo de alto contraste, com texto em pelo menos 9 para 1.',
    'shell.accessibility.features.motion':
      'Opção para reduzir animações, além de respeitar a configuração do sistema.',
    'shell.accessibility.features.keyboard':
      'Links de salto para o conteúdo, o menu e a busca, foco sempre visível e atalhos que podem ser desligados.',
    'shell.accessibility.verified.title': 'O que foi verificado',
    'shell.accessibility.verified.text':
      'Verificação automática com axe em cada tela e estado, nos temas claro, escuro e de alto contraste, sem violações encontradas.',
    'shell.accessibility.limits.title': 'O que ainda não foi verificado',
    'shell.accessibility.limits.text':
      'Teste manual com leitor de tela e revisão por pessoas com deficiência ainda não foram feitos.',
    'shell.accessibility.report.title': 'Encontrou uma barreira?',
    'shell.accessibility.report.text':
      'Informe à equipe responsável pelo sistema a tela, o que tentou fazer e a tecnologia assistiva que usa.',
  },
  en: {
    'shell.skip.content': 'Skip to content',
    'shell.skip.menu': 'Go to the menu',
    'shell.skip.search': 'Go to search',
    'shell.nav.main': 'Main navigation',
    'shell.nav.home': 'Home',
    'shell.nav.help': 'Help',
    'shell.nav.accessibility': 'Accessibility',
    'shell.nav.openMenu': 'Open menu',
    'shell.nav.closeMenu': 'Close menu',
    'shell.nav.collapse': 'Collapse menu',
    'shell.nav.expand': 'Expand menu',
    'shell.footer.nav': 'Footer links',
    'shell.footer.copyright': '© {year} {app}',
    'shell.footer.version': 'Version {version}',
    'shell.user.menu': 'User menu for {name}',
    'shell.user.group': 'Account',
    'shell.user.signOut': 'Sign out',
    'shell.backToTop': 'Back to top',
    'shell.busy': 'Working…',
    'shell.loading': 'Loading…',
    'shell.palette.open': 'Open command palette (Ctrl + K)',
    'shell.palette.go': 'Go to {destination}',
    'shell.palette.group.navigate': 'Navigate',
    'shell.palette.group.actions': 'Actions',
    'shell.palette.keywords.appearance': 'dark theme contrast text',
    'shell.appearance.open': 'Appearance and accessibility',
    'shell.appearance.title': 'Appearance and accessibility',
    'shell.appearance.description': 'Your choices are saved in this browser.',
    'shell.appearance.theme': 'Theme',
    'shell.appearance.theme.system': 'System default',
    'shell.appearance.theme.light': 'Light',
    'shell.appearance.theme.dark': 'Dark',
    'shell.appearance.textSize': 'Text size',
    'shell.appearance.textSize.default': 'Default',
    'shell.appearance.textSize.large': 'Large',
    'shell.appearance.textSize.larger': 'Larger',
    'shell.appearance.contrast': 'Contrast',
    'shell.appearance.contrast.default': 'Default',
    'shell.appearance.contrast.high': 'High contrast',
    'shell.appearance.motion': 'Animations',
    'shell.appearance.motion.system': 'Follow the system',
    'shell.appearance.motion.reduced': 'Reduce',
    'shell.appearance.seasonal': 'Holiday theme',
    'shell.appearance.seasonal.on': 'Show (for example, Christmas)',
    'shell.appearance.seasonal.off': 'Do not show',
    'shell.appearance.shortcuts': 'Keyboard shortcuts',
    'shell.appearance.shortcuts.enable': 'Enable single-key shortcuts',
    'shell.appearance.restore': 'Restore defaults',
    'shell.appearance.close': 'Close',
    'shell.profile.menu': 'My profile',
    'shell.profile.title': 'My profile',
    'shell.profile.description': 'Who you are in this system and what you can do in it.',
    'shell.profile.account': 'Account',
    'shell.profile.name': 'Name',
    'shell.profile.access': 'Access',
    'shell.profile.access.value': 'Company single sign-on',
    'shell.profile.permissions': 'What you can do',
    'shell.profile.permissions.empty': 'No permissions in this system.',
    'shell.profile.session': 'Session',
    'shell.profile.session.text':
      'When you sign out, you end the session in this browser and in single sign-on.',
    'shell.help.title': 'Help',
    'shell.help.navigate.title': 'How to navigate',
    'shell.help.navigate.menu':
      'The side menu leads to the areas of the system. The button at its end collapses the menu; on narrow screens, the header button opens and closes it.',
    'shell.help.navigate.breadcrumb':
      'The trail right above the title shows where you are and leads back to the levels above.',
    'shell.help.navigate.search': 'The header search looks through the data of the system.',
    'shell.help.navigate.account':
      'Your name, in the corner of the header, opens the account menu, with appearance, help and sign out.',
    'shell.help.shortcuts.title': 'Keyboard shortcuts',
    'shell.help.shortcuts.text':
      'Single-key shortcuts do not work while you type in a field and can be turned off in Appearance and accessibility.',
    'shell.help.shortcuts.key': 'Key',
    'shell.help.shortcuts.action': 'What it does',
    'shell.help.shortcuts.search': 'Goes to the header search',
    'shell.help.shortcuts.help': 'Opens this help page',
    'shell.help.shortcuts.goto': 'Goes to {destination}',
    'shell.help.shortcuts.palette': 'Opens the command palette (Cmd + K on Mac)',
    'shell.help.shortcuts.esc': 'Closes the open menu, window or panel',
    'shell.help.support.title': 'If something goes wrong',
    'shell.help.support.text':
      'When an error shows a support code, write it down and tell the team in charge of the system: it helps find out what happened.',
    'shell.accessibility.title': 'Accessibility',
    'shell.accessibility.intro':
      'The system follows level AA of the WCAG 2.2 guidelines and can be used with the keyboard alone.',
    'shell.accessibility.features.title': 'Available features',
    'shell.accessibility.features.theme': 'Light theme, dark theme or your system default.',
    'shell.accessibility.features.text':
      'Three text sizes; the layout adapts without losing content.',
    'shell.accessibility.features.contrast': 'High contrast mode, with text at least 9 to 1.',
    'shell.accessibility.features.motion':
      'An option to reduce animations, besides following the system setting.',
    'shell.accessibility.features.keyboard':
      'Skip links to the content, the menu and the search, always visible focus and shortcuts that can be turned off.',
    'shell.accessibility.verified.title': 'What was verified',
    'shell.accessibility.verified.text':
      'Automatic checks with axe on every screen and state, in light, dark and high contrast themes, with no violations found.',
    'shell.accessibility.limits.title': 'What was not verified yet',
    'shell.accessibility.limits.text':
      'Manual testing with a screen reader and review by people with disabilities have not been done yet.',
    'shell.accessibility.report.title': 'Found a barrier?',
    'shell.accessibility.report.text':
      'Tell the team in charge of the system the screen, what you tried to do and the assistive technology you use.',
  },
} as const;

export type ShellMessageKey = keyof (typeof shellMessages)['pt-BR'];
export type ShellMessages = Readonly<Partial<Record<ShellMessageKey, string>>>;

const DEFAULT_LOCALE = 'pt-BR';

/** Função de tradução da casca: chave mais valores de `{nome}`. */
export type ShellText = (
  key: ShellMessageKey,
  values?: Readonly<Record<string, string | number>>,
) => string;

const fallback: ShellText = (key, values) =>
  values === undefined
    ? shellMessages[DEFAULT_LOCALE][key]
    : fillUiText(shellMessages[DEFAULT_LOCALE][key], values);

const TextContext = createContext<ShellText>(fallback);

export interface ShellTextProviderProps {
  /** Idioma dos textos; idioma sem catálogo cai em pt-BR. Sem ele vale o do `UiProvider`. */
  readonly locale?: string;
  /** Sobrescreve chaves; chave desconhecida é ignorada e valor que não é texto é descartado. */
  readonly messages?: ShellMessages;
  readonly children: ReactNode;
}

/** Textos da casca para tudo que está abaixo, inclusive as páginas de perfil, ajuda e acessibilidade. */
export function ShellTextProvider({ locale, messages, children }: ShellTextProviderProps) {
  const uiLocale = useUiLocale();
  const effective = locale ?? uiLocale;
  const text = useMemo<ShellText>(() => {
    const base: Readonly<Record<string, string>> = Object.hasOwn(shellMessages, effective)
      ? shellMessages[effective as keyof typeof shellMessages]
      : shellMessages[DEFAULT_LOCALE];
    return (key, values) => {
      const override =
        messages !== undefined && Object.hasOwn(messages, key) ? messages[key] : undefined;
      const template =
        typeof override === 'string' ? override : (base[key] ?? shellMessages[DEFAULT_LOCALE][key]);
      return values === undefined ? template : fillUiText(template, values);
    };
  }, [effective, messages]);
  return createElement(TextContext.Provider, { value: text }, children);
}

/** Texto da casca para a chave; chave sem texto no idioma devolve o pt-BR padrão, nunca vazio. */
export function useShellText(): ShellText {
  return useContext(TextContext);
}
