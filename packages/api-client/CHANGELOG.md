# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/api-client** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### 📝 Documentação

- README e comentário de `validation.ts` deixam claro que o `jitless` do pacote não basta no bundle (`sideEffects: false` e ordem de execução): o sistema deve configurá-lo no próprio módulo do `z`.

### ✨ Adicionado

- `createApiClient<Paths>` e `createRequester`: transporte único com timeout, cancelamento, retentativa segura (GET e 429), `X-TEC-CSRF` em métodos que mudam estado e `X-Correlation-ID`.
- `ApiError` e `ClientErrorCode`: erro tipado; corpo limitado a 64 kB e nunca exposto em 5xx.
- `newIdempotencyKey` e `etagOf`: idempotência por intenção e `If-Match`.
- `apiEnvelope`, `apiPage`, `readContract` e primitivas do contrato, com `z` já em modo `jitless`.
- `traceparent` (W3C Trace Context) em toda requisição, com o mesmo trace nas retentativas; `newTraceparent` e `traceIdOf`. `ApiError.traceId` cai no trace do cliente quando o servidor não manda um.
- Leitura de `application/problem+json` (RFC 9457): `errors` por campo, extensões `code` e `traceId`, com limites contra entrada hostil.

### 🧪 Testes

- 50 testes unitários com MSW (caminho feliz, falhas do contrato, retentativa, timeout, cancelamento, entrada hostil).

### ⚠️ Limites e itens não verificados

- Ainda não publicado: depende da aprovação do dono para rodar o `release.yml`.
- O `web-templatetec` já usa o pacote (instalado por tarball local até a publicação).
