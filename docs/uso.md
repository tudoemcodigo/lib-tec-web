---
titulo: Uso do @tudoemcodigo/tooling
tipo: guia
dono: Tudo em Código (mantenedor do monorepo)
status: vigente
verificado-em: 2026-11-04
---

[🏠 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md) › [📚 Documentação](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) › 📐 Uso

# 📐 Uso do `@tudoemcodigo/tooling`

> Para quem configura um frontend TEC. Os trechos seguem o formato dos arquivos que este próprio repositório usa (`eslint.config.js`, `prettier.config.js`, `vitest.config.js`, `tsconfig.json`); o `extends` do `tsconfig` pelo nome do pacote foi conferido com `tsc --showConfig`.

## 📑 Sumário

- [🧭 Visão geral](#-visão-geral)
- [🔌 Ligar no sistema](#-ligar-no-sistema)
- [✅ Conferir](#-conferir)
- [❓ Perguntas frequentes](#-perguntas-frequentes)

## 🧭 Visão geral

O pacote entrega quatro configurações, uma por ferramenta, para que as regras da Doutrina (família FRT) sejam as mesmas em todos os sistemas.

| Subcaminho                                 | Entrega                       | Regras da Doutrina                                      |
| ------------------------------------------ | ----------------------------- | ------------------------------------------------------- |
| `@tudoemcodigo/tooling/eslint`             | `tecEslintConfig(opções)`     | FRT-BAS-02/03, FRT-API-02, FRT-SEG-01/04, FRT-ACE-08/09 |
| `@tudoemcodigo/tooling/vitest`             | `tecVitestConfig(opções)`     | FRT-TST-01, QUA-PIR-01                                  |
| `@tudoemcodigo/tooling/prettier`           | objeto de configuração        | FRT-BAS-05                                              |
| `@tudoemcodigo/tooling/tsconfig/base.json` | opções estritas do TypeScript | FRT-BAS-01                                              |

## 🔌 Ligar no sistema

**1. ESLint** (`eslint.config.js`). `tsconfigRootDir` é obrigatório; liste os únicos arquivos autorizados a falar HTTP e a importar o Zod.

```js
import { tecEslintConfig } from '@tudoemcodigo/tooling/eslint';

export default tecEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  httpFiles: ['src/shared/api/client.ts'],
  zodFiles: ['src/shared/validation.ts'],
  nodeFiles: ['*.config.js'],
});
```

**2. Prettier** (`prettier.config.js`):

```js
export { default } from '@tudoemcodigo/tooling/prettier';
```

**3. TypeScript** (`tsconfig.json`). A base não define `include`, `paths` nem `noEmit`: são do sistema.

```json
{
  "extends": "@tudoemcodigo/tooling/tsconfig/base.json",
  "compilerOptions": { "noEmit": true },
  "include": ["src"]
}
```

**4. Vitest** (`vitest.config.js`). Cobertura `v8` sobre todo o `src` com 90% de limiar já vem pronta.

```js
import { defineConfig } from 'vitest/config';
import { tecVitestConfig } from '@tudoemcodigo/tooling/vitest';

export default defineConfig(tecVitestConfig({ setupFiles: ['./src/test/setup.ts'] }));
```

## ✅ Conferir

```bash
npx tsc --noEmit
npx eslint . --max-warnings 0
npx prettier --check .
npx vitest run --coverage
```

## ❓ Perguntas frequentes

**Posso baixar o limiar de cobertura num projeto?** Não: abaixo de 90 a configuração lança erro (QUA-PIR-01). Só dá para subir.

**Preciso excluir um arquivo da cobertura.** Use `coverageExclude` com `pattern` e `reason`; sem motivo (mínimo 10 caracteres) a configuração lança erro. Ver [Opções](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/opcoes.md).

**O lint reclama de arquivo fora do `tsconfig`.** Inclua o arquivo no `include` ou liste-o em `allowDefaultProject`. Ver [Erros](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/erros.md).

---

⬅️ [Índice](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) · ➡️ [Opções](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/opcoes.md)
