// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatSort,
  nextSort,
  nextSortValue,
  parseSort,
  SortableColumn,
  SortableHeader,
  type SortDirection,
  type SortState,
} from '../src/index.js';

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

const FIELDS = ['nome', 'valorTotal'] as const;

describe('parseSort e formatSort: ordenação na URL', () => {
  it('é uma ida e volta sem perda', () => {
    for (const value of ['nome', '-nome', 'valorTotal', '-valorTotal']) {
      expect(formatSort(parseSort(value, FIELDS))).toBe(value);
    }
  });

  it('lê o sentido pelo sinal', () => {
    expect(parseSort('nome', FIELDS)).toEqual({ field: 'nome', direction: 'asc' });
    expect(parseSort('-nome', FIELDS)).toEqual({ field: 'nome', direction: 'desc' });
  });

  it('vazio é a ordem padrão e escrevê-la dá texto vazio', () => {
    expect(parseSort('', FIELDS)).toBeUndefined();
    expect(formatSort(undefined)).toBe('');
  });

  it.each([
    ['campo fora da lista', 'documento'],
    ['maiúscula errada', 'Nome'],
    ['sinal duplo', '--nome'],
    ['só o sinal', '-'],
    ['injeção', 'nome;DROP TABLE Clientes--'],
    ['protótipo', '__proto__'],
    ['propriedade herdada', 'constructor'],
    ['quebra de linha', 'nome\n'],
    ['texto enorme', 'a'.repeat(5000)],
    ['número', 42],
    ['objeto', { nome: true }],
    ['nulo', null],
  ])('recusa %s e volta à ordem padrão', (_motivo, value) => {
    expect(parseSort(value, FIELDS)).toBeUndefined();
  });
});

describe('nextSortValue: ciclo do clique', () => {
  it('padrão, crescente, decrescente e de volta ao padrão', () => {
    const passo1 = nextSortValue('', FIELDS, 'nome');
    expect(passo1).toBe('nome');
    const passo2 = nextSortValue(passo1, FIELDS, 'nome');
    expect(passo2).toBe('-nome');
    expect(nextSortValue(passo2, FIELDS, 'nome')).toBe('');
  });

  it('outra coluna começa crescente nela; valor hostil conta como ordem padrão', () => {
    expect(nextSortValue('-nome', FIELDS, 'valorTotal')).toBe('valorTotal');
    expect(nextSortValue('__proto__', FIELDS, 'nome')).toBe('nome');
  });
});

describe('SortableColumn', () => {
  function Colunas({
    sort,
    onSort,
  }: {
    readonly sort: SortState | undefined;
    readonly onSort: (field: string) => void;
  }) {
    return (
      <table>
        <thead>
          <tr>
            <SortableColumn field="nome" sort={sort} onSort={onSort} className="ui-numeric">
              Nome
            </SortableColumn>
            <SortableColumn field="email" sort={sort} onSort={onSort}>
              E-mail
            </SortableColumn>
          </tr>
        </thead>
      </table>
    );
  }

  it('só a coluna ordenada leva aria-sort e o clique avisa o campo', async () => {
    const onSort = vi.fn();
    render(<Colunas sort={{ field: 'nome', direction: 'desc' }} onSort={onSort} />);
    const nome = screen.getByRole('columnheader', { name: /Nome/ });
    expect(nome.getAttribute('aria-sort')).toBe('descending');
    expect(nome.className).toBe('ui-numeric');
    expect(screen.getByRole('columnheader', { name: /E-mail/ }).hasAttribute('aria-sort')).toBe(
      false,
    );
    await userEvent.click(screen.getByRole('button', { name: /E-mail/ }));
    expect(onSort).toHaveBeenCalledExactlyOnceWith('email');
  });

  it('sem ordenação ativa nenhuma coluna leva aria-sort', () => {
    render(<Colunas sort={undefined} onSort={() => undefined} />);
    expect(document.querySelectorAll('[aria-sort]')).toHaveLength(0);
  });
});
