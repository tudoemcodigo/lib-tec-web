import { defineConfig } from 'vitest/config';
import { tecVitestConfig } from '@tudoemcodigo/tooling/vitest';

// O monorepo usa a própria configuração base (cobertura mínima de 90%, FRT-TST-01)
export default defineConfig(
  tecVitestConfig({
    environment: 'node',
    include: ['packages/*/test/**/*.test.{js,ts,tsx}', 'scripts/**/*.test.js'],
    coverageInclude: ['packages/*/src/**', 'scripts'],
    coverageExclude: [
      {
        pattern: 'scripts/check-packages.mjs',
        reason:
          'Ponto de entrada da CLI: só lê arquivos e chama check-package.js, testado à parte.',
      },
      {
        pattern: 'scripts/copy-css.mjs',
        reason: 'Passo de build: copia .css para dist; o resultado é conferido pelo npm pack.',
      },
      {
        pattern: 'packages/*/src/index.ts',
        reason: 'Só reexporta módulos já cobertos; o contrato é travado em contract.test.ts.',
      },
      {
        pattern: 'packages/tooling/test/fixtures/**',
        reason: 'Código hostil de propósito, usado só como entrada do teste de lint.',
      },
    ],
  }),
);
