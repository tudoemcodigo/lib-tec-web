import type { ComponentType, ReactNode } from 'react';
import type { ShellMessages } from './messages.js';

/**
 * Quem está logado, como a casca precisa saber. Só nome e permissões: o pacote nunca recebe token nem outro dado da sessão.
 * As permissões só decidem o que MOSTRAR (item de menu, comando, atalho); quem autoriza de verdade é o servidor (SEC-IDN-04).
 */
export interface ShellUser {
  readonly name: string;
  readonly permissions: readonly string[] | ReadonlySet<string>;
}

/**
 * Item do menu lateral. `to` é um caminho de texto: o pacote não conhece o tipo das rotas do sistema (o `Link` do roteador
 * aceita texto), então o sistema continua com as rotas tipadas dele e o pacote com um contrato estável.
 */
export interface ShellNavItem {
  readonly to: string;
  /** Texto do item, já traduzido pelo sistema. */
  readonly label: string;
  /** Ícone decorativo (por exemplo, `IconHome` do pacote `ui`); a casca o envolve com o tamanho certo. */
  readonly icon: ComponentType;
  /** Sem permissão, todos veem o item; com ela, só quem a tem. */
  readonly permission?: string;
  /** Marca o item como atual só na rota exata (o Início, para não ficar atual em todas as páginas). */
  readonly exact?: boolean;
  /** Letra do atalho `g` + letra para ir ao item (por exemplo, `c`); precisa ser uma única letra minúscula. */
  readonly shortcut?: string;
  /** Texto da linha do atalho na página de ajuda; sem ele vale "Vai para {rótulo}". */
  readonly shortcutDescription?: string;
}

/**
 * Comando da paleta (`Ctrl/Cmd+K`). Quem decide o que cada pessoa vê é o sistema (por permissão); o servidor decide o acesso.
 * Informe `to` (navegar) ou `onSelect` (executar), não os dois.
 */
export interface ShellCommand {
  readonly id: string;
  /** O que o comando faz, no imperativo e já traduzido ("Novo cliente"). */
  readonly label: string;
  /** Sem permissão, todos veem o comando. */
  readonly permission?: string;
  readonly to?: string;
  readonly onSelect?: () => void;
  readonly icon?: ComponentType;
  readonly keywords?: readonly string[];
  /** Rótulo do grupo, já traduzido; sem ele o comando fica em "Ações". */
  readonly group?: string;
}

/** Link extra do rodapé. */
export interface ShellLink {
  readonly to: string;
  readonly label: string;
}

/**
 * Caminhos das páginas da própria casca. Cada chave ausente usa o padrão; `false` desliga a página (some do menu do usuário,
 * do rodapé, da paleta e dos atalhos).
 */
export interface ShellRoutes {
  /** Padrão `/`. */
  readonly home?: string;
  /** Padrão `/perfil`. */
  readonly profile?: string | false;
  /** Padrão `/ajuda`. */
  readonly help?: string | false;
  /** Padrão `/acessibilidade`. */
  readonly accessibility?: string | false;
}

/** Propriedades que a casca passa ao componente de busca do sistema: ela decide o lugar e o `id`; o sistema desenha o formulário. */
export interface ShellSearchSlot {
  /** `id` do campo de busca: único na página (o salto "Ir para a busca" e o atalho `/` apontam para o do cabeçalho). */
  readonly id: string;
  /** Classes de layout que o formulário deve receber (`shell-search` mais a variante do cabeçalho ou da gaveta). */
  readonly className: string;
  readonly variant: 'header' | 'drawer';
}

export interface AppShellProps {
  /** Nome do sistema, já traduzido: nome acessível da marca, título da aba e rodapé. */
  readonly appName: string;
  /**
   * Nome do sistema (por exemplo, "Gestão de Pedidos"), já traduzido, mostrado à esquerda do cabeçalho: texto simples, não o
   * `h1` (que é da página) nem link (o logo do menu já leva ao início). Distinto de `appName`, o nome da marca. Sem ele o
   * cabeçalho não mostra nada nem reserva espaço.
   */
  readonly systemName?: string;
  readonly user: ShellUser;
  readonly nav: readonly ShellNavItem[];
  /** Chamado ao escolher "Sair"; o sistema encerra a sessão (formulário POST do BFF). */
  readonly onSignOut: () => void;
  /** Versão do sistema mostrada no rodapé; sem ela o rodapé não mostra versão. */
  readonly version?: string;
  /** Componente da busca global do sistema (recebe `ShellSearchSlot`); sem ele não há campo, nem link de salto, nem atalho `/`. */
  readonly search?: ComponentType<ShellSearchSlot>;
  readonly routes?: ShellRoutes;
  /** Comandos do sistema na paleta, depois das páginas e antes de "Aparência". */
  readonly commands?: readonly ShellCommand[];
  /** Links extras do rodapé, depois de Ajuda e Acessibilidade. */
  readonly footerLinks?: readonly ShellLink[];
  /** `false` desliga os atalhos de uma tecla (e a opção de ligá-los no painel de aparência). Padrão `true`. */
  readonly shortcuts?: boolean;
  /** `true` enquanto o sistema processa algo (por exemplo, uma gravação): a tela fica bloqueada com a marca animada. */
  readonly busy?: boolean;
  /** Texto de cada permissão na página de perfil, já traduzido; permissão sem texto aparece como código. */
  readonly permissionLabels?: Readonly<Record<string, string>>;
  /** Título da página (já traduzido) a partir do `staticData` da rota; sem ele a aba mostra só o nome do sistema. */
  readonly pageTitle?: (staticData: unknown) => string | undefined;
  /** Idioma dos textos da casca; sem ele vale o do `UiProvider` do pacote `ui`. */
  readonly locale?: string;
  /** Sobrescreve textos da casca (por exemplo, "A busca procura clientes"). */
  readonly messages?: ShellMessages;
  /** Conteúdo da área de trabalho; sem ele a casca usa o `Outlet` do roteador. */
  readonly children?: ReactNode;
}
