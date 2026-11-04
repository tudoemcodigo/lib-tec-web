# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/tooling** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.0.1] - não lançado

Versão inaugural: configuração compartilhada dos frontends TEC.

### ✨ Adicionado

- **`@tudoemcodigo/tooling/eslint`**: `tecEslintConfig` com FRT-SEG-01/04, FRT-API-02, FRT-ACE-08/09 e FRT-BAS-02/03; opções `httpFiles`, `zodFiles`, `testFiles` e `nodeFiles`.
- **`@tudoemcodigo/tooling/vitest`**: `tecVitestConfig` com cobertura `v8` de 90% que só pode subir e exclusões com motivo.
- **`@tudoemcodigo/tooling/prettier`** e **`@tudoemcodigo/tooling/tsconfig/base.json`**.
- Testes de contrato (subcaminhos exportados) e testes negativos (limiar, exclusão sem motivo, código hostil em TS/TSX).

### 🐛 Corrigido

- A regra de escrita em storage (FRT-SEG-01) só pegava `localStorage.setItem`; agora também pega `window.localStorage.setItem` e `globalThis.sessionStorage.setItem` (teste de regressão em `bad-storage.ts`).

### ⚠️ Limites e itens não verificados

- Regras são seletores de AST: formas indiretas (`window['eval']`, alias de `Function`) **não foram testadas**.
- Ainda não consumido por um sistema real; instalação pelo registro **não verificada** (nada publicado).
