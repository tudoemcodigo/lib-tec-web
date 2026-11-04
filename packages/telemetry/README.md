<div align="center">

<img src="https://www.tudoemcodigo.com/marca/PNG/tudoemcodigo-icone-512.png" alt="Tudo em Código" width="120" />

[🏠 Tudo em Código](https://github.com/tudoemcodigo) › [📦 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web) › [📡 telemetry](https://github.com/tudoemcodigo/lib-tec-web/tree/main/packages/telemetry)

# 📡 @tudoemcodigo/telemetry

**Telemetria do navegador sem dado pessoal: tudo que sai é redigido (CPF, CNPJ, e-mail, token, identificadores), a rota perde query e ids, e o destino é do sistema.**

Redação antes do envio · Logger estruturado · Rota parametrizada · Destino plugável · Falha do destino nunca derruba a tela

[![CI](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml/badge.svg)](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml)
[![Versão](https://img.shields.io/badge/vers%C3%A3o-0.0.1-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/packages/telemetry/CHANGELOG.md)
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

| Sem o telemetry                                       | Com o telemetry                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Erro com e-mail ou CPF da pessoa vai parar no painel  | `track` redige todo campo de texto antes de entregar ao destino        |
| `/clientes/3f25...?email=ana@x.com` vira dado pessoal | `parameterizeRoute` entrega `/clientes/:id`, sem query nem fragmento   |
| Fornecedor de observabilidade preso no código         | O sistema escolhe o destino com `setSink`; o pacote não presume nenhum |
| Falha do coletor derruba a tela                       | Falha do destino é engolida: telemetria é melhor esforço               |

---

## 📦 O que tem dentro

| Export              | Entrega                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `track`             | Registra um evento (`error`, `metric`, `route`) já redigido                                    |
| `trackError`        | Registra um erro qualquer: nome, mensagem redigida e `traceId` quando existir                  |
| `setSink`           | Define o destino dos eventos; devolve a função que o remove                                    |
| `createLogger`      | Logger estruturado: JSON por linha com `traceId`, rota, versão e hora; `debug` cai em produção |
| `redact`            | Troca dado pessoal e credencial por marcadores e limita o texto a 500 caracteres               |
| `parameterizeRoute` | Rota sem query, fragmento e identificadores                                                    |

---

## 📥 Instalação

```ini
# ~/.npmrc (PAT com escopo read:packages; o token vem da variável)
@tudoemcodigo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @tudoemcodigo/telemetry
```

> [!WARNING]
> **Não publicado ainda:** o pacote passa em `npm run verify` do monorepo, mas a publicação pelo `release.yml` depende de aprovação (publicar é uma ação externa).

---

## 🚀 Início rápido

```ts
import { createLogger, setSink, track, trackError } from '@tudoemcodigo/telemetry';

// Uma vez, na subida do sistema: o destino é do sistema (aqui, um endpoint próprio)
setSink((event) => navigator.sendBeacon('/telemetry', JSON.stringify(event)));

track({ type: 'metric', name: 'LCP', value: 1800, route: location.pathname });
trackError(new Error('falha para ana@exemplo.com'), location.pathname); // sai como "falha para [email]"

const logger = createLogger({
  production: import.meta.env.PROD,
  context: () => ({ route: location.pathname, version: '1.4.0' }),
});
logger.warn('sessão perto de expirar', { restante: 30 }); // {"level":"warn",...,"route":"/","data":{"restante":30}}
```

---

## ⚡ Compatibilidade

- **Navegadores** modernos e **Node** 24; sem dependências e sem React.
- **Não verificado:** redação de nomes próprios e endereços (os padrões cobrem e-mail, CPF, CNPJ, telefone BR, JWT, `Bearer`/`Basic` e UUID).

---

## 🛡️ Segurança · 🧪 Testes

- Redação por padrão, antes do destino: o sistema não consegue enviar texto cru por engano.
- Marcadores em português (`[cpf]`, `[cnpj]`, `[telefone]`) porque os padrões são brasileiros.
- A redação é uma rede de segurança, **não** autorização para registrar dado pessoal: não coloque dado pessoal em `name` ou `detail`.
- **Testes:** 26 unitários, incluindo dado pessoal injetado em todo campo e destino que lança.

---

## 🤝 Contribuição · 🏷️ Versionamento · 📄 Licença

- **Contribuição**: veja o [README do monorepo](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md#-contribuição--versionamento--licença).
- **Versionamento**: [SemVer 2.0](https://semver.org/lang/pt-BR/); nomes e assinaturas exportados só mudam com versão (FRT-PKG-02).
- **Licença**: [Apache 2.0](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE).
