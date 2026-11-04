# Instruções para agentes de IA: lib-tec-web

Monorepo dos pacotes `@tudoemcodigo/*` de frontend (React 19 + TypeScript). Antes de mudar qualquer coisa, leia o [README](README.md) e as regras FRT-PKG (padrão 07) e FRT-TEM (padrão 08) da Doutrina. Consulte a Doutrina pelo servidor MCP `doutrina-tec` ou pelo repositório `Doutrina` (`INDEX.md`).

> O bloco `doutrina-tec` (núcleo da Doutrina) ainda **não foi distribuído** a este repositório: ele é gerado por `Doutrina/tools/distribuicao.py` e não deve ser editado à mão.

## Comandos que provam o trabalho

| Para                                           | Rode                                                        |
| ---------------------------------------------- | ----------------------------------------------------------- |
| Tudo de uma vez                                | `npm run verify`                                            |
| Tipos, lint e formatação                       | `npm run typecheck`, `npm run lint`, `npm run format:check` |
| `package.json` dos pacotes (FRT-PKG-04)        | `npm run check:packages`                                    |
| Build dos pacotes (`dist/`)                    | `npm run build`                                             |
| Testes e cobertura mínima de 90%               | `npm test`                                                  |
| E2E do tema nos 3 navegadores, sob CSP estrita | `npm run e2e`                                               |

## Regras do projeto

- Um pacote por pasta em `packages/`, nomeado `@tudoemcodigo/<pasta>`. Versão independente por pacote; contrato público (exports, tokens `--tec-*`, atributos `data-*`, chaves de storage, campos de manifesto, chaves de mensagem) só muda com versão (FRT-PKG-02) e o teste de contrato do pacote.
- Identificadores e contrato público em **inglês**; nomes de domínio em português só nas features dos sistemas (FRT-PKG-03). Comentários e mensagens de lint seguem em pt-BR, citando o ID da regra.
- Cobertura mínima de 90% no consolidado, sem baixar limiar nem excluir código para passar; toda exclusão tem motivo em `vitest.config.js` (QUA-PIR-01).
- Todo comportamento novo traz teste negativo (entrada hostil, limite, falha), não só o caminho feliz (CMP-AUD-01).
- `.npmrc` mantém `ignore-scripts=true`: não adicione dependência que precise de script de instalação.
- Fixtures de `packages/tooling/test/fixtures` têm código hostil de propósito: não "corrija" nem inclua no lint.
- **Não crie o repositório no GitHub, tag, release, nem publique pacote, nem faça push sem pedido explícito do dono** (FRT-PKG-08, IA-OPS-01). Cada ação irreversível pede aprovação própria.
- Desvio de regra `MUST` da Doutrina exige ADR; relate a divergência em vez de contornar.
