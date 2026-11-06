# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/theme** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### ✨ Adicionado

- **Marca (`brand.css` e SVG):** `@tudoemcodigo/theme/brand.css` define `--tec-brand-logo-light`, `--tec-brand-logo-dark`, `--tec-brand-symbol-light` e `--tec-brand-symbol-dark` (camada `tec-tokens`) com `url()` relativo aos SVG do pacote, que o Vite reescreve e emite com hash (CSP `img-src 'self'`; arquivo pequeno vira `data:`, também permitido pelo TEC.Bff). Os quatro SVG são os originais da pasta oficial da marca, sem alteração, e também saem como `@tudoemcodigo/theme/brand/logo-light.svg`, `logo-dark.svg`, `symbol-light.svg` e `symbol-dark.svg`. Um teste confere o SHA-256 de cada um. Os sistemas deixam de manter cópia em `public/marca/`.
- **Tokens de design system (FRT-DSG):** `--tec-color-info` (protegido, com par de contraste testado e versão de alto contraste), `--tec-control-height` (36 px), `--tec-control-height-dense` (32 px) e `--tec-radius-lg`.

### 🎨 Alterado

- **Tons categóricos de selo:** tokens protegidos `--tec-color-tone-violet` (`#6d28d9`/`#c4a8ff`) e `--tec-color-tone-teal` (`#0f766e`/`#5eead4`), com versão de alto contraste (9:1 ou mais, testada) e pares de contraste no padrão. O tom `blue` do selo reaproveita `--tec-color-info`. Tema sazonal não os altera.

- **Redesenho visual (paleta, casca e escala):** o escuro deixa o azul-marinho e passa a um zinc neutro com tinta de marca, em quatro degraus de luminância (canvas `#0c0e14`, superfície `#141722`, casca `#0a0c11`, bordas `#262b3b`), como o painel do TudoIA. O claro usa canvas `#f4f6fb` com superfícies brancas. Acento `#4a55d4` (5,9:1 sobre branco) no claro e `#9aa5ff` (7,8:1 sobre a superfície) no escuro. Texto principal 15:1 ou mais e secundário 8:1 ou mais nos dois modos; borda de controle 3,7:1 ou mais. Todos os pares continuam no teste de contraste.
- **A casca acompanha o tema:** `--tec-shell-*` agora é `light-dark()` (branca no claro, mais funda que o canvas no escuro). `--tec-shell-text`, `--tec-shell-text-muted` e `--tec-shell-accent` deixam de ser fixos e viram pares claro/escuro. **Um manifesto sazonal que troque `shell-bg` para uma cor escura no modo claro precisa trocar também `shell-text`, `shell-text-muted` e `shell-accent`**, senão o contraste reprova e o tema é recusado (o app fica no padrão, sem quebrar).
- **Geometria:** `--tec-radius` de `0.25rem` para `0.375rem` (controle) e `--tec-radius-lg` de `0.5rem` para `0.625rem` (cartão, tabela, janela); `--tec-shell-header-height` de `4rem` para `3.5rem`; `--tec-shell-menu-width` de `15rem` para `14.5rem`.

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
