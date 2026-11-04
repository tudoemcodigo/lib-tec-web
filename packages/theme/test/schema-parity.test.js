import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import { parseThemesDocument } from '../src/manifest.js';
import { TOKEN_NAMES } from '../src/palette.js';

const read = (...parts) => JSON.parse(readFileSync(join(import.meta.dirname, ...parts), 'utf8'));
const schema = read('..', 'schema', 'themes.schema.json');
const cases = read('cases', 'themes-cases.json');
const validate = new Ajv2020({ strict: true }).compile(schema);

/**
 * SHA-256 (fim de linha LF) de `test/cases/themes-cases.json`. O TEC.Bff tem uma CÓPIA deste arquivo e o mesmo valor no seu
 * teste: mudou o arquivo? Atualize a cópia em lib-tec-bff e as duas constantes juntas, senão o C# deixa de provar a paridade.
 */
const CASES_SHA256 = 'd5bcbdc836f4b7e03a3c71809d4ce578aa9fee1929b9f672cdd3e66a85f00b24';

describe('arquivo de casos compartilhado com o TEC.Bff', () => {
  it('não mudou sem atualizar a cópia do BFF', () => {
    const text = readFileSync(
      join(import.meta.dirname, 'cases', 'themes-cases.json'),
      'utf8',
    ).replaceAll('\r\n', '\n');
    expect(createHash('sha256').update(text).digest('hex')).toBe(CASES_SHA256);
  });
});

// FRT-TEM-07: o JSON Schema (fonte da verdade) e o validador escrito à mão precisam concordar.
describe('JSON Schema × validador TypeScript', () => {
  it('o schema lista exatamente os tokens permitidos', () => {
    const listed = Object.keys(schema.$defs.theme.properties.tokens.properties);
    expect(listed).toEqual([...TOKEN_NAMES]);
  });

  it.each(cases.validDocuments)('os dois aceitam: $name', ({ document }) => {
    expect(validate(document)).toBe(true);
    expect(parseThemesDocument(document).ok).toBe(true);
  });

  it.each(cases.invalidDocuments.filter((c) => c.structural))(
    'os dois recusam: $name',
    ({ document }) => {
      expect(validate(document)).toBe(false);
      expect(parseThemesDocument(document).ok).toBe(false);
    },
  );

  it.each(cases.invalidDocuments.filter((c) => !c.structural))(
    'regra semântica (só o validador recusa): $name',
    ({ document }) => {
      expect(validate(document)).toBe(true);
      expect(parseThemesDocument(document).ok).toBe(false);
    },
  );
});
