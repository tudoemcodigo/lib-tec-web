import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkPackage } from '../../../scripts/check-package.js';

const packageDir = join(import.meta.dirname, '..');
const read = (file: string) => readFileSync(join(packageDir, file), 'utf8');
const pkg = JSON.parse(read('package.json')) as {
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
};

/** Texto do CSS sem comentários, para conferir só o que o navegador lê. */
const code = (file: string) => read(file).replaceAll(/\/\*[\s\S]*?\*\//g, '');

// FRT-PKG-02: este teste trava o contrato público de estilos. Mudou aqui sem CHANGELOG é defeito.
describe('contrato público de estilos de @tudoemcodigo/ui', () => {
  it('subcaminhos CSS exportados e o package.json segue o padrão dos pacotes', () => {
    expect(Object.keys(pkg.exports)).toEqual([
      '.',
      './ui.css',
      './base.css',
      './styles.css',
      './package.json',
    ]);
    expect(checkPackage(pkg, 'ui')).toEqual([]);
  });

  it('o tema é peer: o sistema controla uma só versão dos tokens', () => {
    expect(pkg.peerDependencies['@tudoemcodigo/theme']).toBeDefined();
  });

  it('os arquivos exportados existem na origem (o build copia para dist)', () => {
    for (const file of ['ui.css', 'base.css', 'styles.css']) {
      expect(existsSync(join(packageDir, 'src', file)), file).toBe(true);
    }
  });
});

describe('ui.css: estado inválido do campo', () => {
  // O Base UI põe data-invalid no rótulo e na mensagem do Field, não só no controle.
  it('o contorno de erro vale só para o controle, nunca para o rótulo ou a mensagem', () => {
    const css = code('src/ui.css');
    expect(css).toContain('.ui-field :is(input, select, textarea)[data-invalid]');
    expect(css).not.toMatch(/\.ui-field \[data-invalid\]/);
  });
});

describe('styles.css: ordem das camadas e entrada única', () => {
  const styles = code('src/styles.css');

  it('declara as camadas antes de qualquer importação, com a base depois dos componentes', () => {
    const layers = /@layer\s+([^;]+);/.exec(styles);
    expect(layers?.[1]?.split(',').map((name) => name.trim())).toEqual([
      'tec-tokens',
      'tec-reset',
      'tec-ui',
      'tec-base',
    ]);
    expect(styles.indexOf('@layer')).toBeLessThan(styles.indexOf('@import'));
  });

  it('importa tokens, animações, componentes e base, nessa ordem', () => {
    expect([...styles.matchAll(/@import\s+'([^']+)'/g)].map((m) => m[1])).toEqual([
      '@tudoemcodigo/theme/tokens.css',
      '@tudoemcodigo/theme/animations.css',
      '@tudoemcodigo/theme/brand.css',
      './ui.css',
      './base.css',
    ]);
  });
});

describe('base.css: tudo em camada', () => {
  const base = code('src/base.css');

  /** Cabeçalho (prelúdio) de cada bloco de nível zero: `@layer tec-base`, `.seletor`, `@media ...`. */
  function topLevelPreludes(css: string): string[] {
    const preludes: string[] = [];
    let depth = 0;
    let current = '';
    for (const char of css) {
      if (char === '{') {
        if (depth === 0) preludes.push(current.trim());
        depth += 1;
        current = '';
      } else if (char === '}') {
        depth -= 1;
        current = '';
      } else if (depth === 0) {
        current += char;
      }
    }
    return preludes;
  }

  it('não deixa nenhuma regra sem camada (senão venceria o CSS do sistema)', () => {
    const preludes = topLevelPreludes(base);
    expect(preludes.length).toBeGreaterThan(0);
    for (const prelude of preludes) expect(prelude).toMatch(/^@layer tec-(reset|base)$/);
  });

  it('usa só as camadas tec-reset e tec-base', () => {
    const names = [...base.matchAll(/@layer\s+([\w-]+)/g)].map((m) => m[1]);
    expect(new Set(names)).toEqual(new Set(['tec-reset', 'tec-base']));
  });

  it('as classes públicas são em inglês com prefixo ui- (FRT-PKG-03)', () => {
    const classes = new Set([...base.matchAll(/\.([a-z][\w-]*)/g)].map((m) => m[1]));
    expect(classes.size).toBeGreaterThan(10);
    for (const name of classes) expect(name, name).toMatch(/^ui-/);
  });

  it('não herda nome da casca do sistema (menu, cabeçalho, banner)', () => {
    expect(base).not.toMatch(/\.(menu|cabecalho|casca|banner|espaco|pulos)\b/);
  });

  it('o contraste alto não depende de classe da casca', () => {
    const selectors = (base.match(/:root\[data-contrast='high'\][^,{]*/g) ?? []).map((rule) =>
      rule.trim(),
    );
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector).toMatch(
        /^:root\[data-contrast='high'\] (a|\.ui-skip-link|\.ui-banner|\.ui-slot|input|select|textarea)$/,
      );
    }
  });
});
