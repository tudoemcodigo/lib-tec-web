// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BUSY_DELAY_MS,
  BUSY_MIN_VISIBLE_MS,
  BrandMark,
  BusyOverlay,
  UiProvider,
} from '../src/index.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const avancar = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const css = readFileSync(join(import.meta.dirname, '..', 'src', 'ui.css'), 'utf8');

describe('BusyOverlay: bloqueio total com a marca', () => {
  it('resposta mais rápida que o atraso nunca mostra o bloqueio', () => {
    const { rerender } = render(<BusyOverlay active />);
    avancar(BUSY_DELAY_MS - 1);
    expect(document.querySelector('dialog')).toBeNull();
    rerender(<BusyOverlay active={false} />);
    avancar(5000);
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('passado o atraso, aparece como janela modal nomeada, com a marca e o texto anunciado', () => {
    render(<BusyOverlay active />);
    avancar(BUSY_DELAY_MS);
    const janela = document.querySelector('dialog');
    expect(janela).not.toBeNull();
    expect(janela?.hasAttribute('open')).toBe(true);
    expect(janela?.getAttribute('aria-busy')).toBe('true');
    expect(janela?.querySelector('svg.ui-brand-mark[data-animated]')).not.toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Processando…');
    expect(janela?.getAttribute('aria-labelledby')).toBe(screen.getByRole('status').id);
  });

  it('depois de aparecer, fica ao menos o tempo mínimo mesmo que o trabalho termine na hora', () => {
    const { rerender } = render(<BusyOverlay active />);
    avancar(BUSY_DELAY_MS);
    rerender(<BusyOverlay active={false} />);
    avancar(BUSY_MIN_VISIBLE_MS - 10);
    expect(document.querySelector('dialog')).not.toBeNull();
    avancar(20);
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('terminar e recomeçar antes do fim do mínimo não derruba nem recria o bloqueio', () => {
    const { rerender } = render(<BusyOverlay active />);
    avancar(BUSY_DELAY_MS);
    const janela = document.querySelector('dialog');
    rerender(<BusyOverlay active={false} />);
    avancar(100);
    rerender(<BusyOverlay active />);
    avancar(BUSY_MIN_VISIBLE_MS * 3);
    expect(document.querySelector('dialog')).toBe(janela);
  });

  it('Esc não fecha o bloqueio (o evento cancel é barrado)', () => {
    render(<BusyOverlay active />);
    avancar(BUSY_DELAY_MS);
    const janela = document.querySelector('dialog');
    const evento = new Event('cancel', { cancelable: true });
    act(() => {
      janela?.dispatchEvent(evento);
    });
    expect(evento.defaultPrevented).toBe(true);
    expect(document.querySelector('dialog')).not.toBeNull();
  });

  it('ao terminar, o foco volta ao elemento que o tinha antes', () => {
    render(
      <>
        <button type="button">Salvar</button>
        <Alternador />
      </>,
    );
    const botao = screen.getByRole('button', { name: 'Salvar' });
    botao.focus();
    fireEvent.click(screen.getByRole('button', { name: 'ligar' }));
    avancar(BUSY_DELAY_MS);
    expect(document.querySelector('dialog')).not.toBeNull();
    botao.blur();
    fireEvent.click(screen.getByRole('button', { name: 'desligar' }));
    avancar(BUSY_MIN_VISIBLE_MS + 10);
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(botao);
  });

  it('rótulo próprio e rótulo hostil são texto; idioma vem do UiProvider', () => {
    const { unmount } = render(<BusyOverlay active label={'<img src=x onerror=alert(1)>'} />);
    avancar(BUSY_DELAY_MS);
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('<img src=x onerror=alert(1)>');
    unmount();
    render(
      <UiProvider locale="en">
        <BusyOverlay active />
      </UiProvider>,
    );
    avancar(BUSY_DELAY_MS);
    expect(screen.getByRole('status').textContent).toBe('Working…');
  });

  it('atrasos próprios valem, e desmontar cancela o que estava marcado', () => {
    const { unmount } = render(<BusyOverlay active delayMs={1000} minVisibleMs={0} />);
    avancar(999);
    expect(document.querySelector('dialog')).toBeNull();
    unmount();
    avancar(5000);
    expect(document.querySelector('dialog')).toBeNull();
  });
});

function Alternador() {
  const [ativo, setAtivo] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAtivo(true);
        }}
      >
        ligar
      </button>
      <button
        type="button"
        onClick={() => {
          setAtivo(false);
        }}
      >
        desligar
      </button>
      <BusyOverlay active={ativo} />
    </>
  );
}

describe('BrandMark e CSS do bloqueio', () => {
  it('a marca é decorativa e a animação é opcional; cada instância tem gradiente próprio', () => {
    const { container } = render(
      <>
        <BrandMark />
        <BrandMark animated={false} />
      </>,
    );
    const marcas = container.querySelectorAll('svg');
    expect(marcas[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(marcas[0]?.hasAttribute('data-animated')).toBe(true);
    expect(marcas[1]?.hasAttribute('data-animated')).toBe(false);
    const ids = [...container.querySelectorAll('linearGradient')].map((g) => g.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('o bloqueio cobre a tela, escurece o fundo e só anima na marca (parada com movimento reduzido pelo CSS base)', () => {
    expect(css).toMatch(/\.ui-busy::backdrop/);
    expect(css).toMatch(/\.ui-busy\[open\]\s*\{[^}]*display:\s*grid/);
    expect(css).toMatch(/\.ui-brand-mark\[data-animated\] \.ui-brand-arc/);
  });
});
