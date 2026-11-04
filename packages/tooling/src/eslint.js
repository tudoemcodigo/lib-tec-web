import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

/** Sinks de XSS (FRT-SEG-04), escrita em storage (FRT-SEG-01) e texto fora do catálogo (FRT-ACE-08/09). */
const restrictedSyntax = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'FRT-SEG-04: HTML cru é proibido.',
  },
  {
    selector: 'AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]',
    message: 'FRT-SEG-04: innerHTML/outerHTML proibidos.',
  },
  {
    selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
    message: 'FRT-SEG-04: insertAdjacentHTML proibido.',
  },
  {
    selector: "CallExpression[callee.object.name='document'][callee.property.name='write']",
    message: 'FRT-SEG-04: document.write proibido.',
  },
  {
    selector:
      "MemberExpression[property.name='setItem']:matches([object.name=/^(localStorage|sessionStorage)$/], [object.property.name=/^(localStorage|sessionStorage)$/])",
    message:
      'FRT-SEG-01: nada sensível em storage; a sessão é do BFF. A exceção das preferências mora no pacote theme.',
  },
  {
    selector: 'JSXText[value=/\\S/]',
    message: 'FRT-ACE-08: texto de interface vem do catálogo (t), não solto no JSX.',
  },
  {
    selector: 'JSXAttribute[name.name=/^(aria-label|title|placeholder|alt)$/] > Literal',
    message: 'FRT-ACE-08: texto de interface vem do catálogo (t).',
  },
  {
    selector:
      'CallExpression[callee.property.name=/^toLocale(String|DateString|TimeString)$/][arguments.length=0]',
    message: 'FRT-ACE-09: use Intl com locale explícito (formatadores do pacote i18n).',
  },
];

const HTTP_MESSAGE = 'FRT-API-02: HTTP só pelo módulo único de cliente (pacote api-client).';

/**
 * Cria a configuração flat do ESLint dos frontends TEC (FRT-BAS-02/03, FRT-API-02, FRT-SEG-01/04, FRT-ACE-08/09).
 *
 * @param {object} options
 * @param {string} options.tsconfigRootDir pasta do `tsconfig` (use `import.meta.dirname`).
 * @param {string[]} [options.ignores] padrões ignorados além de `dist`, `coverage` e `node_modules`.
 * @param {string[]} [options.allowDefaultProject] arquivos fora do `tsconfig` que o ESLint tipado deve aceitar.
 * @param {string[]} [options.httpFiles] únicos arquivos autorizados a usar `fetch`/`XMLHttpRequest` (o cliente HTTP).
 * @param {string[]} [options.zodFiles] únicos arquivos autorizados a importar `zod` (o wrapper sem JIT, FRT-SEG-14).
 * @param {string[]} [options.testFiles] padrões de arquivos de teste.
 * @param {string[]} [options.nodeFiles] arquivos que rodam em Node (configs, scripts): recebem os globais do Node.
 */
export function tecEslintConfig(options) {
  const {
    tsconfigRootDir,
    ignores = [],
    allowDefaultProject = [],
    httpFiles = [],
    zodFiles = [],
    testFiles = ['**/*.test.{ts,tsx}', 'src/test/**', 'e2e/**'],
    nodeFiles = ['*.config.{js,mjs,ts}'],
  } = options;

  if (typeof tsconfigRootDir !== 'string' || tsconfigRootDir === '') {
    throw new Error('tecEslintConfig exige tsconfigRootDir (use import.meta.dirname).');
  }

  return tseslint.config(
    { ignores: ['**/dist', '**/coverage', '**/node_modules', ...ignores] },
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        ecmaVersion: 2023,
        globals: { ...globals.browser },
        parserOptions: {
          projectService: { allowDefaultProject },
          tsconfigRootDir,
        },
      },
      plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
      rules: {
        ...reactHooks.configs.recommended.rules,
        ...jsxA11y.flatConfigs.strict.rules,
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-restricted-syntax': ['error', ...restrictedSyntax],
        'no-restricted-globals': [
          'error',
          { name: 'fetch', message: HTTP_MESSAGE },
          { name: 'XMLHttpRequest', message: HTTP_MESSAGE },
        ],
        'no-restricted-imports': [
          'error',
          {
            paths: [
              { name: 'axios', message: HTTP_MESSAGE },
              {
                name: 'zod',
                message: 'Importe z do wrapper sem JIT (sem eval sob CSP, FRT-SEG-04/05/14).',
              },
            ],
          },
        ],
        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
            'ts-nocheck': true,
            minimumDescriptionLength: 10,
          },
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },
    ...(httpFiles.length > 0
      ? [{ files: httpFiles, rules: { 'no-restricted-globals': 'off' } }]
      : []),
    ...(zodFiles.length > 0
      ? [{ files: zodFiles, rules: { 'no-restricted-imports': 'off' } }]
      : []),
    {
      files: testFiles,
      rules: {
        'no-restricted-syntax': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    { files: nodeFiles, languageOptions: { globals: { ...globals.node } } },
    {
      files: ['**/*.js', '**/*.mjs', '**/*.config.ts'],
      extends: [tseslint.configs.disableTypeChecked],
    },
    prettier,
  );
}
