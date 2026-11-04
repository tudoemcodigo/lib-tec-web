import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkPackage } from '../../../scripts/check-package.js';
import * as core from '../src/core.js';
import * as index from '../src/index.js';

const packageDir = join(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8')) as {
  exports: Record<string, unknown>;
};

// FRT-PKG-02: este teste trava o contrato público. Mudou aqui sem mudar a versão do pacote é defeito.
describe('contrato público de @tudoemcodigo/theme', () => {
  it('subcaminhos exportados', () => {
    expect(Object.keys(pkg.exports)).toEqual([
      '.',
      './core',
      './tokens.css',
      './animations.css',
      './schema/themes.schema.json',
      './package.json',
    ]);
  });

  it('nomes exportados por "./core" (sem React nem DOM)', () => {
    expect(Object.keys(core).sort()).toEqual([
      'ANIMATIONS',
      'CONTRACT_VERSION',
      'CONTRAST_REQUIREMENTS',
      'DEFAULT_PALETTE',
      'MAX_THEMES',
      'PROTECTED_TOKEN_NAMES',
      'TOKEN_NAMES',
      'contrastRatio',
      'findContrastViolations',
      'isRealDate',
      'isTokenName',
      'mergePalette',
      'parseActiveThemeResponse',
      'parseThemesDocument',
      'selectActiveTheme',
      'toActiveTheme',
    ]);
  });

  it('nomes exportados pelo ponto de entrada principal', () => {
    expect(
      Object.keys(index)
        .filter((name) => !Object.hasOwn(core, name))
        .sort(),
    ).toEqual([
      'CONTRASTS',
      'DEFAULT_PREFERENCES',
      'MOTIONS',
      'PREFERENCES_STORAGE_KEY',
      'SEASONALS',
      'TEXT_SIZES',
      'THEMES',
      'applyPreferences',
      'applySeasonalTheme',
      'buildSeasonalCss',
      'clearSeasonalTheme',
      'getActiveTheme',
      'getPreferences',
      'initPreferences',
      'loadSeasonalTheme',
      'readPreferences',
      'setPreferences',
      'subscribePreferences',
      'useActiveSeasonalTheme',
      'usePreferences',
      'watchPreferencesForSeasonalTheme',
    ]);
  });

  it('o próprio package.json cumpre FRT-PKG-04', () => {
    expect(checkPackage(pkg, 'theme')).toEqual([]);
  });

  it('o ponto "./core" não importa React (roda em Node, no CI do repositório themes)', () => {
    const coreSources = ['core.ts', 'palette.ts', 'contrast.ts', 'manifest.ts'].map((file) =>
      readFileSync(join(packageDir, 'src', file), 'utf8'),
    );
    for (const source of coreSources) expect(source).not.toMatch(/from 'react'/);
  });
});
