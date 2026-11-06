import { describe, expect, it } from 'vitest';
import { checkPackage } from './check-package.js';

const valid = () => ({
  name: '@tudoemcodigo/demo',
  version: '0.0.1',
  license: 'Apache-2.0',
  repository: { type: 'git', url: 'git+https://example.com/x.git', directory: 'packages/demo' },
  publishConfig: { registry: 'https://npm.pkg.github.com' },
  exports: {
    '.': { types: './dist/index.d.ts', default: './dist/index.js' },
    './styles.css': './dist/styles.css',
    './brand/logo.svg': './dist/brand/logo.svg',
    './package.json': './package.json',
  },
  files: ['dist'],
  sideEffects: ['**/*.css'],
  peerDependencies: { react: '^19.0.0' },
});

const expectProblem = (mutate, text) => {
  const pkg = valid();
  mutate(pkg);
  expect(checkPackage(pkg, 'demo').join('\n')).toContain(text);
};

describe('checkPackage', () => {
  it('aceita um pacote conforme', () => {
    expect(checkPackage(valid(), 'demo')).toEqual([]);
    expect(checkPackage({ ...valid(), sideEffects: false }, 'demo')).toEqual([]);
  });

  it('recusa package.json que não é objeto', () => {
    expect(checkPackage(null, 'demo')).toEqual(['package.json não é um objeto']);
    expect(checkPackage([], 'demo')).toEqual(['package.json não é um objeto']);
    expect(checkPackage('x', 'demo')).toEqual(['package.json não é um objeto']);
  });

  it('identidade: escopo, nome igual à pasta, versão, licença, repositório e registro', () => {
    expectProblem((p) => (p.name = 'demo'), 'name deve ser');
    expectProblem((p) => (p.name = '@outro/demo'), 'name deve ser');
    expectProblem((p) => (p.name = '@tudoemcodigo/outra'), 'name deve ser');
    expectProblem((p) => delete p.name, 'name deve ser');
    expectProblem((p) => (p.version = 'latest'), 'SemVer');
    expectProblem((p) => delete p.version, 'SemVer');
    expectProblem((p) => (p.license = 'MIT'), 'Apache-2.0');
    expectProblem((p) => (p.repository.directory = 'packages/outra'), 'repository.directory');
    expectProblem((p) => delete p.repository, 'repository.directory');
    expectProblem(
      (p) => (p.publishConfig.registry = 'https://registry.npmjs.org'),
      'publishConfig.registry',
    );
    expectProblem((p) => (p.private = true), 'private');
  });

  it('files: lista permitida, nunca ampla', () => {
    expectProblem((p) => delete p.files, 'files deve ser');
    expectProblem((p) => (p.files = []), 'files deve ser');
    expectProblem((p) => (p.files = ['*']), 'ampla');
    expectProblem((p) => (p.files = ['.']), 'ampla');
    expectProblem((p) => (p.files = ['../segredo']), 'ampla');
    expectProblem((p) => (p.files = [42]), 'ampla');
  });

  it('exports: subcaminhos, com types nos módulos de código', () => {
    expectProblem((p) => delete p.exports, 'exports deve ser');
    expectProblem((p) => (p.exports = './index.js'), 'exports deve ser');
    expectProblem((p) => (p.exports = []), 'exports deve ser');
    expectProblem((p) => (p.exports = { index: './index.js' }), 'subcaminho');
    expectProblem((p) => (p.exports['.'] = './dist/index.js'), 'condição "types"');
    expectProblem((p) => (p.exports['.'] = { default: './dist/index.js' }), 'condição "types"');
    expectProblem((p) => (p.exports['.'] = null), 'condição "types"');
  });

  it('sideEffects: false ou só CSS', () => {
    expectProblem((p) => delete p.sideEffects, 'sideEffects');
    expectProblem((p) => (p.sideEffects = true), 'sideEffects');
    expectProblem((p) => (p.sideEffects = ['**/*.js']), 'sideEffects');
    expectProblem((p) => (p.sideEffects = [1]), 'sideEffects');
  });

  it('sem script de instalação e com React só como peer', () => {
    expectProblem((p) => (p.scripts = { postinstall: 'node x.js' }), 'postinstall');
    expectProblem((p) => (p.scripts = { preinstall: 'node x.js' }), 'preinstall');
    expectProblem((p) => (p.scripts = { install: 'node x.js' }), 'install');
    expectProblem((p) => (p.dependencies = { react: '^19.0.0' }), 'react deve ser peerDependency');
    expectProblem(
      (p) => (p.dependencies = { '@base-ui/react': '^1.0.0' }),
      '@base-ui/react deve ser peerDependency',
    );
    expect(checkPackage({ ...valid(), scripts: { test: 'vitest' } }, 'demo')).toEqual([]);
  });
});
