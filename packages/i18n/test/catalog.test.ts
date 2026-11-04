import { describe, expect, it } from 'vitest';
import { mergeCatalogs, missingKeys } from '../src/index.js';

describe('mergeCatalogs', () => {
  it('une catálogos de donos diferentes por idioma', () => {
    const merged = mergeCatalogs(
      { 'pt-BR': { 'ui.close': 'Fechar' }, en: { 'ui.close': 'Close' } },
      { 'pt-BR': { 'app.title': 'Clientes' } },
    );
    expect(merged).toEqual({
      'pt-BR': { 'ui.close': 'Fechar', 'app.title': 'Clientes' },
      en: { 'ui.close': 'Close' },
    });
  });

  it('mesma chave com o mesmo texto não é conflito', () => {
    expect(() => mergeCatalogs({ 'pt-BR': { a: 'x' } }, { 'pt-BR': { a: 'x' } })).not.toThrow();
  });

  it('mesma chave com texto diferente lança, nomeando chave e idioma', () => {
    expect(() => mergeCatalogs({ 'pt-BR': { a: 'um' } }, { 'pt-BR': { a: 'dois' } })).toThrow(
      /"a".*"pt-BR"/,
    );
  });

  it('a mensagem de conflito não vaza o texto', () => {
    let message = '';
    try {
      mergeCatalogs({ 'pt-BR': { a: 'segredo-1' } }, { 'pt-BR': { a: 'segredo-2' } });
    } catch (error) {
      message = String(error);
    }
    expect(message).not.toBe('');
    expect(message).not.toMatch(/segredo/);
  });

  it('a mesma chave em idiomas diferentes não conflita', () => {
    expect(() => mergeCatalogs({ 'pt-BR': { a: 'x' } }, { en: { a: 'y' } })).not.toThrow();
  });

  it('chave __proto__ vinda de JSON não polui o protótipo', () => {
    const hostile = JSON.parse('{"pt-BR":{"__proto__":"x"}}') as Record<
      string,
      Record<string, string>
    >;
    const merged = mergeCatalogs(hostile);
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
    expect(({} as { x?: unknown }).x).toBeUndefined();
  });
});

describe('missingKeys', () => {
  it('lista o que o idioma padrão tem e o outro não', () => {
    expect(missingKeys({ a: '1', b: '2', c: '3' }, { b: 'x' })).toEqual(['a', 'c']);
    expect(missingKeys({ a: '1' }, { a: 'x' })).toEqual([]);
  });
});
