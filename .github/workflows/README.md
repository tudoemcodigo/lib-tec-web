<div align="center">
<img src="https://www.tudoemcodigo.com/marca/PNG/tudoemcodigo-icone-512.png" alt="lib-tec-web" width="90" />
</div>

# ⚙️ Workflows do lib-tec-web

Workflows próprios do monorepo (o `tec-workflows` central cobre só .NET). Todas as actions são fixadas por SHA de commit, com a versão em comentário (CMP-PUB-02); o `zizmor` audita.

| Workflow                     | Gatilhos                                                                                                         | Permissões                                                                                                                                                     | O que faz                                                                                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](ci.yml)           | `pull_request` e `push` na `main`, `merge_group`, agendamento semanal (segunda, 06:00 UTC) e `workflow_dispatch` | `contents: read`; só o job `codeql` ganha `security-events: write` e `actions: read`                                                                           | `verify` (tipos, lint, formatação, `check:packages`, build e testes com cobertura), `e2e` (tema nos três navegadores), `audit` (`npm audit --audit-level=high`), `codeql`, `workflows` (zizmor) e o agregador `ci-ok` |
| [`release.yml`](release.yml) | `workflow_dispatch` com as entradas `package` (`tooling` ou `theme`) e `version` (`X.Y.Z`)                       | `contents: write`, `packages: write`, `id-token: write`, `attestations: write`, `checks: read`, `pull-requests: read`; ambiente `publicacao` restrito à `main` | Confere os portões, empacota, atesta a procedência (SLSA), publica no GitHub Packages e cria a tag `<pacote>-v<versão>` com o Release                                                                                 |

## 🚦 Portões do release

O release **falha** se qualquer um destes não valer:

1. Execução a partir da `main`.
2. `version` é `X.Y.Z` estável (prévia e `-rc` não saem por aqui) e igual à do `package.json` do pacote.
3. A tag `<pacote>-v<versão>` ainda não existe e a versão é maior que a última tag do pacote.
4. O check `ci-ok` do commit terminou em sucesso, criado pelo app `github-actions`.
5. Não há PR aberto.

## 🔐 Segredos e variáveis

Nenhum segredo manual: o publish e o Release usam o `GITHUB_TOKEN` efêmero da execução. O Dependabot não precisa de token (as dependências vêm do npm público).

## 🛡️ Branch `main`

Protegida (PR obrigatório, check `ci-ok`, sem force-push nem exclusão, conversas resolvidas). Para que o CI valide um PR, o job `ci-ok` precisa estar entre os checks obrigatórios.

## ⚠️ Não verificado

- Primeiro release (2026-11-04): a primeira tentativa falhou em `npm publish out/x.tgz` (o npm leu como atalho de repositório GitHub; corrigido com `./`) antes de publicar qualquer coisa. Depois da correção, `tooling` e `theme` `0.0.1` saíram, com atestado verificado.
