<div align="center">

<img src="https://www.tudoemcodigo.com/marca/PNG/tudoemcodigo-icone-512.png" alt="Tudo em Código" width="120" />

[🏠 Tudo em Código](https://github.com/tudoemcodigo) › [📦 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web) › [🧩 shell](https://github.com/tudoemcodigo/lib-tec-web/tree/main/packages/shell)

# 🧩 @tudoemcodigo/shell

**A casca padrão dos sistemas TEC: cabeçalho, menu lateral, menu do usuário, paleta de comandos, aparência, atalhos e as páginas de perfil, ajuda e acessibilidade, tudo configurável por props.**

AppShell · Nome do sistema · Menu por permissão · Paleta `Ctrl/Cmd+K` · Aparência · Atalhos · Só tokens `--tec-*`

[![CI](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml/badge.svg)](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/compatibilidade.md)
[![Versão](https://img.shields.io/badge/vers%C3%A3o-0.0.1-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/packages/shell/CHANGELOG.md)
[![npm](https://img.shields.io/badge/npm-GitHub%20Packages-0969da?logo=github)](https://github.com/orgs/tudoemcodigo/packages)
[![Licença: Apache 2.0](https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE)

</div>

---

## 📑 Sumário

- [✨ Por que usar](#-por-que-usar)
- [📦 O que tem dentro](#-o-que-tem-dentro)
- [📥 Instalação](#-instalação)
- [🚀 Início rápido](#-início-rápido)
- [🎛️ Props do AppShell](#️-props-do-appshell)
- [🎨 CSS, camadas e marca](#-css-camadas-e-marca)
- [⚡ Compatibilidade](#-compatibilidade)
- [🛡️ Segurança · 🧪 Testes](#️-segurança--testes)
- [🤝 Contribuição · 🏷️ Versionamento · 📄 Licença](#-contribuição--versionamento--licença)

---

## ✨ Por que usar

| Sem o shell                                                                  | Com o shell                                                                                  |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Cada sistema copia a casca (cerca de 1.000 linhas de código e CSS) e diverge | Uma casca só; corrigir foco, contraste ou atalho chega a todos por atualização de versão     |
| Link de salto, anúncio de troca de rota e foco refeitos a cada sistema       | Já vêm prontos e testados (WCAG 2.2 AA)                                                      |
| Menu, comandos e busca misturados com a estrutura                            | O sistema só informa **o que é dele** (itens, permissões, comandos, busca, textos) por props |

---

## 📦 O que tem dentro

| Parte                                                | Para que serve                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell`                                           | A casca inteira: saltos, cabeçalho, menu, `Outlet`, rodapé, voltar ao topo, bloqueio, paleta e aparência. Vai como componente da rota raiz. |
| `ProfilePage`, `HelpPage`, `AccessibilityPage`       | Páginas padrão para as rotas `/perfil`, `/ajuda` e `/acessibilidade` (só funcionam dentro do `AppShell`).                                   |
| `ShellIcon`                                          | Ícone decorativo com o tamanho da casca.                                                                                                    |
| `shellMessages`, `ShellTextProvider`, `useShellText` | Textos pt-BR e en da casca, sobrescrevíveis por chave (`shell.*`).                                                                          |
| `@tudoemcodigo/shell/shell.css`                      | Estilos da casca, na camada `tec-shell`.                                                                                                    |

O menu do usuário, a paleta e o painel de aparência são baixados só no primeiro uso (FRT-EST-07), cada um em arquivo próprio.

---

## 📥 Instalação

```ini
# ~/.npmrc (PAT com escopo read:packages; o token vem da variável)
@tudoemcodigo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @tudoemcodigo/shell
```

`react` ^19, `react-dom` ^19, `@base-ui/react` ^1.9, `@tanstack/react-router` ^1.170, `@tudoemcodigo/ui` e `@tudoemcodigo/theme` são peers. O pacote não tem dependência própria nem usa `zustand`: o estado de interface (gaveta, recolhimento, janelas) é efêmero e mora em `useState` dentro do `AppShell`, sem global de módulo e sem storage.

---

## 🚀 Início rápido

```tsx
// O ui declara as camadas; o shell vem depois
import '@tudoemcodigo/ui/styles.css';
import '@tudoemcodigo/shell/shell.css';

import { createRootRouteWithContext, useRouteContext } from '@tanstack/react-router';
import { AppShell } from '@tudoemcodigo/shell';
import { IconHome, IconUsers } from '@tudoemcodigo/ui';

function Root() {
  const { user } = useRouteContext({ from: '__root__' }); // { name, permissions } vindos do BFF
  return (
    <AppShell
      appName="Tudo em Código"
      systemName="Gestão de Pedidos"
      user={user}
      version="1.4.0"
      onSignOut={signOut}
      nav={[
        { to: '/', label: 'Início', icon: IconHome, exact: true, shortcut: 'i' },
        {
          to: '/clientes',
          label: 'Clientes',
          icon: IconUsers,
          permission: 'clientes.ler',
          shortcut: 'c',
        },
      ]}
      commands={[
        {
          id: 'novo-cliente',
          label: 'Novo cliente',
          permission: 'clientes.escrever',
          to: '/clientes/novo',
        },
      ]}
      search={BuscaDoSistema} // opcional: recebe { id, className, variant }
      permissionLabels={{ 'clientes.ler': 'Ver clientes' }}
      pageTitle={(staticData) => tituloDaRota(staticData)}
    />
  );
}

export const Route = createRootRouteWithContext()({ component: Root });
```

As páginas da casca entram nas rotas do sistema: `createFileRoute('/perfil')({ component: ProfilePage })`, e igual para `HelpPage` e `AccessibilityPage`. O título da aba delas é anunciado pela própria casca.

### Por que `to` é texto e não o tipo das rotas

O tipo das rotas é gerado pelo sistema (`Register` do roteador). Um pacote que o importasse acoplaria todos os sistemas a um só. Por isso itens, comandos e links recebem `to: string`, que o `Link` do roteador aceita; o sistema continua com as rotas tipadas dele.

---

## 🎛️ Props do AppShell

| Prop                 | Tipo                                     | Para quê                                                                                                           |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `appName`            | `string`                                 | Nome da **marca**: nome acessível do logo, rodapé (`© ano Marca`) e título da aba.                                 |
| `systemName`         | `string?`                                | Nome do **sistema**, à esquerda do cabeçalho, como texto (`<p class="shell-app-name">`). Sem ele, nada aparece.    |
| `user`               | `{ name, permissions }`                  | Quem está logado; `permissions` é lista ou `Set`. Só decide o que **mostrar**; o servidor autoriza (SEC-IDN-04).   |
| `nav`                | `ShellNavItem[]`                         | `to`, `label`, `icon`, `permission?`, `exact?`, `shortcut?` (letra depois do `g`), `shortcutDescription?`.         |
| `onSignOut`          | `() => void`                             | Encerra a sessão (formulário POST do BFF).                                                                         |
| `version`            | `string?`                                | Versão no rodapé.                                                                                                  |
| `search`             | `ComponentType<ShellSearchSlot>?`        | Busca do sistema. Recebe `id`, `className` e `variant` (`header` ou `drawer`); ligue-os ao formulário.             |
| `routes`             | `{ home, profile, help, accessibility }` | Caminhos das páginas da casca; `false` desliga a página.                                                           |
| `commands`           | `ShellCommand[]`                         | Comandos da paleta com `permission?` e `to` ou `onSelect`. Entram depois das páginas e antes de "Aparência".       |
| `footerLinks`        | `ShellLink[]`                            | Links extras do rodapé, depois de Ajuda e Acessibilidade.                                                          |
| `shortcuts`          | `boolean` (padrão `true`)                | `false` desliga os atalhos de uma tecla e a opção de ligá-los. A pessoa também pode desligá-los (WCAG 2.1.4).      |
| `busy`               | `boolean`                                | `true` bloqueia a tela com a marca animada (por exemplo, gravação em andamento). A troca de rota bloqueia sozinha. |
| `permissionLabels`   | `Record<string, string>`                 | Texto de cada permissão no perfil; sem texto, aparece o código.                                                    |
| `pageTitle`          | `(staticData) => string?`                | Título da aba (`Página · Marca`) a partir do `staticData` da rota.                                                 |
| `locale`, `messages` | `string`, `ShellMessages`                | Idioma (pt-BR ou en; padrão o do `UiProvider`) e sobrescrita de chaves `shell.*`.                                  |
| `children`           | `ReactNode`                              | Conteúdo da área de trabalho; sem ele vale o `Outlet`.                                                             |

**Ids e classes públicas** (FRT-PKG-03): ids `shell-content`, `shell-menu`, `shell-search`, `shell-search-drawer`, `shell-help-shortcuts`; classes `shell`, `shell-header`, `shell-app-name`, `shell-menu`, `shell-menu-item`, `shell-footer` e as demais `shell-*`; atributos `data-collapsed`, `data-open` e `data-initials`.

---

## 🎨 CSS, camadas e marca

`shell.css` declara `@layer tec-tokens, tec-reset, tec-ui, tec-base, tec-shell;` (a ordem de `@tudoemcodigo/ui/styles.css` mais `tec-shell`) e põe tudo em `tec-shell`: vence o `ui`, como a casca sempre fez, e o CSS do sistema, sem camada, vence a casca. Importe **depois** do `ui/styles.css`. Só tokens `--tec-*` (`--tec-shell-*` para a tinta fixa da casca).

O logo e o símbolo vêm de variáveis, em `url(...)`, que o sistema pode trocar em `:root` (sem camada):

| Variável                                      | Uso                                | Padrão                                                    |
| --------------------------------------------- | ---------------------------------- | --------------------------------------------------------- |
| `--shell-logo-light`, `--shell-logo-dark`     | Logo horizontal (menu), por tema   | `/marca/tudoemcodigo-horizontal-transparente-texto-*.svg` |
| `--shell-symbol-light`, `--shell-symbol-dark` | Símbolo (menu recolhido e celular) | `/marca/tudoemcodigo-simbolo-cores-fundo-*.svg`           |

Os SVG hoje ficam em `public/marca/` do sistema; uma versão futura do `theme` os entregará.

---

## ⚡ Compatibilidade

- **React** 19, **TanStack Router** ^1.170 e **Base UI** ^1.9 (peers); navegadores com `@layer` e `color-mix()`.
- **Verificado em navegador real:** Chromium, pelo comparador de estilos e pelo axe do `web-templatetec` (9 rotas, claro, escuro e alto contraste).
- **Não verificado:** Firefox e WebKit com a casca extraída; leitor de tela; idiomas da direita para a esquerda.

---

## 🛡️ Segurança · 🧪 Testes

- Todo texto vira **texto**: nome do sistema, do usuário, rótulos e comandos com marcação aparecem literais. Não há `dangerouslySetInnerHTML`.
- Letra de atalho fora de `a-z` é ignorada; permissão como `__proto__` nunca puxa texto do protótipo.
- A casca **não grava** em storage: as preferências são escritas só pelo pacote `theme` (ADR 0004, FRT-SEG-16).
- Não recebe token nem dado de sessão além de nome e permissões; nada vai a log ou telemetria.
- **Testes:** 50 do pacote, entre contrato público e comportamento, com casos hostis.

---

## 🤝 Contribuição · 🏷️ Versionamento · 📄 Licença

- **Contribuição**: veja o [README do monorepo](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md#-contribuição--versionamento--licença).
- **Versionamento**: [SemVer 2.0](https://semver.org/lang/pt-BR/); props, classes `shell-*`, ids, chaves `shell.*` e variáveis `--shell-*` só mudam com versão (FRT-PKG-02).
- **Licença**: [Apache 2.0](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE).
