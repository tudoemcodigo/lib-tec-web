export declare const MIN_COVERAGE: 90;

export interface CoverageExclusion {
  readonly pattern: string;
  readonly reason: string;
}

export interface TecVitestOptions {
  readonly environment?: string;
  readonly setupFiles?: readonly string[];
  readonly include?: readonly string[];
  readonly coverageInclude?: readonly string[];
  readonly coverageExclude?: readonly CoverageExclusion[];
  readonly thresholds?: Partial<Record<'lines' | 'statements' | 'functions' | 'branches', number>>;
}

export declare function tecVitestConfig(options?: TecVitestOptions): {
  test: Record<string, unknown>;
};
