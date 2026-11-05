<div align="center">

<img src="https://www.tudoemcodigo.com/marca/PNG/tudoemcodigo-icone-512.png" alt="Tudo em Código" width="120" />

[🏠 Tudo em Código](https://github.com/tudoemcodigo) › [📦 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web) › [🔌 api-client](https://github.com/tudoemcodigo/lib-tec-web/tree/main/packages/api-client)

# 🔌 @tudoemcodigo/api-client

**O único cliente HTTP do frontend: timeout, cancelamento, retentativa segura, CSRF, idempotência, `traceparent` (W3C), Problem Details (RFC 9457) e `ApiError` tipado, com validação do contrato na borda.**

openapi-fetch tipado · Zod sem JIT (CSP estrita) · ETag/If-Match · Idempotency-Key · Corpo de erro limitado

[![CI](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml/badge.svg)](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml)
[![Versão](https://img.shields.io/badge/vers%C3%A3o-0.0.1-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/packages/api-client/CHANGELOG.md)
[![npm](https://img.shields.io/badge/npm-GitHub%20Packages-0969da?logo=github)](https://github.com/orgs/tudoemcodigo/packages)
[![Licença: Apache 2.0](https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE)

</div>

---

## 📑 Sumário

- [✨ Por que usar](#-por-que-usar)
- [📦 O que tem dentro](#-o-que-tem-dentro)
- [📥 Instalação](#-instalação)
- [🚀 Início rápido](#-início-rápido)
- [⚡ Compatibilidade](#-compatibilidade)
- [🛡️ Segurança · 🧪 Testes](#️-segurança--testes)
- [🤝 Contribuição · 🏷️ Versionamento · 📄 Licença](#-contribuição--versionamento--licença)

---

## ✨ Por que usar

| Sem o api-client                                | Com o api-client                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `fetch` espalhado, cada tela com seu tratamento | Um módulo só fala HTTP (FRT-API-02); o ESLint barra `fetch` fora dele          |
| Requisição sem prazo trava a tela               | Timeout e cancelamento em toda chamada                                         |
| Retentativa cega duplica pedido                 | Só repete o que é seguro (GET, 429 com `Retry-After`) e com `Idempotency-Key`  |
| Erro vira `any` ou texto do servidor na tela    | `ApiError` com `status`, `code`, `field`, `traceId`; 5xx nunca carrega o texto |
| Resposta fora do contrato quebra em outro lugar | `readContract` valida na borda e falha com `ContractViolated`                  |
| Edição concorrente sobrescreve sem aviso        | `etagOf` + `If-Match`; 409/428 pedem recarregar a edição                       |

---

## 📦 O que tem dentro

| Export                                     | Entrega                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `createApiClient<Paths>`                   | Cliente `openapi-fetch` tipado pelos `paths` gerados do OpenAPI do sistema                        |
| `createRequester`                          | Mesmo transporte para chamadas fora do OpenAPI (ex.: BFF), devolve `Response`                     |
| `ApiError` · `ClientErrorCode`             | Erro tipado e códigos do cliente (`Network`, `Timeout`, `InvalidResponse`, ...)                   |
| `newTraceparent` · `traceIdOf`             | W3C Trace Context: o cliente já envia `traceparent` em toda requisição; use para correlacionar    |
| `newIdempotencyKey` · `etagOf`             | Chave por intenção do usuário; leitura do ETag para o `If-Match`                                  |
| `CSRF_HEADER` · `CORRELATION_HEADER` · ... | Nomes dos cabeçalhos do contrato com o BFF                                                        |
| `apiEnvelope` · `apiPage` · `readContract` | Esquemas Zod do envelope e da paginação; validação na borda                                       |
| `apiId` · `apiInstant` · `apiNumber` · ... | Primitivas do contrato (GUID, instante, número do JSON)                                           |
| `z`                                        | Zod com `jitless` pedido pelo pacote; o sistema também precisa configurá-lo (veja o aviso abaixo) |

---

## 📥 Instalação

```ini
# ~/.npmrc (PAT com escopo read:packages; o token vem da variável)
@tudoemcodigo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @tudoemcodigo/api-client openapi-fetch zod
```

> [!WARNING]
> **Não publicado ainda:** o pacote passa em `npm run verify` do monorepo, mas a publicação pelo `release.yml` depende de aprovação (publicar é uma ação externa).

---

## 🚀 Início rápido

```ts
import { ApiError, createApiClient, newIdempotencyKey } from '@tudoemcodigo/api-client';
import type { paths } from './gerado/schema'; // gerado do openapi.json do sistema

export const api = createApiClient<paths>({
  onUnauthenticated: () => location.assign('/entrar'), // 401 → fluxo de login
});

try {
  const { data } = await api.POST('/api/v1/clientes', {
    body: { nome: 'Ana' },
    headers: { 'Idempotency-Key': newIdempotencyKey() }, // reuse a MESMA chave na retentativa da mesma intenção
  });
} catch (erro) {
  if (erro instanceof ApiError && erro.requiresReload) {
    // 409/428: o recurso mudou; recarregue a edição
  }
}
```

Nos testes, injete `fetchImpl`, `wait` e `random` por `createApiClient({ ... })` e use MSW; a rede real nunca é chamada.

---

## ⚡ Compatibilidade

- **Navegadores** modernos e **Node** 24 (usa `fetch`, `AbortSignal` e `crypto.randomUUID` globais).
- **Peers:** `openapi-fetch` ^0.17 e `zod` ^4. Sem React.
- **Não verificado:** upload/streaming de corpo grande e WebSocket (fora do escopo; não passam por este cliente).

---

## 🛡️ Segurança · 🧪 Testes

- O corpo de erro é lido com **limite de 64 kB**; erro 5xx nunca expõe o texto do servidor, só o `traceId` (validado por padrão).
- `code` do servidor só é aceito no formato `[A-Z0-9_]{1,64}`; fora disso vale o código padrão do status.
- `traceparent` válido em toda requisição (um trace por intenção, um span por tentativa); valor inválido de quem chama é substituído. Sem `traceId` do servidor, o `ApiError` leva o trace do cliente, para o suporte achar o log no backend.
- Lê o envelope `ApiResponse` e também `application/problem+json` (RFC 9457: `errors` por campo, extensões `code` e `traceId`); em 5xx `title`, `detail` e mensagens nunca chegam à interface, só o `traceId`.
- O CSRF (`X-TEC-CSRF`) vai só em métodos que mudam estado; `credentials` é definido aqui e em nenhum outro lugar.
- Retentativa: no máximo 3 tentativas, backoff com jitter, `Retry-After` limitado a 30 s; mutação só repete com `Idempotency-Key`.
- O Zod é importado em um único arquivo, com `jitless`, para não gerar violação de CSP. **Aviso:** o pacote declara `sideEffects: false` (FRT-PKG-04), então o bundler resolve `z` direto até o zod e pode descartar o `z.config({ jitless: true })` do pacote; além disso, o chunk do pacote pode executar depois de código do sistema que já valida com o Zod. Por isso o sistema deve chamar `z.config({ jitless: true })` no próprio módulo que reexporta o `z` (no web-templatetec, `src/shared/validacao.ts`) e provar com um teste de CSP (`script-src eval` não pode aparecer).
- **Testes:** 50 unitários do pacote, com MSW e casos hostis (corpo gigante, código malformado, timeout, cancelamento).

---

## 🤝 Contribuição · 🏷️ Versionamento · 📄 Licença

- **Contribuição**: veja o [README do monorepo](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md#-contribuição--versionamento--licença).
- **Versionamento**: [SemVer 2.0](https://semver.org/lang/pt-BR/); nomes e assinaturas exportados só mudam com versão (FRT-PKG-02).
- **Licença**: [Apache 2.0](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE).
