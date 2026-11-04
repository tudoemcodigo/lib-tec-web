import { tecEslintConfig } from '@tudoemcodigo/tooling/eslint';

export default tecEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  // Fixtures com código hostil de propósito: só o teste do tooling as lê
  ignores: ['packages/tooling/test/fixtures'],
  // E2E e testes ficam isentos das restrições de sintaxe (o E2E usa o navegador de propósito)
  testFiles: ['**/*.test.{ts,tsx}', 'packages/*/e2e/**'],
  // O monorepo roda em Node (configs, scripts, testes e servidor do E2E)
  nodeFiles: ['*.config.js', 'scripts/**', 'packages/*/test/**', 'packages/*/e2e/**'],
});
