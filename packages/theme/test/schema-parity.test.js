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
