import { describe, expect, it } from 'vitest';
import { createFormatters } from '../src/index.js';

const spaces = (text: string): string => text.replaceAll(/\s/g, ' ');

describe('createFormatters', () => {
  const f = createFormatters('pt-BR');

  it('número e moeda no idioma pedido, com moeda explícita', () => {
    expect(f.formatNumber(1234567)).toBe('1.234.567');
    expect(spaces(f.formatCurrency(1234.5, 'BRL'))).toBe('R$ 1.234,50');
    expect(spaces(f.formatCurrency(1234.5, 'BRL'))).toBe('R$ 1.234,50');
    expect(spaces(createFormatters('en').formatCurrency(1234.5, 'USD'))).toBe('$1,234.50');
  });

  it('data sem hora não recua um dia por causa do fuso', () => {
    expect(f.formatDate('2000-01-01')).toBe('01/01/2000');
  });

  it('data inválida, de calendário impossível ou fora do formato vira vazio', () => {
    expect(f.formatDate('01/01/2000')).toBe('');
    expect(f.formatDate('2000-13-45')).toBe('');
    expect(f.formatDate('2026-02-30')).toBe('');
    expect(f.formatDateTime('ontem')).toBe('');
  });

  it('instante com fuso vira data e hora', () => {
    expect(f.formatDateTime('2026-11-03T15:30:00Z')).toMatch(
      /^\d{2}\/\d{2}\/\d{2,4},? \d{2}:\d{2}$/,
    );
  });

  it('expõe o locale', () => {
    expect(f.locale).toBe('pt-BR');
  });
});
