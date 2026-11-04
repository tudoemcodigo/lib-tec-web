# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/theme** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### 🐛 Corrigido

- O desempate do `selectActiveTheme` usa ordem por unidade de código (igual ao `StringComparer.Ordinal` do C#) em vez de `localeCompare`; teste cobre hífen, dígito e letra.

### 🧪 Testes

- Guarda de SHA-256 do arquivo de casos compartilhado com o TEC.Bff: mudar o arquivo sem atualizar a cópia do BFF reprova o teste.

## [0.0.1] - 2026-11-04

Versão inaugural: identidade visual, preferências e tema sazonal.

### ✨ Adicionado

- **Tokens** (`tokens.css`): paleta Grafo em `--tec-*` com `light-dark()`, contraste alto (9:1), tamanho do texto, em camada `tec-tokens`.
- **Preferências** (`initPreferences`, `setPreferences`, `usePreferences`...): tema, tamanho do texto, contraste, movimento, atalhos e tema sazonal; única escrita em `localStorage` (chave `tec.preferences.v1`), valores fechados.
- **Manifesto de tema sazonal** (`parseThemesDocument`, `selectActiveTheme`, `parseActiveThemeResponse`, `toActiveTheme`) com JSON Schema (`schema/themes.schema.json`) e casos compartilhados com o BFF.
- **Contraste WCAG** (`contrastRatio`, `findContrastViolations`): 24 pares de cores verificados em claro e escuro.
- **Aplicação por CSSOM** (`loadSeasonalTheme`, `applySeasonalTheme`...): `adoptedStyleSheets`, falha fechada para o tema padrão; opção "sem tema sazonal" e alto contraste do usuário vencem o tema.
- **Animação de neve** (`animations.css`) em CSS puro, desligada por `prefers-reduced-motion` e por "reduzir animações".
- **Testes:** unitários (paridade `tokens.css` × paleta, casos hostis, paridade JSON Schema × validador) e 42 E2E em Chromium, Firefox e WebKit sob CSP estrita.

### ⚠️ Limites e itens não verificados

- O E2E usa uma CSP equivalente à do `TEC.Bff` e um servidor de teste; o endpoint `GET /bff/theme` está implementado no `TEC.Bff` (lib-tec-bff), com a mesma validação e os mesmos casos hostis.
- Fontes (`--tec-font-*`) não são trocáveis por tema (carregar fonte exigiria origem extra na CSP).
- Publicado em 2026-11-04 com atestado de procedência; o consumo por uma SPA real (migração do `web-templatetec`) ainda não foi feito.
