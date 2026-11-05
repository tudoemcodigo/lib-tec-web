# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/telemetry** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### ✨ Adicionado

- `track`, `trackError` e `setSink`: eventos `error`, `metric` e `route` com destino escolhido pelo sistema; falha do destino nunca lança.
- `redact`: CPF, CNPJ, e-mail, telefone, JWT, `Bearer`/`Basic` e UUID viram marcadores; texto limitado a 500 caracteres.
- `parameterizeRoute`: remove query, fragmento e identificadores da rota.

- `createLogger`: logger estruturado (uma linha JSON, redigida, com `traceId`, rota parametrizada e versão); `debug` descartado em produção; só valores escalares entram em `data`.

### 🧪 Testes

- 26 testes unitários, com dado pessoal injetado em todos os campos.

### ⚠️ Limites e itens não verificados

- Ainda não publicado: depende da aprovação do dono para rodar o `release.yml`.
- O `web-templatetec` já usa o pacote (instalado por tarball local até a publicação).
