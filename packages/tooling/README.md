<div align="center">

<img src="https://www.tudoemcodigo.com/marca/PNG/tudoemcodigo-icone-512.png" alt="Tudo em Código" width="120" />

[🏠 Tudo em Código](https://github.com/tudoemcodigo) › [📦 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web) › [🧰 tooling](https://github.com/tudoemcodigo/lib-tec-web/tree/main/packages/tooling)

# 🧰 @tudoemcodigo/tooling

**Configuração compartilhada dos frontends TEC: ESLint com as regras FRT da Doutrina, `tsconfig` estrito, Prettier e Vitest com cobertura mínima de 90% que só pode subir.**

ESLint tipado · `tsconfig` estrito · Prettier · Vitest `v8` · Sem script de instalação · Node 24

[![CI](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml/badge.svg)](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/Node-24-5FA04E?logo=nodedotjs&logoColor=white)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/compatibilidade.md)
[![Versão](https://img.shields.io/badge/vers%C3%A3o-0.0.1-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/packages/tooling/CHANGELOG.md)
[![npm](https://img.shields.io/badge/npm-GitHub%20Packages-0969da?logo=github)](https://github.com/orgs/tudoemcodigo/packages)
[![Licença: Apache 2.0](https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE)

</div>

---

## 📑 Sumário

- [✨ Por que usar](#-por-que-usar)
- [📥 Instalação](#-instalação)
- [🚀 Início rápido](#-início-rápido)
- [🔍 O que o ESLint barra](#-o-que-o-eslint-barra)
- [📚 Documentação](#-documentação)
- [⚡ Compatibilidade](#-compatibilidade)
- [🛡️ Segurança · 🧪 Testes](#️-segurança--testes)
- [🤝 Contribuição · 🏷️ Versionamento · 📄 Licença](#-contribuição--versionamento--licença)

---

## ✨ Por que usar

| Sem o tooling                                                 | Com o tooling                                                   |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| Configuração copiada em cada sistema e corrigida só em alguns | Corrigir uma regra aqui chega a todos por atualização de versão |
| Regra da Doutrina conferida só na revisão de PR               | A regra é erro de lint, com o ID na mensagem                    |
| Cobertura que alguém baixa para o CI passar                   | Limiar de 90% que **só sobe**; toda exclusão exige motivo       |

---

## 📥 Instalação

```ini
# ~/.npmrc (PAT com escopo read:packages; o token vem da variável)
@tudoemcodigo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install --save-dev @tudoemcodigo/tooling eslint typescript prettier
```

> [!WARNING]
> **Verificado** (2026-11-04): instalação do registro numa pasta limpa e atestado de procedência (SLSA) do tarball, que aponta o workflow `release.yml` da `main`. `eslint`, `typescript` e `prettier` são peers: o sistema os instala.

---

## 🚀 Início rápido

```js
// eslint.config.js
import { tecEslintConfig } from '@tudoemcodigo/tooling/eslint';

export default tecEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  httpFiles: ['src/shared/api/client.ts'], // único lugar com fetch
  zodFiles: ['src/shared/validation.ts'], // único lugar que importa zod
  nodeFiles: ['*.config.js'],
});
```

```js
// prettier.config.js
export { default } from '@tudoemcodigo/tooling/prettier';
```

```json
{ "extends": "@tudoemcodigo/tooling/tsconfig/base.json", "include": ["src"] }
```

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';
import { tecVitestConfig } from '@tudoemcodigo/tooling/vitest';

export default defineConfig(tecVitestConfig({ setupFiles: ['./src/test/setup.ts'] }));
```

---

## 🔍 O que o ESLint barra

| Código                                                                                                              | Regra da Doutrina |
| ------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` | FRT-SEG-04        |
| `localStorage.setItem` e `sessionStorage.setItem`, inclusive por `window.` e `globalThis.`                          | FRT-SEG-01        |
| `fetch`, `XMLHttpRequest`, `axios` fora de `httpFiles`                                                              | FRT-API-02        |
| `import ... from 'zod'` fora de `zodFiles`                                                                          | FRT-SEG-04/05/14  |
| Texto solto no JSX; `aria-label`, `title`, `placeholder`, `alt` literais                                            | FRT-ACE-08        |
| `toLocaleString()` e afins sem locale                                                                               | FRT-ACE-09        |
| `any`, `@ts-ignore`, `@ts-nocheck`, `@ts-expect-error` sem motivo, import de tipo como valor                        | FRT-BAS-02        |

Além disso: `typescript-eslint` (`strictTypeChecked` e `stylisticTypeChecked`), `react-hooks` e `jsx-a11y` (`strict`).

---

## 📚 Documentação

| Arquivo                                                                                             | O que responde                       |
| --------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [📐 Uso](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/uso.md)                         | Ligar o `tooling` num sistema        |
| [⚙️ Opções](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/opcoes.md)                   | Opção, padrão e efeito               |
| [❌ Erros](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/erros.md)                     | Mensagem, causa e correção           |
| [🛡️ Segurança](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/seguranca.md)             | O que o lint cobre e o que não cobre |
| [⚡ Compatibilidade](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/compatibilidade.md) | Versões suportadas                   |

---

## ⚡ Compatibilidade

- **Node** 24; **ESLint** `^9.39`; **TypeScript** `>=5.9 <6`; **Prettier** `^3` (peers).
- **Limite:** os testes provam o ESLint com fixtures hostis em TypeScript e TSX; regras sobre JSX de bibliotecas de terceiros não foram exercitadas. O pacote ainda não foi consumido por um sistema real.

---

## 🛡️ Segurança · 🧪 Testes

- O lint é rede de proteção, não controle completo: leia os [limites](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/seguranca.md).
- Sem script de instalação; `files` em lista permitida (`src`, `tsconfig`, README e CHANGELOG).
- Testes de contrato travam os subcaminhos exportados; testes negativos cobrem limiar abaixo de 90, exclusão sem motivo e configuração sem `tsconfigRootDir`.

---

## 🤝 Contribuição · 🏷️ Versionamento · 📄 Licença

- **Contribuição**: veja o [README do monorepo](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md#-contribuição--versionamento--licença).
- **Versionamento**: [SemVer 2.0](https://semver.org/lang/pt-BR/); contrato público (subcaminhos, opções, regras) só muda com versão.
- **Licença**: [Apache 2.0](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE).
