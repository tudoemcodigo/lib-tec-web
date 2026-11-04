---
titulo: Opções do @tudoemcodigo/tooling
tipo: referencia
dono: Tudo em Código (mantenedor do monorepo)
status: vigente
verificado-em: 2026-11-04
---

[🏠 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md) › [📚 Documentação](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) › ⚙️ Opções

# ⚙️ Opções do `@tudoemcodigo/tooling`

> Referência para quem consulta padrões e efeitos. Para o passo a passo, veja [Uso](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/uso.md).

## 📑 Sumário

- [🔍 tecEslintConfig](#-teceslintconfig)
- [🧪 tecVitestConfig](#-tecvitestconfig)
- [🎨 Prettier](#-prettier)
- [🧱 tsconfig base](#-tsconfig-base)

## 🔍 tecEslintConfig

| Opção                 | Padrão                                            | Efeito                                                                                               |
| --------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `tsconfigRootDir`     | **obrigatória**                                   | Pasta do `tsconfig` usada pelo ESLint tipado (`import.meta.dirname`). Vazia ou ausente: erro         |
| `ignores`             | `[]`                                              | Padrões ignorados, somados a `dist`, `coverage` e `node_modules`                                     |
| `allowDefaultProject` | `[]`                                              | Arquivos fora do `tsconfig` que o ESLint tipado deve aceitar                                         |
| `httpFiles`           | `[]`                                              | Únicos arquivos autorizados a usar `fetch` e `XMLHttpRequest` (o módulo de cliente HTTP, FRT-API-02) |
| `zodFiles`            | `[]`                                              | Únicos arquivos autorizados a importar `zod` (o wrapper sem JIT, FRT-SEG-14)                         |
| `testFiles`           | `['**/*.test.{ts,tsx}', 'src/test/**', 'e2e/**']` | Arquivos isentos das restrições de sintaxe                                                           |
| `nodeFiles`           | `['*.config.{js,mjs,ts}']`                        | Arquivos que rodam em Node: recebem os globais do Node (`process`, etc.)                             |

Sempre ligados: `typescript-eslint` (`strictTypeChecked` e `stylisticTypeChecked`), `react-hooks`, `jsx-a11y` (`strict`), `eslint-config-prettier`. Arquivos `.js`, `.mjs` e `*.config.ts` são lidos sem checagem de tipos.

## 🧪 tecVitestConfig

| Opção             | Padrão                                            | Efeito                                                                              |
| ----------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `environment`     | `jsdom`                                           | Ambiente de teste                                                                   |
| `setupFiles`      | `[]`                                              | Arquivos de preparação                                                              |
| `include`         | `['src/**/*.test.{ts,tsx}']`                      | Onde estão os testes                                                                |
| `coverageInclude` | `['src']`                                         | Código medido. Vazio: erro (arquivo nunca importado também precisa contar)          |
| `coverageExclude` | `[]`                                              | Lista de `{ pattern, reason }`. `reason` com no mínimo 10 caracteres; sem ele, erro |
| `thresholds`      | `{ lines, statements, functions, branches }` = 90 | Só pode **subir** (90 a 100); fora disso, erro                                      |

Exclusões que já vêm de fábrica (QUA-PIR-01: só gerado, tipos e testes): `**/*.test.{ts,tsx,js,mjs}`, `**/*.d.ts`, `**/*.css`, `**/gerado/**`, `**/generated/**`. Provedor `v8`, `globals: true`, relatórios `text-summary` e `lcov`.

## 🎨 Prettier

`singleQuote: true`, `semi: true`, `trailingComma: 'all'`, `printWidth: 100`. Não há opções: é uma configuração fixa (FRT-BAS-05).

## 🧱 tsconfig base

| Opção                                    | Valor                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `target` / `module` / `moduleResolution` | `ES2023` / `ESNext` / `bundler`                                                                                                             |
| `lib`                                    | `ES2023`, `DOM`, `DOM.Iterable`                                                                                                             |
| `jsx`                                    | `react-jsx`                                                                                                                                 |
| Estrito (FRT-BAS-01)                     | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `verbatimModuleSyntax`                            |
| Higiene                                  | `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`, `isolatedModules`, `skipLibCheck` |

---

⬅️ [Uso](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/uso.md) · [Índice](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) · ➡️ [Erros](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/erros.md)
