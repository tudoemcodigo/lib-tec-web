import { describe, expect, it } from 'vitest';
import { MIN_COVERAGE, tecVitestConfig } from '../src/vitest.js';

describe('tecVitestConfig', () => {
  it('padrão: v8, jsdom, todo o src medido e 90% em todas as métricas', () => {
    const { test } = tecVitestConfig();
    expect(test.environment).toBe('jsdom');
    expect(test.coverage.provider).toBe('v8');
    expect(test.coverage.include).toEqual(['src']);
    expect(test.coverage.thresholds).toEqual({
      lines: 90,
      statements: 90,
      functions: 90,
      branches: 90,
    });
    expect(MIN_COVERAGE).toBe(90);
  });

  it('só gerado, tipos e testes ficam fora por padrão', () => {
    const { exclude } = tecVitestConfig().test.coverage;
    expect(exclude).toEqual([
      '**/*.test.{ts,tsx,js,mjs}',
      '**/*.d.ts',
      '**/*.css',
      '**/gerado/**',
      '**/generated/**',
    ]);
  });

  it('aceita subir o limiar, nunca baixar', () => {
    const { thresholds } = tecVitestConfig({ thresholds: { lines: 95, branches: 100 } }).test
      .coverage;
    expect(thresholds).toEqual({ lines: 95, statements: 90, functions: 90, branches: 100 });
    expect(() => tecVitestConfig({ thresholds: { lines: 89 } })).toThrow(/lines/);
    expect(() => tecVitestConfig({ thresholds: { branches: 0 } })).toThrow(/branches/);
    expect(() => tecVitestConfig({ thresholds: { functions: 101 } })).toThrow(/functions/);
    expect(() => tecVitestConfig({ thresholds: { statements: Number.NaN } })).toThrow(/statements/);
    expect(() => tecVitestConfig({ thresholds: { statements: '95' } })).toThrow(/statements/);
  });

  it('exclusão extra exige padrão e motivo', () => {
    const ok = tecVitestConfig({
      coverageExclude: [
        { pattern: 'src/main.tsx', reason: 'Ponto de entrada: só monta a aplicação.' },
      ],
    });
    expect(ok.test.coverage.exclude).toContain('src/main.tsx');

    expect(() =>
      tecVitestConfig({ coverageExclude: [{ pattern: 'src/x.ts', reason: '' }] }),
    ).toThrow(/motivo/);
    expect(() =>
      tecVitestConfig({ coverageExclude: [{ pattern: 'src/x.ts', reason: 'curto' }] }),
    ).toThrow(/motivo/);
    expect(() => tecVitestConfig({ coverageExclude: [{ pattern: 'src/x.ts' }] })).toThrow(/motivo/);
    expect(() =>
      tecVitestConfig({ coverageExclude: [{ pattern: ' ', reason: 'motivo suficiente aqui' }] }),
    ).toThrow(/pattern/);
    expect(() =>
      tecVitestConfig({ coverageExclude: [{ reason: 'motivo suficiente aqui' }] }),
    ).toThrow(/pattern/);
  });

  it('curinga que não casa nenhum arquivo é recusado (regressão: "packages/*/src" media zero arquivos)', () => {
    expect(() => tecVitestConfig({ coverageInclude: ['packages/*/src'] })).toThrow(/curinga/);
    expect(() => tecVitestConfig({ coverageInclude: ['src', 'lib/*'] })).toThrow(/curinga/);
    // formas que casam arquivos
    expect(() => tecVitestConfig({ coverageInclude: ['packages/*/src/**'] })).not.toThrow();
    expect(() => tecVitestConfig({ coverageInclude: ['src/**/*.ts'] })).not.toThrow();
    expect(() => tecVitestConfig({ coverageInclude: ['src', 'scripts'] })).not.toThrow();
  });

  it('CSS não conta como código na cobertura', () => {
    expect(tecVitestConfig().test.coverage.exclude).toContain('**/*.css');
  });

  it('cobertura sem código medido é erro (arquivo nunca importado precisa contar)', () => {
    expect(() => tecVitestConfig({ coverageInclude: [] })).toThrow(/coverageInclude/);
  });
});
