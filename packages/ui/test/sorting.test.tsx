// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextSort, SortableHeader, type SortDirection, type SortState } from '../src/index.js';

afterEach(cleanup);

function Tabela({
  direction,
  onSort = () => undefined,
  label = 'Nome',
}: {
  readonly direction?: SortDirection | undefined;
  readonly onSort?: () => void;
  readonly label?: string;
}) {
  return (
    <table>
      <thead>
        <tr>
          <SortableHeader direction={direction} onSort={onSort}>
            {label}
          </SortableHeader>
          <th scope="col">Outra</th>
        </tr>
      </thead>
    </table>
  );
}

describe('nextSort: ciclo do cabeçalho', () => {
  it('sem ordenação ou outro campo começa crescente', () => {
    expect(nextSort(undefined, 'nome')).toEqual({ field: 'nome', direction: 'asc' });
    const outra: SortState = { field: 'data', direction: 'desc' };
    expect(nextSort(outra, 'nome')).toEqual({ field: 'nome', direction: 'asc' });
  });

  it('crescente vira decrescente e decrescente volta ao padrão da lista', () => {
    expect(nextSort({ field: 'nome', direction: 'asc' }, 'nome')).toEqual({
      field: 'nome',
      direction: 'desc',
    });
    expect(nextSort({ field: 'nome', direction: 'desc' }, 'nome')).toBeUndefined();
  });
});

describe('SortableHeader', () => {
  it('é um cabeçalho de coluna com botão nomeado pelo rótulo e sem aria-sort quando inativo', () => {
    render(<Tabela />);
    const cabecalho = screen.getByRole('columnheader', { name: 'Nome' });
    expect(cabecalho.getAttribute('scope')).toBe('col');
    expect(cabecalho.hasAttribute('aria-sort')).toBe(false);
    expect(screen.getByRole('button', { name: 'Nome' })).toBeTruthy();
  });

  it.each([
    ['asc', 'ascending'],
    ['desc', 'descending'],
  ] as const)('coluna ordenada %s expõe aria-sort=%s', (direction, aria) => {
    render(<Tabela direction={direction} />);
    expect(screen.getByRole('columnheader', { name: 'Nome' }).getAttribute('aria-sort')).toBe(aria);
    // A outra coluna não leva aria-sort (só uma por tabela)
    expect(screen.getByRole('columnheader', { name: 'Outra' }).hasAttribute('aria-sort')).toBe(
      false,
    );
  });

  it('o estado não é só cor: cada estado tem um ícone de forma diferente', () => {
    const formas = ([undefined, 'asc', 'desc'] as const).map((direction) => {
      const { container, unmount } = render(<Tabela direction={direction} />);
      const forma = container.querySelector('.ui-sort-icon path')?.getAttribute('d') ?? '';
      unmount();
      return forma;
    });
    expect(new Set(formas).size).toBe(3);
    expect(formas.every((forma) => forma.length > 0)).toBe(true);
  });

  it('clique, Enter e Espaço avisam uma vez cada', async () => {
    const usuario = userEvent.setup();
    const aoOrdenar = vi.fn();
    render(<Tabela onSort={aoOrdenar} />);
    const botao = screen.getByRole('button', { name: 'Nome' });

    await usuario.click(botao);
    expect(aoOrdenar).toHaveBeenCalledTimes(1);
    botao.focus();
    await usuario.keyboard('{Enter}');
    await usuario.keyboard(' ');
    expect(aoOrdenar).toHaveBeenCalledTimes(3);
  });

  it('rótulo hostil é só texto', () => {
    render(<Tabela label={'<img src=x onerror=alert(1)>'} />);
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByRole('button').textContent).toContain('<img src=x onerror=alert(1)>');
  });
});
