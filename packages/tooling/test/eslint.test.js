import { join } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { tecEslintConfig } from '../src/eslint.js';

const fixtures = join(import.meta.dirname, 'fixtures');
const TIMEOUT = 120_000;

/** Roda o ESLint tipado de verdade sobre uma fixture e devolve as mensagens. */
async function lint(file, options = {}) {
  const eslint = new ESLint({
    cwd: fixtures,
    overrideConfigFile: true,
    overrideConfig: tecEslintConfig({ tsconfigRootDir: fixtures, ...options }),
  });
  const [result] = await eslint.lintFiles([file]);
  return result?.messages ?? [];
}

const has = (messages, ruleId, text) =>
  messages.some((m) => m.ruleId === ruleId && (text === undefined || m.message.includes(text)));

describe('tecEslintConfig: código hostil é barrado', () => {
  it(
    'sinks de XSS, eval, storage, texto solto e data sem locale',
    async () => {
      const messages = await lint('bad-xss.tsx');
      expect(has(messages, 'no-restricted-syntax', 'innerHTML')).toBe(true);
      expect(has(messages, 'no-restricted-syntax', 'document.write')).toBe(true);
      expect(has(messages, 'no-restricted-syntax', 'insertAdjacentHTML')).toBe(true);
      expect(has(messages, 'no-restricted-syntax', 'HTML cru')).toBe(true);
      expect(has(messages, 'no-restricted-syntax', 'FRT-SEG-01')).toBe(true);
      expect(has(messages, 'no-restricted-syntax', 'FRT-ACE-08')).toBe(true);
      expect(has(messages, 'no-restricted-syntax', 'FRT-ACE-09')).toBe(true);
      expect(has(messages, 'no-eval')).toBe(true);
      expect(has(messages, 'no-new-func')).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'escrita em storage também por window.localStorage e globalThis.sessionStorage',
    async () => {
      const messages = await lint('bad-storage.ts');
      const hits = messages.filter(
        (m) => m.ruleId === 'no-restricted-syntax' && m.message.includes('FRT-SEG-01'),
      );
      expect(hits).toHaveLength(2);
    },
    TIMEOUT,
  );

  it(
    'fetch, XMLHttpRequest, axios e zod fora dos módulos únicos',
    async () => {
      const messages = await lint('bad-http.ts');
      expect(has(messages, 'no-restricted-globals', 'fetch')).toBe(true);
      expect(has(messages, 'no-restricted-globals', 'XMLHttpRequest')).toBe(true);
      expect(has(messages, 'no-restricted-imports', 'FRT-API-02')).toBe(true);
      expect(has(messages, 'no-restricted-imports', 'FRT-SEG-04')).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'any, @ts-ignore sem motivo e import de tipo como valor',
    async () => {
      const messages = await lint('bad-types.ts');
      expect(has(messages, '@typescript-eslint/no-explicit-any')).toBe(true);
      expect(has(messages, '@typescript-eslint/ban-ts-comment')).toBe(true);
      expect(has(messages, '@typescript-eslint/consistent-type-imports')).toBe(true);
    },
    TIMEOUT,
  );
});

describe('tecEslintConfig: exceções são explícitas e restritas', () => {
  it(
    'o módulo de HTTP autorizado deixa de ser barrado, mas axios e zod continuam',
    async () => {
      const messages = await lint('bad-http.ts', { httpFiles: ['bad-http.ts'] });
      expect(has(messages, 'no-restricted-globals')).toBe(false);
      expect(has(messages, 'no-restricted-imports', 'FRT-API-02')).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'o wrapper de zod autorizado deixa de ser barrado nos imports',
    async () => {
      const messages = await lint('bad-http.ts', { zodFiles: ['bad-http.ts'] });
      expect(has(messages, 'no-restricted-imports')).toBe(false);
      expect(has(messages, 'no-restricted-globals', 'fetch')).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'arquivo de teste não recebe as restrições de sintaxe',
    async () => {
      const messages = await lint('bad-xss.tsx', { testFiles: ['bad-xss.tsx'] });
      expect(has(messages, 'no-restricted-syntax')).toBe(false);
      expect(has(messages, 'no-eval')).toBe(true);
    },
    TIMEOUT,
  );

  it(
    'código conforme passa sem nenhuma mensagem',
    async () => {
      const messages = await lint('good.tsx');
      expect(messages.map((m) => `${String(m.ruleId)}: ${m.message}`)).toEqual([]);
    },
    TIMEOUT,
  );

  it(
    'globais do Node só valem nos arquivos declarados em nodeFiles',
    async () => {
      expect(has(await lint('uses-node.mjs'), 'no-undef', 'process')).toBe(true);
      expect(has(await lint('uses-node.mjs', { nodeFiles: ['*.mjs'] }), 'no-undef')).toBe(false);
    },
    TIMEOUT,
  );

  it('recusa configuração sem tsconfigRootDir', () => {
    expect(() => tecEslintConfig({})).toThrow(/tsconfigRootDir/);
    expect(() => tecEslintConfig({ tsconfigRootDir: '' })).toThrow(/tsconfigRootDir/);
  });
});
