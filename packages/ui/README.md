<div align="center">

<img src="https://www.tudoemcodigo.com/marca/PNG/tudoemcodigo-icone-512.png" alt="Tudo em Código" width="120" />

[🏠 Tudo em Código](https://github.com/tudoemcodigo) › [📦 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web) › [🧩 ui](https://github.com/tudoemcodigo/lib-tec-web/tree/main/packages/ui)

# 🧩 @tudoemcodigo/ui

**Os componentes de interface do ecossistema TEC: avisos, notificações, estados de erro, vazio e carregando, cabeçalho de página, campos e diálogo, todos com o mesmo jeito de dizer as coisas.**

Alert · Toast · ErrorState · EmptyState · LoadingState · PageHeader · Section · Campos · ConfirmDialog · Sheet · BusyOverlay · CommandPalette · Só tokens `--tec-*`

[![CI](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml/badge.svg)](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/compatibilidade.md)
[![Versão](https://img.shields.io/badge/vers%C3%A3o-0.0.1-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/packages/ui/CHANGELOG.md)
[![npm](https://img.shields.io/badge/npm-GitHub%20Packages-0969da?logo=github)](https://github.com/orgs/tudoemcodigo/packages)
[![Licença: Apache 2.0](https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE)

</div>

---

## 📑 Sumário

- [✨ Por que usar](#-por-que-usar)
- [📦 O que tem dentro](#-o-que-tem-dentro)
- [📥 Instalação](#-instalação)
- [🚀 Início rápido](#-início-rápido)
- [⚡ Compatibilidade](#-compatibilidade)
- [🛡️ Segurança · 🧪 Testes](#️-segurança--testes)
- [🤝 Contribuição · 🏷️ Versionamento · 📄 Licença](#-contribuição--versionamento--licença)

---

## ✨ Por que usar

| Sem o ui                                                       | Com o ui                                                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Cada sistema avisa sucesso e erro de um jeito                  | Uma notificação, um alerta, um estado de erro: quem usa reconhece em todos os sistemas |
| Erro só em cor vermelha                                        | Tom em ícone, texto e cor; erro anunciado de imediato, sucesso com educação            |
| Tela vazia e "Carregando…" soltos                              | Estado vazio que convida a agir e esqueleto de carga que não faz a tela pular          |
| Formulário com erro: a pessoa procura qual campo está errado   | Resumo no topo com foco e links para cada campo                                        |
| Cores copiadas que não acompanham o Natal nem o alto contraste | Só tokens `--tec-*`: o tema sazonal e o alto contraste valem sem mudar nada            |

---

## 📦 O que tem dentro

| Grupo      | Componentes                                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feedback   | `Alert`, `ToastProvider` e `useToast`, `ErrorState`, `EmptyState`, `LoadingState` (linhas ou `variant="table"`, com a geometria da tabela), `RefreshBar` (atualização em segundo plano), `BusyOverlay` e `BrandMark` (bloqueio total da tela com a marca animada)         |
| Página     | `Pagination`, `PageHeader` (trilha, título, situação, ações), `Section`, `DataList`, `SummaryList`, `ScrollRegion` (com `stickyHeader`)                                                                                                                                   |
| Controles  | `Button` e `buttonAttributes`, `IconButton` e `iconButtonAttributes` (ação só com ícone), `ActionMenu` (menu suspenso de ações), `Badge` (texto, ícone do tom e cor), `ConfirmDialog`, `Sheet` (painel lateral modal), `CommandPalette` e `filterCommands` (`Ctrl/Cmd+K`) |
| Formulário | `TextField`, `SelectField`, `TextAreaField`, `FormErrorSummary`                                                                                                                                                                                                           |
| Base       | `UiProvider`, `useUiLocale`, `useDebouncedValue` e `uiMessages` (textos pt-BR e en), ícones do Font Awesome Free (`FaIcon`, `IconSuccess`, `IconEye`, `IconSave`...)                                                                                                      |
| CSS        | `@tudoemcodigo/ui/ui.css`, na camada `tec-ui` (CSS do sistema sem camada sempre vence)                                                                                                                                                                                    |

---

## 🎛️ Contrato de design

O contrato visual verificável está no padrão FRT-DSG da Doutrina (padrão 10 do frontend):

- **Superfície só com borda:** seção e região de tabela não têm sombra; sombra é das camadas flutuantes (menu, diálogo, painel, notificação).
- **Botão em carga mantém a largura:** `Button loading` troca o ícone pelo indicador ou, sem ícone, põe o indicador sobre o texto.
- **Densidade:** `data-density="compact"` numa região baixa os controles para `--tec-control-height-dense` (32 px).
- **`BusyOverlay`:** bloqueia a tela só depois de 250 ms e fica no mínimo 600 ms; use para processamento e troca de página, não para dado que chega dentro da tela (use `LoadingState` e `RefreshBar`).
- **`returnFocus`** em `Sheet`, `ConfirmDialog` e `CommandPalette`: quando a janela abre de um item de menu, que some ao fechar, aponte o botão que abriu o menu.
- **Cores forçadas** (Alto Contraste do Windows) têm regras próprias no CSS.

---

## 📥 Instalação

```ini
# ~/.npmrc (PAT com escopo read:packages; o token vem da variável)
@tudoemcodigo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @tudoemcodigo/ui
```

`react` ^19, `react-dom` ^19 e `@base-ui/react` ^1.9 são peers.

---

## 🚀 Início rápido

```tsx
import '@tudoemcodigo/ui/ui.css';
import { ToastProvider, UiProvider, useToast, Alert, PageHeader } from '@tudoemcodigo/ui';

// Uma vez, acima do roteador: idioma dos textos dos componentes e a fila de notificações
<UiProvider locale="pt-BR">
  <ToastProvider>
    <App />
  </ToastProvider>
</UiProvider>;

function SaveButton() {
  const toast = useToast();
  return <button onClick={() => toast.success('Cliente criado.')}>Salvar</button>;
}

// Aviso que fica na página, com a ação possível
<Alert tone="warning" title="Alguém alterou este registro" action={<button>Recarregar</button>}>
  Recarregue para ver a versão nova antes de salvar.
</Alert>;

// Toda página começa pelo cabeçalho: trilha até o pai, título (o único h1), situação e ações
<PageHeader
  title="Maria da Silva"
  breadcrumb={[
    { label: 'Início', href: '/' },
    { label: 'Clientes', href: '/clientes' },
  ]}
/>;
```

Para a trilha usar o roteador do sistema, passe `renderLink`. Para dar cara de botão a um link, use `<Link {...buttonAttributes()}>`.

Textos dos componentes (por exemplo, "Fechar notificação") vêm de `uiMessages`; troque o idioma ou sobrescreva chaves com `UiProvider locale messages`.

> [!WARNING]
> **Não publicado ainda:** o pacote passa em `npm run verify` do monorepo e foi exercitado no app real do `web-templatetec` (E2E em Chromium e Firefox, axe em todas as rotas), mas a primeira publicação depende do workflow `release.yml`.

---

## ⚡ Compatibilidade

- **React** 19 e **Base UI** ^1.9 (peers); navegadores com `color-mix()` e `@layer`.
- **Verificado em navegador real:** Chromium e Firefox, pelo E2E do `web-templatetec` (74 testes, axe nas rotas e nos estados de notificação, diálogo e erro).
- **Não verificado:** WebKit; leitor de tela; idiomas da direita para a esquerda.

---

## 🛡️ Segurança · 🧪 Testes

- Todo texto vira **texto**, nunca HTML: título, mensagem e valores com marcação aparecem literais. Não há `dangerouslySetInnerHTML`.
- A notificação limita o tamanho da mensagem (500 caracteres) e a quantidade na tela (4); erro nunca é descartado por excesso.
- Mensagem de erro não carrega texto do servidor: o sistema passa o texto do catálogo.
- **Testes:** 66 unitários do pacote, com casos hostis (marcação, texto gigante, nome de campo malicioso, área de transferência negada).

---

## 🤝 Contribuição · 🏷️ Versionamento · 📄 Licença

- **Contribuição**: veja o [README do monorepo](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md#-contribuição--versionamento--licença).
- **Versionamento**: [SemVer 2.0](https://semver.org/lang/pt-BR/); nomes, props, classes `ui-*` e chaves `ui.*` só mudam com versão (FRT-PKG-02).
- **Licença**: [Apache 2.0](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE). Os ícones são do [Font Awesome Free](https://fontawesome.com/license/free) (CC BY 4.0), embutidos como SVG sem modificação; a atribuição está no `NOTICE` do monorepo.
