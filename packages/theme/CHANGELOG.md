# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/theme** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.0.1] - não lançado

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

- A CSP real do `TEC.Bff` e o endpoint `/bff/theme` ainda não existem neste repositório de componentes; o E2E usa uma CSP equivalente e um servidor de teste.
- Fontes (`--tec-font-*`) não são trocáveis por tema (carregar fonte exigiria origem extra na CSP).
- Instalação pelo registro **não verificada** (nada publicado).
