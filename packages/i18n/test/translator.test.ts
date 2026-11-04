import { describe, expect, it, vi } from 'vitest';
import { createTranslator } from '../src/index.js';

const messages = {
  'user.signedIn': 'Conectado como {name}',
  'items.total': '{total, plural, =0 {Nenhum item} one {# item} other {# itens}}',
  'broken.icu': 'Olá {name',
  'common.save': 'Salvar',
} as const;

describe('createTranslator', () => {
  it('interpola valores e aplica plural no idioma', () => {
    const tr = createTranslator({ locale: 'pt-BR', messages });
    expect(tr.t('user.signedIn', { name: 'Ana' })).toBe('Conectado como Ana');
    expect(tr.t('items.total', { total: 0 })).toBe('Nenhum item');
    expect(tr.t('items.total', { total: 1 })).toBe('1 item');
    expect(tr.t('items.total', { total: 1500 })).toBe('1.500 itens');
  });

  it('não interpreta marcação nos valores', () => {
    const tr = createTranslator({ locale: 'pt-BR', messages });
    expect(tr.t('user.signedIn', { name: '<img src=x onerror=alert(1)>' })).toBe(
      'Conectado como <img src=x onerror=alert(1)>',
    );
  });

  it('chave ausente devolve a chave e avisa uma única vez, sem valores', () => {
    const onMissing = vi.fn();
    const tr = createTranslator<Record<string, string>>({ locale: 'pt-BR', messages, onMissing });
    expect(tr.t('nao.existe', { secret: 'x' })).toBe('nao.existe');
    tr.t('nao.existe');
    expect(onMissing).toHaveBeenCalledTimes(1);
    expect(onMissing).toHaveBeenCalledWith('nao.existe');
  });

  it('mensagem ICU inválida e placeholder sem valor nunca lançam', () => {
    const onMissing = vi.fn();
    const tr = createTranslator({ locale: 'pt-BR', messages, onMissing });
    expect(tr.t('broken.icu')).toBe('broken.icu');
    expect(tr.t('user.signedIn')).toBe('user.signedIn');
    expect(onMissing).toHaveBeenCalledTimes(2);
  });

  it('usa o catálogo padrão quando o idioma não tem a chave', () => {
    const tr = createTranslator<Record<string, string>>({
      locale: 'en',
      messages: { 'common.save': 'Save' },
      fallbackMessages: messages,
    });
    expect(tr.t('common.save')).toBe('Save');
    expect(tr.t('user.signedIn', { name: 'Ana' })).toBe('Conectado como Ana');
    expect(tr.has('items.total')).toBe(true);
    expect(tr.has('nope')).toBe(false);
  });

  it('chave herdada do protótipo não é mensagem', () => {
    const tr = createTranslator({ locale: 'pt-BR', messages });
    expect(tr.has('constructor')).toBe(false);
    expect(tr.has('__proto__')).toBe(false);
  });

  it('expõe o idioma', () => {
    expect(createTranslator({ locale: 'en', messages }).locale).toBe('en');
  });
});
