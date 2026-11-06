// @vitest-environment jsdom
import { lazy, type JSX } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LazyRowActions } from '../src/index.js';

afterEach(cleanup);

describe('LazyRowActions', () => {
  it('até o clique, mostra só o botão de ações e não pede o menu', () => {
    const renderMenu = vi.fn(() => <p>menu</p>);
    render(<LazyRowActions label="Ações de Maria" render={renderMenu} />);
    const botao = screen.getByRole('button', { name: 'Ações de Maria' });
    expect(botao.getAttribute('aria-haspopup')).toBe('menu');
    expect(botao.getAttribute('aria-expanded')).toBe('false');
    expect(renderMenu).not.toHaveBeenCalled();
  });

  it('o clique pede o menu já para abrir', async () => {
    const renderMenu = vi.fn((abrir: boolean) => <p>menu aberto={String(abrir)}</p>);
    render(<LazyRowActions label="Ações" render={renderMenu} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }));
    expect(screen.getByText('menu aberto=true')).toBeTruthy();
    expect(renderMenu).toHaveBeenCalledWith(true);
  });

  it('enquanto o código do menu não chega, o botão continua no lugar (sem salto de layout)', async () => {
    let liberar: (() => void) | undefined;
    const Menu = lazy(
      () =>
        new Promise<{ default: () => JSX.Element }>((resolve) => {
          liberar = () => {
            resolve({ default: () => <p>menu carregado</p> });
          };
        }),
    );
    render(<LazyRowActions label="Ações" render={() => <Menu />} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }));
    expect(screen.getByRole('button', { name: 'Ações' })).toBeTruthy();
    expect(screen.queryByText('menu carregado')).toBeNull();
    liberar?.();
    await waitFor(() => {
      expect(screen.getByText('menu carregado')).toBeTruthy();
    });
  });
});
