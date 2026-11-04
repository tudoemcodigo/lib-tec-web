import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkPackage } from '../../../scripts/check-package.js';
import * as eslintModule from '../src/eslint.js';
import prettierConfig from '@tudoemcodigo/tooling/prettier';
import * as vitestModule from '../src/vitest.js';

const packageDir = join(import.meta.dirname, '..');
const read = (relative) => JSON.parse(readFileSync(join(packageDir, relative), 'utf8'));

// FRT-PKG-02: este teste trava o contrato público. Mudou aqui sem mudar a versão do pacote é defeito.
describe('contrato público de @tudoemcodigo/tooling', () => {
  it('subcaminhos exportados', () => {
    expect(Object.keys(read('package.json').exports)).toEqual([
      './eslint',
      './vitest',
      './prettier',
      './tsconfig/base.json',
      './package.json',
    ]);
  });

  it('nomes exportados por módulo', () => {
    expect(Object.keys(eslintModule).sort()).toEqual(['tecEslintConfig']);
    expect(Object.keys(vitestModule).sort()).toEqual(['MIN_COVERAGE', 'tecVitestConfig']);
  });

  it('o Prettier resolve pelo nome do pacote e mantém os valores', () => {
    expect(prettierConfig).toEqual({
      singleQuote: true,
      semi: true,
      trailingComma: 'all',
      printWidth: 100,
    });
  });

  it('o tsconfig base mantém as opções estritas de FRT-BAS-01', () => {
    const { compilerOptions } = read('tsconfig/base.json');
    for (const flag of [
      'strict',
      'noUncheckedIndexedAccess',
      'exactOptionalPropertyTypes',
      'noImplicitOverride',
      'verbatimModuleSyntax',
    ]) {
      expect(compilerOptions[flag], flag).toBe(true);
    }
  });

  it('o próprio package.json cumpre FRT-PKG-04', () => {
    expect(checkPackage(read('package.json'), 'tooling')).toEqual([]);
  });

  it('a CLI check:packages passa neste repositório', () => {
    const cli = join(packageDir, '..', '..', 'scripts', 'check-packages.mjs');
    const out = execFileSync(process.execPath, [cli], { encoding: 'utf8' });
    expect(out).toContain('check:packages ok');
  });
});
