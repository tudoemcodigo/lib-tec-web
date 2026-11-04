/**
 * Base do Vitest dos frontends TEC: cobertura `v8` sobre todo o código-fonte com limiar mínimo de 90%
 * (FRT-TST-01, QUA-PIR-01). O limiar não pode ser baixado e toda exclusão extra traz o motivo.
 */
export const MIN_COVERAGE = 90;

const METRICS = ['lines', 'statements', 'functions', 'branches'];
const MIN_REASON_LENGTH = 10;

/** Só código gerado, tipos e testes ficam fora da cobertura (QUA-PIR-01). */
const DEFAULT_COVERAGE_EXCLUDE = [
  '**/*.test.{ts,tsx,js,mjs}',
  '**/*.d.ts',
  '**/*.css',
  '**/gerado/**',
  '**/generated/**',
];

// Curinga sem "**" nem extensão (por exemplo, "packages/<estrela>/src") não casa nenhum arquivo e a cobertura passaria
// a medir zero em silêncio. Diretório simples ("src") e padrões com "**" ou extensão são aceitos.
function matchesFiles(pattern) {
  return !pattern.includes('*') || pattern.includes('**') || /\.[a-z0-9{},]+$/i.test(pattern);
}

/**
 * @param {object} [options]
 * @param {string} [options.environment] ambiente de teste (padrão `jsdom`).
 * @param {string[]} [options.setupFiles] arquivos de preparação.
 * @param {string[]} [options.include] padrões dos arquivos de teste.
 * @param {string[]} [options.coverageInclude] código medido; vazio é erro (arquivo nunca importado também conta).
 * @param {{ pattern: string, reason: string }[]} [options.coverageExclude] exclusões extras, cada uma com motivo.
 * @param {Partial<Record<'lines' | 'statements' | 'functions' | 'branches', number>>} [options.thresholds] só pode subir.
 */
export function tecVitestConfig(options = {}) {
  const {
    environment = 'jsdom',
    setupFiles = [],
    include = ['src/**/*.test.{ts,tsx}'],
    coverageInclude = ['src'],
    coverageExclude = [],
    thresholds = {},
  } = options;

  if (coverageInclude.length === 0) {
    throw new Error(
      'coverageInclude não pode ser vazio: sem ele, arquivo nunca importado não conta na cobertura.',
    );
  }

  const useless = coverageInclude.find((pattern) => !matchesFiles(pattern));
  if (useless !== undefined) {
    throw new Error(
      `coverageInclude "${useless}" tem curinga que não casa arquivos (use "/**" no fim): a cobertura mediria zero em silêncio.`,
    );
  }

  const extraExcludes = coverageExclude.map((entry) => {
    const reason = typeof entry.reason === 'string' ? entry.reason.trim() : '';
    if (typeof entry.pattern !== 'string' || entry.pattern.trim() === '') {
      throw new Error('Toda exclusão de cobertura precisa de um "pattern".');
    }
    if (reason.length < MIN_REASON_LENGTH) {
      throw new Error(
        `A exclusão de cobertura "${entry.pattern}" precisa de um motivo (mínimo ${String(MIN_REASON_LENGTH)} caracteres).`,
      );
    }
    return entry.pattern;
  });

  const finalThresholds = {};
  for (const metric of METRICS) {
    const value = thresholds[metric] ?? MIN_COVERAGE;
    if (typeof value !== 'number' || Number.isNaN(value) || value < MIN_COVERAGE || value > 100) {
      throw new Error(
        `O limiar de cobertura "${metric}" deve estar entre ${String(MIN_COVERAGE)} e 100 (recebido: ${String(value)}).`,
      );
    }
    finalThresholds[metric] = value;
  }

  return {
    test: {
      environment,
      globals: true,
      setupFiles,
      include,
      coverage: {
        provider: 'v8',
        include: coverageInclude,
        exclude: [...DEFAULT_COVERAGE_EXCLUDE, ...extraExcludes],
        thresholds: finalThresholds,
        reporter: ['text-summary', 'lcov'],
      },
    },
  };
}
