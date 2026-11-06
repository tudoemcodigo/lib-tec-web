import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageDir = join(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8')) as {
  exports: Record<string, string>;
  files: string[];
};
const css = readFileSync(join(packageDir, 'src', 'brand.css'), 'utf8');

// Pasta oficial da marca: quando existe na máquina, é a fonte da verdade; senão vale o SHA-256 gravado abaixo.
const OFFICIAL_DIR = 'D:/Producoes/TudoEmCodigo/marca/SVG';

// FRT-PKG-02: variável, subcaminho e arquivo. Os hashes travam "usar os arquivos originais da marca".
const BRAND = [
  {
    variable: '--tec-brand-logo-light',
    subpath: './brand/logo-light.svg',
    file: 'tudoemcodigo-horizontal-transparente-texto-escuro.svg',
    sha256: 'a152995d363b0c01fcbeafbed5523dfa7a94890ad0514fbdc77f50ebf5770748',
  },
  {
    variable: '--tec-brand-logo-dark',
    subpath: './brand/logo-dark.svg',
    file: 'tudoemcodigo-horizontal-transparente-texto-branco.svg',
    sha256: 'c96c4ff3a137731a97cb34893cf42cb2eafd4493a886e3e356307b619c181083',
  },
  {
    variable: '--tec-brand-symbol-light',
    subpath: './brand/symbol-light.svg',
    file: 'tudoemcodigo-simbolo-cores-fundo-claro.svg',
    sha256: 'b6570fda640cbfd5cc34278e23b43527b04083ebfb65b10db543d7702ea7184b',
  },
  {
    variable: '--tec-brand-symbol-dark',
    subpath: './brand/symbol-dark.svg',
    file: 'tudoemcodigo-simbolo-cores-fundo-escuro.svg',
    sha256: '1c39c272ce5a99a3d192a6c8b0ddfeacf86147c52cd4a1bb27a42a37d081ccfe',
  },
] as const;

const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

describe('brand.css e os SVG da marca', () => {
  it('exporta o CSS e os quatro SVG, apontando para dist/brand', () => {
    expect(pkg.exports['./brand.css']).toBe('./dist/brand.css');
    for (const item of BRAND) {
      expect(pkg.exports[item.subpath]).toBe(`./dist/brand/${item.file}`);
    }
    expect(pkg.files).toContain('dist');
  });

  it('define as quatro variáveis com url() RELATIVO ao próprio pacote, na camada tec-tokens', () => {
    expect(css).toContain('@layer tec-tokens {');
    for (const item of BRAND) {
      expect(css).toContain(`${item.variable}: url('./brand/${item.file}');`);
    }
    // Nada de caminho absoluto nem de origem externa: o Vite só reescreve (e a CSP só aceita) o que for relativo
    const semComentarios = css.replaceAll(/\/\*[\s\S]*?\*\//g, '');
    const urls = [...semComentarios.matchAll(/url\(([^)]*)\)/g)].map((m) => m[1] ?? '');
    expect(urls).toHaveLength(4);
    for (const url of urls) expect(url).toMatch(/^'\.\/brand\/[\w-]+\.svg'$/);
  });

  it('cada SVG existe, é SVG e não traz script nem referência externa', () => {
    for (const item of BRAND) {
      const svg = readFileSync(join(packageDir, 'src', 'brand', item.file), 'utf8');
      expect(svg).toMatch(/<svg[\s>]/);
      expect(svg).not.toMatch(
        /<script|on\w+\s*=|javascript:|<foreignObject|(?:href|src)\s*=\s*["']https?:/i,
      );
    }
  });

  it('os SVG não foram alterados (SHA-256 gravado)', () => {
    for (const item of BRAND) {
      expect(sha256(join(packageDir, 'src', 'brand', item.file))).toBe(item.sha256);
    }
  });

  it.skipIf(!existsSync(OFFICIAL_DIR))(
    'os SVG são idênticos aos da pasta oficial da marca (quando ela existe na máquina)',
    () => {
      for (const item of BRAND) {
        expect(sha256(join(packageDir, 'src', 'brand', item.file))).toBe(
          sha256(join(OFFICIAL_DIR, item.file)),
        );
      }
    },
  );
});
