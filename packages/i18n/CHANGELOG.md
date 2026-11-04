# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/i18n** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### ✨ Adicionado

- `createTranslator`: ICU MessageFormat (plural, seleção), fallback para o idioma padrão e `onMissing` (uma vez por chave, sem valores). Nunca lança.
- `mergeCatalogs` e `missingKeys`: catálogos por pacote e por sistema; conflito de texto no mesmo idioma lança.
- `resolveLocale`: do pedido da pessoa para o idioma suportado, com limites contra entrada hostil.
- `createFormatters`: número, moeda, data e data-hora com locale explícito; data sem hora formatada em UTC e calendário impossível vira texto vazio.

### 🧪 Testes

- 24 testes unitários com casos hostis (marcação em valor, ICU inválido, `__proto__`, preferências enormes).

### ⚠️ Limites e itens não verificados

- Ainda não publicado: depende da aprovação do dono para rodar o `release.yml`.
- O `web-templatetec` ainda usa a própria cópia do tradutor; a migração para o pacote é o próximo passo.
