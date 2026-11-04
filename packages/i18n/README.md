<div align="center">

<img src="https://www.tudoemcodigo.com/marca/PNG/tudoemcodigo-icone-512.png" alt="Tudo em Código" width="120" />

[🏠 Tudo em Código](https://github.com/tudoemcodigo) › [📦 lib-tec-web](https://github.com/tudoemcodigo/lib-tec-web) › [🌐 i18n](https://github.com/tudoemcodigo/lib-tec-web/tree/main/packages/i18n)

# 🌐 @tudoemcodigo/i18n

**Textos de interface em qualquer idioma: tradução ICU, escolha do idioma, catálogos que se combinam e formatadores com locale sempre explícito.**

ICU MessageFormat · Plural e seleção · Fallback para o idioma padrão · Catálogo por pacote e por sistema · Sem HTML interpretado

[![CI](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml/badge.svg)](https://github.com/tudoemcodigo/lib-tec-web/actions/workflows/ci.yml)
[![Versão](https://img.shields.io/badge/vers%C3%A3o-0.0.1-blue)](https://github.com/tudoemcodigo/lib-tec-web/blob/main/packages/i18n/CHANGELOG.md)
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

| Sem o i18n                                                     | Com o i18n                                                                   |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Texto solto no JSX; trocar de idioma é reescrever telas        | Toda mensagem vem de um catálogo por idioma (pt-BR padrão, outros opcionais) |
| Plural na mão (`item(s)`)                                      | ICU: `{total, plural, one {# item} other {# itens}}`                         |
| `toLocaleString()` sem argumento muda de resultado por máquina | Formatadores sempre com o locale do sistema, nunca o do navegador de quem vê |
| Chave faltando vira tela em branco ou exceção                  | Devolve a própria chave, avisa uma vez e continua                            |
| Dois pacotes disputam a mesma chave sem ninguém notar          | `mergeCatalogs` lança na subida se o mesmo idioma tem textos diferentes      |

---

## 📦 O que tem dentro

| Função                          | Entrega                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `createTranslator`              | Tradutor de um idioma (`t`, `has`), com fallback e aviso de chave ausente     |
| `mergeCatalogs` · `missingKeys` | Junta catálogos de pacotes e do sistema; lista chaves que faltam em um idioma |
| `resolveLocale`                 | Do que a pessoa pede (`navigator.languages`) para o que o sistema suporta     |
| `createFormatters`              | Número, moeda, data e data-hora com locale explícito                          |

---

## 📥 Instalação

```ini
# ~/.npmrc (PAT com escopo read:packages; o token vem da variável)
@tudoemcodigo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install @tudoemcodigo/i18n
```

> [!WARNING]
> **Não publicado ainda:** o pacote passa em `npm run verify` do monorepo, mas a primeira publicação pelo `release.yml` depende de aprovação (publicar é uma ação externa).

---

## 🚀 Início rápido

```ts
import {
  createFormatters,
  createTranslator,
  mergeCatalogs,
  resolveLocale,
} from '@tudoemcodigo/i18n';
import { catalogs as uiCatalogs } from '@tudoemcodigo/ui'; // quando o pacote ui existir
import { appCatalogs } from './messages';

const SUPPORTED = ['pt-BR', 'en'];
const catalogs = mergeCatalogs(uiCatalogs, appCatalogs); // lança se duas fontes discordam
const locale = resolveLocale(navigator.languages, SUPPORTED, 'pt-BR');

export const { t } = createTranslator({
  locale,
  messages: catalogs[locale] ?? {},
  fallbackMessages: catalogs['pt-BR'], // chave que falta cai no idioma padrão
  onMissing: (key) => console.warn('i18n: chave ausente', key), // nunca recebe valores
});
export const format = createFormatters(locale);

t('items.total', { total: 1500 }); // "1.500 itens"
format.formatCurrency(1234.5, 'BRL'); // "R$ 1.234,50"
```

No teste do sistema, `missingKeys(catalogs['pt-BR'], catalogs.en)` deve ser vazio: a falta aparece no CI, não na tela.

---

## ⚡ Compatibilidade

- **Node** 24 e navegadores com `Intl` e ICU completos; sem React (funciona em qualquer camada).
- **Dependência:** `intl-messageformat` ^12 (única; as demais funções são TypeScript puro).
- **Não verificado:** idiomas da direita para a esquerda; texto de interface em navegador sem dados de locale completos.

---

## 🛡️ Segurança · 🧪 Testes

- O resultado é **texto**, nunca HTML: valores com marcação aparecem como texto (o JSX escapa). Não use `dangerouslySetInnerHTML` com o resultado.
- Mensagem ICU inválida, placeholder sem valor e chave ausente **nunca lançam**; a chave aparece e o aviso sai uma vez, sem os valores (que podem ter dados pessoais).
- `resolveLocale` limita tamanho e quantidade das preferências e ignora entrada que não é texto; chave herdada do protótipo não vale como mensagem.
- A mensagem de conflito de `mergeCatalogs` nomeia chave e idioma, não o texto.
- **Testes:** 24 unitários do pacote (213 no monorepo, cobertura `v8` de 99,26% das linhas e 97,68% dos ramos), com casos hostis.

---

## 🤝 Contribuição · 🏷️ Versionamento · 📄 Licença

- **Contribuição**: veja o [README do monorepo](https://github.com/tudoemcodigo/lib-tec-web/blob/main/README.md#-contribuição--versionamento--licença).
- **Versionamento**: [SemVer 2.0](https://semver.org/lang/pt-BR/); nomes e assinaturas exportados só mudam com versão (FRT-PKG-02).
- **Licença**: [Apache 2.0](https://github.com/tudoemcodigo/lib-tec-web/blob/main/LICENSE).
