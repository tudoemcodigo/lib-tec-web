<div align="center">

<img src="https://www.tudoemcodigo.com/marca/PNG/tudoemcodigo-icone-512.png" alt="Tudo em Código" width="120" />

[🏠 Tudo em Código](https://github.com/tudoemcodigo) › [📦 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web) › [🎨 theme](https://github.com/tudoemcodigo/lib-tec-web/tree/main/packages/theme)

# 🎨 @tudoemcodigo/theme

**A identidade visual do ecossistema TEC num pacote: tokens CSS, preferências de acessibilidade e tema sazonal (Natal, por exemplo) que troca sem republicar nenhum sistema.**

Tokens `--tec-*` · `light-dark()` · Alto contraste · Preferências em `localStorage` (única escrita) · Tema sazonal por manifesto fechado · CSP estrita

[![CI](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml/badge.svg)](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/compatibilidade.md)
[![Versão](https://img.shields.io/badge/vers%C3%A3o-0.0.1-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/packages/theme/CHANGELOG.md)
[![npm](https://img.shields.io/badge/npm-GitHub%20Packages-0969da?logo=github)](https://github.com/orgs/tudoemcodigo/packages)
[![Licença: Apache 2.0](https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE)

</div>

---

## 📑 Sumário

- [✨ Por que usar](#-por-que-usar)
- [📦 O que tem dentro](#-o-que-tem-dentro)
- [📥 Instalação](#-instalação)
- [🚀 Início rápido](#-início-rápido)
- [🎄 Tema sazonal](#-tema-sazonal)
- [📚 Documentação](#-documentação)
- [⚡ Compatibilidade](#-compatibilidade)
- [🛡️ Segurança · 🧪 Testes](#️-segurança--testes)
- [🤝 Contribuição · 🏷️ Versionamento · 📄 Licença](#-contribuição--versionamento--licença)

---

## ✨ Por que usar

| Sem o theme                                                      | Com o theme                                                                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Cada sistema com a própria cópia das cores, e a marca diverge    | Uma folha de tokens única; mudar a marca é atualizar a versão                                                               |
| Tema comemorativo exige novo build e deploy de N sistemas        | O tema chega como **dado** em tempo de execução: um PR no repositório de temas e todos os sistemas trocam                   |
| Tema remoto como CSS: pode esconder aviso, exfiltrar por `url()` | Manifesto de **esquema fechado**: só cores `#rrggbb`, contraste WCAG AA verificado, tokens de erro/aviso/sucesso protegidos |
| Preferências de acessibilidade reinventadas                      | Tema claro/escuro/sistema, tamanho do texto, alto contraste, reduzir animações, atalhos e "sem tema sazonal"                |

---

## 📦 O que tem dentro

| Subcaminho                                      | Entrega                                                                         | Roda em                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| `@tudoemcodigo/theme`                           | tudo abaixo, mais os hooks React                                                | Navegador (React 19)         |
| `@tudoemcodigo/theme/core`                      | paleta, contraste, validação e seleção do manifesto                             | Navegador e Node (sem React) |
| `@tudoemcodigo/theme/tokens.css`                | variáveis `--tec-*` e atributos `data-theme`, `data-contrast`, `data-text-size` | CSS                          |
| `@tudoemcodigo/theme/animations.css`            | neve em CSS puro, desligada por movimento reduzido                              | CSS                          |
| `@tudoemcodigo/theme/schema/themes.schema.json` | JSON Schema do manifesto (fonte da verdade)                                     | Qualquer linguagem           |

---

## 📥 Instalação

```ini
# ~/.npmrc (PAT com escopo read:packages; o token vem da variável)
@tudoemcodigo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @tudoemcodigo/theme
```

> [!WARNING]
> **Verificado** (2026-11-04): instalação do registro numa pasta limpa e atestado de procedência (SLSA) do tarball, que aponta o workflow `release.yml` da `main`. `react` ^19 é peer.

---

## 🚀 Início rápido

```ts
import '@tudoemcodigo/theme/tokens.css';
import '@tudoemcodigo/theme/animations.css';
import { initPreferences, usePreferences, setPreferences } from '@tudoemcodigo/theme';

// Antes de renderizar: tema, texto e contraste já valem no primeiro quadro
initPreferences();

function ThemePicker() {
  const preferences = usePreferences();
  return (
    <select
      value={preferences.theme}
      onChange={(event) => setPreferences({ theme: event.target.value as 'system' | 'light' | 'dark' })}
    >
      {/* textos vêm do catálogo i18n do sistema */}
    </select>
  );
}
```

Em CSS, use os tokens: `color: var(--tec-color-text); background: var(--tec-color-surface);`.

---

## 🎄 Tema sazonal

O sistema pede o tema ativo ao BFF (`GET /bff/theme`, pelo cliente HTTP do próprio sistema) e entrega o resultado ao pacote:

```ts
import { loadSeasonalTheme, watchPreferencesForSeasonalTheme } from '@tudoemcodigo/theme';
import { getTheme } from './shared/api/client'; // o cliente HTTP único do sistema

watchPreferencesForSeasonalTheme();
await loadSeasonalTheme((signal) => getTheme(signal), { timeoutMs: 3000 });
```

`loadSeasonalTheme` **nunca lança**: rede fora, prazo estourado, resposta inválida ou contraste reprovado deixam o tema padrão. Veja [Tema sazonal](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/tema-sazonal.md) para o manifesto, as garantias e os limites.

---

## 📚 Documentação

| Arquivo                                                                                       | O que responde                                 |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [🎨 Tema e preferências](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/tema.md)  | Tokens, atributos e preferências               |
| [🎄 Tema sazonal](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/tema-sazonal.md) | Manifesto, entrega, garantias, erros e limites |
| [🛡️ Segurança](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/seguranca.md)       | Modelo de ameaças resumido                     |

---

## ⚡ Compatibilidade

- **React** 19 (peer); **navegadores** com `light-dark()` e `adoptedStyleSheets`.
- **Verificado em navegador real:** Chromium, Firefox e WebKit (Playwright 1.64.1): 42 testes E2E do pacote sob CSP estrita e 48 no app real do `web-templatetec`, nesta data.
- **Não verificado:** a CSP real emitida pelo `TEC.Bff`; leitor de tela; navegadores fora desses três motores.

---

## 🛡️ Segurança · 🧪 Testes

- O tema é **dado, nunca código**: sem CSS, sem URL, sem script. Aplicado por `adoptedStyleSheets`, sem `unsafe-inline` (FRT-TEM-01/02).
- Tokens `color-error`, `color-error-bg`, `color-success`, `color-warning` e `color-info` não são trocáveis; contraste recalculado no cliente.
- **Testes:** 189 unitários do monorepo (cobertura `v8` de 98,97% das instruções e 98,67% dos ramos) e 42 E2E nos três motores; o JSON Schema e o validador são conferidos com os mesmos casos hostis, compartilhados com a validação em C# do BFF.

---

## 🤝 Contribuição · 🏷️ Versionamento · 📄 Licença

- **Contribuição**: veja o [README do monorepo](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md#-contribuição--versionamento--licença).
- **Versionamento**: [SemVer 2.0](https://semver.org/lang/pt-BR/); variáveis `--tec-*`, atributos `data-*`, a chave de storage, os campos do manifesto e os exports só mudam com versão (FRT-PKG-02).
- **Licença**: [Apache 2.0](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE).
