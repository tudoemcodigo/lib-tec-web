# 📝 Changelog

Todas as mudanças relevantes do **lib-tec-web** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e cada pacote usa [Versionamento Semântico](https://semver.org/lang/pt-BR/). Cada pacote tem o próprio `CHANGELOG.md`; este registra o que é do repositório.

## [Não lançado]

### ✨ Adicionado

- Estrutura do monorepo (npm workspaces em `packages/*`), `.npmrc` com `ignore-scripts`, Node 24, Prettier, ESLint, `tsconfig` e Vitest com cobertura mínima de 90%.
- `scripts/check-packages.mjs`: confere o `package.json` de cada pacote contra FRT-PKG-04.
- Pacote `@tudoemcodigo/tooling` `0.0.1` (não publicado).
- Pacote `@tudoemcodigo/theme` `0.0.1` (não publicado): tokens, preferências e tema sazonal por manifesto fechado, com E2E em Chromium, Firefox e WebKit.
- `npm run build` e `npm run e2e`.
- Documentação no padrão dos componentes TEC: README, `docs/` (índice, uso, opções, erros, segurança, compatibilidade, tema e tema sazonal).

### 🐛 Corrigido

- A cobertura do monorepo media só `scripts/`: o padrão `packages/*/src` não casa arquivo nenhum. Agora é `packages/*/src/**`, e o `tecVitestConfig` recusa curinga que mediria zero arquivos.
