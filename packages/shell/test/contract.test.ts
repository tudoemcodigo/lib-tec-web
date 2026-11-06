import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkPackage } from '../../../scripts/check-package.js';
import * as index from '../src/index.js';
import { shellMessages } from '../src/messages.js';

const packageDir = join(import.meta.dirname, '..');
const read = (file: string) => readFileSync(join(packageDir, file), 'utf8');
const pkg = JSON.parse(read('package.json')) as {
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
  dependencies?: Record<string, string>;
};

// FRT-PKG-02: este teste trava o contrato público. Mudou aqui sem CHANGELOG e versão é defeito.
describe('contrato público de @tudoemcodigo/shell', () => {
  it('subcaminhos exportados e package.json no padrão dos pacotes', () => {
    expect(Object.keys(pkg.exports)).toEqual(['.', './shell.css', './package.json']);
    expect(checkPackage(pkg, 'shell')).toEqual([]);
  });

  it('peers: React, roteador, Base UI e os pacotes theme e ui; nenhuma dependência própria', () => {
    expect(Object.keys(pkg.peerDependencies).sort()).toEqual([
      '@base-ui/react',
      '@tanstack/react-router',
      '@tudoemcodigo/theme',
      '@tudoemcodigo/ui',
      'react',
      'react-dom',
    ]);
    expect(pkg.dependencies).toBeUndefined();
  });

  it('nomes exportados pelo ponto de entrada', () => {
    expect(Object.keys(index).sort()).toEqual([
      'AccessibilityPage',
      'AppShell',
      'HelpPage',
      'ProfilePage',
      'ShellIcon',
      'ShellTextProvider',
      'shellMessages',
      'useShellText',
    ]);
  });

  it('o CSS exportado existe na origem (o build copia para dist)', () => {
    expect(existsSync(join(packageDir, 'src', 'shell.css'))).toBe(true);
  });

  it('chaves de mensagem: en tem as mesmas do pt-BR, todas com o prefixo shell.', () => {
    const keys = Object.keys(shellMessages['pt-BR']);
    expect(Object.keys(shellMessages.en)).toEqual(keys);
    expect(keys.every((key) => key.startsWith('shell.'))).toBe(true);
  });
});

describe('shell.css: camada, tokens e classes em inglês', () => {
  const css = read('src/shell.css')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/url\([^)]*\)/g, '');

  it('declara a ordem das camadas do ui e põe tudo em tec-shell', () => {
    expect(/@layer\s+tec-tokens,\s*tec-reset,\s*tec-ui,\s*tec-base,\s*tec-shell;/.test(css)).toBe(
      true,
    );
    expect(css.indexOf('@layer tec-shell {')).toBeGreaterThan(0);
    // Nada fora da camada além das declarações de ordem
    expect(
      css
        .replace(/@layer tec-shell \{[\s\S]*\}\s*$/, '')
        .replace(/@layer[^;]+;/, '')
        .trim(),
    ).toBe('');
  });

  it('só tokens --tec-*, sem cor fixa nem classe em português', () => {
    expect(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i.test(css)).toBe(false);
    const classes = [...css.matchAll(/\.([a-z][\w-]*)/g)].map((m) => m[1] ?? '');
    const foreign = classes.filter((name) => !/^(shell|ui)-?/.test(name) && name !== 'shell');
    expect(foreign).toEqual([]);
  });
});
