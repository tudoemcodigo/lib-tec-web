import type { Linter } from 'eslint';

export interface TecEslintOptions {
  readonly tsconfigRootDir: string;
  readonly ignores?: readonly string[];
  readonly allowDefaultProject?: readonly string[];
  readonly httpFiles?: readonly string[];
  readonly zodFiles?: readonly string[];
  readonly testFiles?: readonly string[];
  readonly nodeFiles?: readonly string[];
}

export declare function tecEslintConfig(options: TecEslintOptions): Linter.Config[];
