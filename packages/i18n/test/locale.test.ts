import { describe, expect, it } from 'vitest';
import { resolveLocale } from '../src/index.js';

const supported = ['pt-BR', 'en'];

describe('resolveLocale', () => {
  it('casa exato sem diferenciar maiúsculas', () => {
    expect(resolveLocale(['PT-br'], supported, 'pt-BR')).toBe('pt-BR');
  });

  it('casa pelo idioma base na ordem de preferência', () => {
    expect(resolveLocale(['fr', 'en-GB'], supported, 'pt-BR')).toBe('en');
    expect(resolveLocale(['pt-PT'], supported, 'pt-BR')).toBe('pt-BR');
  });

  it('cai no padrão quando nada casa ou a lista é vazia', () => {
    expect(resolveLocale(['de', 'ja'], supported, 'pt-BR')).toBe('pt-BR');
    expect(resolveLocale([], supported, 'pt-BR')).toBe('pt-BR');
  });

  it('entrada hostil nunca lança e é ignorada', () => {
    const hostile = ['', 'x'.repeat(10_000), 42 as unknown as string, '../../etc'];
    expect(resolveLocale(hostile, supported, 'pt-BR')).toBe('pt-BR');
  });

  it('só olha as primeiras preferências', () => {
    const many = [...Array.from({ length: 20 }, () => 'de'), 'en'];
    expect(resolveLocale(many, supported, 'pt-BR')).toBe('pt-BR');
  });
});
