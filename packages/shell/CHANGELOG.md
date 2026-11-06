# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/shell** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

Versão inaugural (`0.0.1`): a casca do `web-templatetec` extraída para pacote (FRT-PKG-01, FRT-EST-12), configurável por props.

### ✨ Adicionado

- **`AppShell`:** links de salto (conteúdo, menu e busca), cabeçalho, menu lateral recolhível (gaveta em telas estreitas), menu do usuário, área de trabalho com `Outlet`, rodapé, voltar ao topo, bloqueio da tela, paleta de comandos (`Ctrl/Cmd+K`) e painel de aparência. Props: `appName`, `systemName`, `user`, `nav`, `onSignOut`, `version`, `search`, `routes`, `commands`, `footerLinks`, `shortcuts`, `busy`, `permissionLabels`, `pageTitle`, `locale` e `messages`.
- **Nome do sistema no cabeçalho (`systemName`):** texto simples (`<p class="shell-app-name">`, nunca `h1` nem link) à esquerda do cabeçalho, em Manrope 700, truncado com reticências e com `title` para o nome completo; em telas estreitas ganha um filete à esquerda e some abaixo de 26 rem. Sem a prop não existe elemento nem espaço reservado. O título da aba não muda.
- **`ProfilePage`, `HelpPage` e `AccessibilityPage`:** páginas padrão para as rotas do sistema (`/perfil`, `/ajuda`, `/acessibilidade`). A ajuda monta a tabela de atalhos a partir do menu (`shortcut` e `shortcutDescription` de cada item); o perfil traduz permissões por `permissionLabels` e mostra o código cru quando não há texto.
- **`ShellIcon`:** ícone decorativo no tamanho da casca, para o sistema usar o mesmo aspecto.
- **Textos:** `shellMessages` (pt-BR e en), `ShellTextProvider` e `useShellText`; o sistema sobrescreve qualquer chave `shell.*` por `messages` (FRT-PKG-06).
- **CSS:** `@tudoemcodigo/shell/shell.css`, na camada `tec-shell` (depois de `tec-base`, na mesma ordem declarada pelo `ui`), só tokens `--tec-*`, classes `shell-*` e contraste alto próprio. A marca vem das variáveis `--shell-logo-light`, `--shell-logo-dark`, `--shell-symbol-light` e `--shell-symbol-dark` (padrão: `/marca/*.svg` do sistema).
- Ids fixos: `shell-content`, `shell-menu`, `shell-search`, `shell-search-drawer` e `shell-help-shortcuts`.

### 🧪 Testes

- Contrato público (`test/contract.test.ts`): exports, peers, camada e classes do CSS, paridade das chaves pt-BR e en.
- 43 testes de comportamento com casos hostis: nome do sistema e do usuário com marcação, permissão inventada (`__proto__`), letra de atalho inválida, atalhos desligados pelo sistema e pela pessoa, sequência `g` expirada, valor de mensagem que não é texto, página da casca fora do `AppShell`, nenhuma escrita em storage além da chave do `theme`.

### ⚠️ Limites e itens não verificados

- Ainda não publicado: depende do workflow `release.yml`.
- A busca global não está no pacote: o sistema passa o componente pelo slot `search`.
- Sem o `AppShell` ao redor, as páginas da casca lançam erro de propósito.
- WebKit, leitor de tela e idiomas da direita para a esquerda não foram verificados.
