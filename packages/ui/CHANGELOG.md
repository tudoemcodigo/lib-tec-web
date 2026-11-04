# 📝 Changelog

Todas as mudanças relevantes do **@tudoemcodigo/ui** são registradas aqui. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

Versão inaugural (`0.0.1`): feedback, página, controles e formulário padronizados.

### ✨ Adicionado

- **Feedback:** `Alert` (tom em ícone, texto e cor), `ToastProvider` e `useToast` (fila de 4, pausa com mouse e foco, erro fica até fechar), `ErrorState` (código de suporte copiável e nova tentativa), `EmptyState`, `LoadingState` (esqueleto, `aria-busy`).
- **Página:** `PageHeader` (trilha com `renderLink`, único `h1`, situação e ações), `Section` (com `flush`), `DataList`, `SummaryList` (total em destaque), `ScrollRegion` (rolável por teclado).
- **Controles:** `Button` (variantes, `loading` sem duplo clique), `buttonAttributes`, `Badge`, `ConfirmDialog` (Base UI).
- **Formulário:** `TextField`, `SelectField`, `TextAreaField` e `FormErrorSummary` (foco no resumo; link leva ao campo).
- **Textos:** `uiMessages` em pt-BR e en, `UiProvider` com idioma e sobrescrita, ícones decorativos.
- **CSS** (`ui.css`) na camada `tec-ui`, só com tokens `--tec-*`; funciona com o tema sazonal e o alto contraste.
- **Paginação e debounce:** `Pagination` (página, total de páginas, contagem real de registros no idioma do `UiProvider`) e `useDebouncedValue`; `useUiLocale` e `fillUiText` no provider de textos. Vieram do `web-templatetec`, onde eram genéricos demais para ficar.
- **Menu de ações:** `ActionMenu` (botão de três pontos que abre a lista; itens de ação ou de link com `renderLink`, tom de perigo, separador e desabilitado; teclado, foco e leitor de tela pelo Base UI).
- **Ícones do Font Awesome Free** no lugar dos desenhos próprios: `FaIcon` desenha só os dados do ícone (sem `fontawesome-svg-core` nem CSS em tempo de execução, por causa da CSP estrita) e os nomes `Icon*` seguem os mesmos; novos `IconMore`, `IconPlus`, `IconHome`, `IconUsers`, `IconReceipt`, `IconSignOut`, `IconMenu`, `IconContrast`, `IconHelp`, `IconCollapse`, `IconExpand`, `IconTop`, `IconChevronDown`.
- **Ações de linha:** `IconButton` (rótulo obrigatório vira nome acessível e dica) e `iconButtonAttributes` (para links), com classes `ui-icon-action` e `ui-row-actions`; ícones `IconEye`, `IconPencil`, `IconTrash`, `IconPause`, `IconPlay`, `IconUser`, `IconSearch`, `IconFilter`.
- `headingLevel` em `EmptyState` e `ErrorState`: o título é `h1` quando o estado ocupa a página inteira (404, acesso negado).

### 🧪 Testes

- 66 testes unitários com casos hostis (marcação em título e mensagem, texto gigante, nome de campo malicioso, `clipboard` negado, relógio simulado).
- Exercitado no app real do `web-templatetec`: E2E em Chromium e Firefox com axe em todas as rotas e estados.

### ⚠️ Limites e itens não verificados

- Ainda não publicado: depende do workflow `release.yml`.
- Sem componente de tabela de dados (ordenação, seleção) nem de combobox: o `web-templatetec` usa `select` nativo.
- WebKit, leitor de tela e idiomas da direita para a esquerda não foram verificados.
