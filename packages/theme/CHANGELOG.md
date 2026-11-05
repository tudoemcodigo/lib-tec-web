# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/theme** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### ✨ Adicionado

- **Tokens de design system (FRT-DSG):** `--tec-color-info` (protegido, com par de contraste testado e versão de alto contraste), `--tec-control-height` (36 px), `--tec-control-height-dense` (32 px) e `--tec-radius-lg`.

### 🎨 Alterado

- **Paleta mais suave:** o acento do tema claro passa de `#4f5be8` para `#5562d6` (5,1:1 sobre branco, mantém AA) e a casca (cabeçalho e menu lateral) deixa o azul-marinho `#0b1230` pelo azul acinzentado `#2a3558` (texto 9,9:1), com hover, ativo e borda acompanhando; no escuro, `#181e30` vira `#1f2640`. `--tec-shell-text-muted` passa de `#aab3dc` para `#b9c1e6` para manter o contraste sobre a casca mais clara.
- **Cabeçalho mais alto:** `--tec-shell-header-height` de `3rem` para `4rem`, para a marca ter o tamanho que o logo pede.

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
- Publicado em 2026-11-04 com atestado de procedência; o `web-templatetec` já o consome (E2E no app real em Chromium, Firefox e WebKit); o fluxo contra a pilha completa (Keycloak, API e BFF) ainda não foi exercitado.
