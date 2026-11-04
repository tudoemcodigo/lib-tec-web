---
titulo: Segurança do @tudoemcodigo/tooling
tipo: explicacao
dono: Tudo em Código (mantenedor do monorepo)
status: vigente
verificado-em: 2026-11-04
---

[🏠 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md) › [📚 Documentação](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) › 🛡️ Segurança

# 🛡️ Segurança do `@tudoemcodigo/tooling`

> Para quem decide até onde confiar no lint como controle. Leia os limites antes de tratar "o lint passou" como "está seguro".

## 📑 Sumário

- [🎯 O que o lint cobre](#-o-que-o-lint-cobre)
- [⚠️ O que o lint não cobre](#️-o-que-o-lint-não-cobre)
- [📦 Cadeia de suprimentos](#-cadeia-de-suprimentos)
- [❓ Perguntas frequentes](#-perguntas-frequentes)

## 🎯 O que o lint cobre

As regras são **seletores de AST**: pegam a forma escrita no código. Cada uma é provada por um teste com código hostil real (`packages/tooling/test/eslint.test.js`).

| Controle                                                                                                   | Regra da Doutrina | Provado por teste |
| ---------------------------------------------------------------------------------------------------------- | ----------------- | ----------------- |
| Sinks de XSS (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `dangerouslySetInnerHTML`) | FRT-SEG-04        | Sim               |
| `eval` e `new Function`                                                                                    | FRT-SEG-04        | Sim               |
| Escrita em storage, inclusive por `window.localStorage` e `globalThis.sessionStorage`                      | FRT-SEG-01        | Sim               |
| HTTP fora do módulo único (`fetch`, `XMLHttpRequest`, `axios`)                                             | FRT-API-02        | Sim               |
| `zod` fora do wrapper sem JIT                                                                              | FRT-SEG-14        | Sim               |
| Texto de interface fora do catálogo                                                                        | FRT-ACE-08        | Sim               |

## ⚠️ O que o lint não cobre

> [!WARNING]
> O lint é uma rede de proteção para o código **escrito pela equipe**, não um controle de segurança completo. Ele não substitui CSP, revisão de PR nem teste de segurança.

- **Formas indiretas** que um seletor de AST não enxerga: `window['eval']`, `const f = Function; f(...)`, atribuição por desestruturação ou por variável intermediária. **Não verificado**: nenhuma delas foi testada; trate como possível lacuna.
- **Código de dependências**: o lint só lê o código do sistema. Uma biblioteca que faz `eval` por dentro passa; a defesa é a CSP sem `unsafe-eval` (FRT-SEG-05) e o Zod sem JIT (FRT-SEG-14).
- **Leitura de storage** (`getItem`) não é barrada: o risco do FRT-SEG-01 é gravar dado sensível.
- **Regras são desligáveis** com `eslint-disable`. Um `eslint-disable` sem motivo deve ser barrado em revisão de PR.

## 📦 Cadeia de suprimentos

- O pacote não executa scripts de instalação e o repositório mantém `ignore-scripts=true`.
- `exports` por subcaminho e `files` em lista permitida: só `src`, `tsconfig`, `README.md` e `CHANGELOG.md` entram no pacote (verificado com `npm pack --dry-run`: 10 arquivos).
- **Risco residual conhecido:** `npm audit` acusa 1 advisory `moderate` (`minimatch <11.0.1`, negação de serviço por padrão glob) em 13 pacotes da cadeia de desenvolvimento do ESLint. Os padrões glob vêm da configuração do próprio sistema, não de entrada externa; a correção hoje exige salto de major. Será reavaliado a cada atualização do ESLint.

## ❓ Perguntas frequentes

**Posso desligar uma regra num arquivo?** Pode, com `eslint-disable` e motivo na mesma linha. A exceção prevista é a escrita das preferências de exibição em `localStorage` (FRT-SEG-16).

**O lint substitui a CSP?** Não. São camadas diferentes: o lint evita escrever o sink, a CSP limita o estrago se algo escapar.

---

⬅️ [Erros](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/erros.md) · [Índice](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/README.md) · ➡️ [Compatibilidade](https://github.com/tudoemcodigo/lib-tec-web/blob/main/docs/compatibilidade.md)
