// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CancelAnchor, UiProvider, uiMessages } from '../src/index.js';

afterEach(cleanup);

describe('CancelAnchor', () => {
  it('é um link com aparência de botão secundário e o texto em pt-BR por padrão', () => {
    render(<CancelAnchor href="/clientes" />);
    const link = screen.getByRole('link', { name: 'Cancelar' });
    expect(link.getAttribute('href')).toBe('/clientes');
    expect(link.className).toBe('ui-button');
    expect(link.getAttribute('data-variant')).toBe('secondary');
    expect(link.querySelector('.ui-button-icon svg')).not.toBeNull();
  });

  it('segue o idioma e a sobrescrita do UiProvider', () => {
    const { rerender } = render(
      <UiProvider locale="en">
        <CancelAnchor href="/x" />
      </UiProvider>,
    );
    expect(screen.getByRole('link', { name: 'Cancel' })).toBeTruthy();
    rerender(
      <UiProvider messages={{ 'ui.cancel': 'Voltar sem salvar' }}>
        <CancelAnchor href="/x" />
      </UiProvider>,
    );
    expect(screen.getByRole('link', { name: 'Voltar sem salvar' })).toBeTruthy();
  });

  it('repassa os atributos recebidos (o roteador injeta href, onClick e ref)', () => {
    render(<CancelAnchor href="/x" data-teste="1" aria-describedby="ajuda" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('data-teste')).toBe('1');
    expect(link.getAttribute('aria-describedby')).toBe('ajuda');
  });
});

describe('textos do pacote', () => {
  it('toda chave de pt-BR existe em en, e vice-versa (inclui ui.cancel)', () => {
    expect(Object.keys(uiMessages.en).sort()).toEqual(Object.keys(uiMessages['pt-BR']).sort());
    expect(uiMessages['pt-BR']['ui.cancel']).toBe('Cancelar');
  });
});
