---
titulo: Erros e mensagens do @tudoemcodigo/tooling
tipo: referencia
dono: Tudo em Código (mantenedor do monorepo)
status: vigente
verificado-em: 2026-11-04
---

[🏠 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md) › [📚 Documentação](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) › ❌ Erros

# ❌ Erros e mensagens do `@tudoemcodigo/tooling`

> Para quem viu um erro de lint ou de configuração e quer saber o que fazer.

## 📑 Sumário

- [🔍 Mensagens do lint](#-mensagens-do-lint)
- [⚙️ Erros de configuração](#️-erros-de-configuração)
- [🧰 Problemas comuns de ambiente](#-problemas-comuns-de-ambiente)

## 🔍 Mensagens do lint

| Mensagem começa com                          | Regra ESLint                                     | Quando ocorre                                                                                                       | O que fazer                                                                                                             |
| -------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `FRT-SEG-04`                                 | `no-restricted-syntax`, `no-eval`, `no-new-func` | `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` | Renderizar como texto; HTML de usuário só por sanitizador aprovado em ADR                                               |
| `FRT-SEG-01`                                 | `no-restricted-syntax`                           | `localStorage.setItem` ou `sessionStorage.setItem`, inclusive por `window.` e `globalThis.`                         | Não guardar nada sensível no navegador; a sessão é do BFF. A exceção das preferências exige `eslint-disable` com motivo |
| `FRT-API-02`                                 | `no-restricted-globals`, `no-restricted-imports` | `fetch`, `XMLHttpRequest` ou `axios` fora de `httpFiles`                                                            | Passar pelo módulo único de cliente HTTP                                                                                |
| `Importe z do wrapper`                       | `no-restricted-imports`                          | `import ... from 'zod'` fora de `zodFiles`                                                                          | Importar do wrapper sem JIT (FRT-SEG-04/05/14)                                                                          |
| `FRT-ACE-08`                                 | `no-restricted-syntax`                           | Texto solto no JSX, ou `aria-label`, `title`, `placeholder`, `alt` literais                                         | Buscar o texto no catálogo i18n                                                                                         |
| `FRT-ACE-09`                                 | `no-restricted-syntax`                           | `toLocaleString()` e afins sem argumentos                                                                           | Usar `Intl` com locale explícito                                                                                        |
| `@typescript-eslint/no-explicit-any`         | idem                                             | `any`                                                                                                               | Usar `unknown` e estreitar (FRT-BAS-02)                                                                                 |
| `@typescript-eslint/ban-ts-comment`          | idem                                             | `@ts-ignore`, `@ts-nocheck`, ou `@ts-expect-error` sem motivo de 10+ caracteres                                     | Corrigir o tipo; se inevitável, `@ts-expect-error` com motivo                                                           |
| `@typescript-eslint/consistent-type-imports` | idem                                             | Import de tipo como valor                                                                                           | `import type { ... }`                                                                                                   |

## ⚙️ Erros de configuração

Lançados ao carregar a configuração (falha fechada, antes de qualquer lint ou teste):

| Mensagem                                                           | Origem            | Causa                                                                        | Correção                                                    |
| ------------------------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `tecEslintConfig exige tsconfigRootDir (use import.meta.dirname).` | `tecEslintConfig` | Opção ausente ou vazia                                                       | Passar `tsconfigRootDir: import.meta.dirname`               |
| `coverageInclude não pode ser vazio...`                            | `tecVitestConfig` | Lista vazia: nada seria medido                                               | Informar o código medido (padrão `['src']`)                 |
| `coverageInclude "..." tem curinga que não casa arquivos...`       | `tecVitestConfig` | Padrão como `packages/*/src`: mediria zero arquivos e o relatório diria 100% | Usar `packages/*/src/**`                                    |
| `Toda exclusão de cobertura precisa de um "pattern".`              | `tecVitestConfig` | Item de `coverageExclude` sem `pattern`                                      | Informar o padrão                                           |
| `A exclusão de cobertura "..." precisa de um motivo...`            | `tecVitestConfig` | `reason` ausente ou com menos de 10 caracteres                               | Explicar por que o código não conta (ex.: ponto de entrada) |
| `O limiar de cobertura "..." deve estar entre 90 e 100...`         | `tecVitestConfig` | Limiar abaixo de 90, acima de 100 ou não numérico                            | Subir o limiar ou remover a opção. **Não há como baixar**   |

## 🧰 Problemas comuns de ambiente

| Sintoma                                                   | Causa                                  | Correção                                                              |
| --------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| `Parsing error: ... was not found by the project service` | Arquivo fora do `tsconfig`             | Incluir no `include` do `tsconfig` ou listar em `allowDefaultProject` |
| `'process' is not defined` (`no-undef`)                   | Arquivo de Node tratado como navegador | Listar o arquivo em `nodeFiles`                                       |
| `engine-strict` recusa a instalação                       | Node fora de `^24`                     | Usar o Node do `.nvmrc`                                               |

---

⬅️ [Opções](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/opcoes.md) · [Índice](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) · ➡️ [Segurança](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/seguranca.md)
