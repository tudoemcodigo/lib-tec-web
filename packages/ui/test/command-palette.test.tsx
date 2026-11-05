// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette, filterCommands, UiProvider, type CommandItem } from '../src/index.js';

afterEach(cleanup);

const comandos = (onSelect: (id: string) => void): readonly CommandItem[] => [
  {
    id: 'inicio',
    label: 'Ir para Início',
    group: 'Navegar',
    onSelect: () => {
      onSelect('inicio');
    },
  },
  {
    id: 'clientes',
    label: 'Ir para Clientes',
    group: 'Navegar',
    keywords: ['cadastro'],
    onSelect: () => {
      onSelect('clientes');
    },
  },
  {
    id: 'novo-cliente',
    label: 'Novo cliente',
    group: 'Ações',
    onSelect: () => {
      onSelect('novo-cliente');
    },
  },
];

function Montada({ onSelect }: { readonly onSelect: (id: string) => void }) {
  const [aberta, setAberta] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAberta(true);
        }}
      >
        Abrir comandos
      </button>
      <CommandPalette open={aberta} onOpenChange={setAberta} items={comandos(onSelect)} />
    </>
  );
}

const abrir = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.click(screen.getByRole('button', { name: 'Abrir comandos' }));
  return screen.findByRole('combobox', { name: 'Comando' });
};

describe('filterCommands', () => {
  const itens = comandos(() => undefined);

  it('sem texto devolve tudo; ignora acento, caixa e ordem dos termos', () => {
    expect(filterCommands(itens, '')).toHaveLength(3);
    expect(filterCommands(itens, '   ')).toHaveLength(3);
    expect(filterCommands(itens, 'INICIO').map((i) => i.id)).toEqual(['inicio']);
    expect(filterCommands(itens, 'cliente novo').map((i) => i.id)).toEqual(['novo-cliente']);
  });

  it('acha por palavra-chave e por grupo; sem correspondência devolve vazio', () => {
    expect(filterCommands(itens, 'cadastro').map((i) => i.id)).toEqual(['clientes']);
    expect(filterCommands(itens, 'ações').map((i) => i.id)).toEqual(['novo-cliente']);
    expect(filterCommands(itens, 'zzz')).toEqual([]);
  });

  it('texto hostil só filtra: nada é executado nem interpretado como regex', () => {
    expect(filterCommands(itens, '.*')).toEqual([]);
    expect(filterCommands(itens, '(((')).toEqual([]);
    expect(filterCommands(itens, '<img src=x onerror=alert(1)>')).toEqual([]);
  });
});

describe('CommandPalette', () => {
  it('abre como janela com campo em foco, lista e total anunciado', async () => {
    const usuario = userEvent.setup();
    render(<Montada onSelect={vi.fn()} />);
    const campo = await abrir(usuario);
    expect(screen.getByRole('dialog', { name: 'Paleta de comandos' })).toBeTruthy();
    expect(document.activeElement).toBe(campo);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('status').textContent).toBe('3 comandos');
    expect(campo.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[0]?.id);
  });

  it('digitar filtra, anuncia o novo total e a primeira opção vira a ativa', async () => {
    const usuario = userEvent.setup();
    render(<Montada onSelect={vi.fn()} />);
    const campo = await abrir(usuario);
    await usuario.type(campo, 'cliente');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      expect.stringContaining('Ir para Clientes'),
      expect.stringContaining('Novo cliente'),
    ]);
    expect(screen.getByRole('status').textContent).toBe('2 comandos');
    await usuario.clear(campo);
    await usuario.type(campo, 'novo');
    expect(screen.getByRole('status').textContent).toBe('1 comando');
  });

  it('sem resultado mostra a mensagem, sem opção ativa, e Enter não faz nada', async () => {
    const usuario = userEvent.setup();
    const aoEscolher = vi.fn();
    render(<Montada onSelect={aoEscolher} />);
    const campo = await abrir(usuario);
    await usuario.type(campo, 'zzz{Enter}');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByRole('status').textContent).toBe('Nenhum comando encontrado.');
    expect(campo.hasAttribute('aria-activedescendant')).toBe(false);
    expect(aoEscolher).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('setas, Home e End movem a opção ativa com volta nas pontas; Enter executa e fecha', async () => {
    const usuario = userEvent.setup();
    const aoEscolher = vi.fn();
    render(<Montada onSelect={aoEscolher} />);
    const campo = await abrir(usuario);
    const ativa = () =>
      screen.getAllByRole('option').findIndex((o) => o.getAttribute('aria-selected') === 'true');
    expect(ativa()).toBe(0);
    await usuario.keyboard('{ArrowUp}');
    expect(ativa()).toBe(2);
    await usuario.keyboard('{ArrowDown}');
    expect(ativa()).toBe(0);
    await usuario.keyboard('{End}');
    expect(ativa()).toBe(2);
    await usuario.keyboard('{Home}');
    expect(ativa()).toBe(0);
    await usuario.keyboard('{ArrowDown}');
    expect(campo.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[1]?.id);
    await usuario.keyboard('{Enter}');
    expect(aoEscolher).toHaveBeenCalledExactlyOnceWith('clientes');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('clicar numa opção executa e fecha; passar o mouse só muda a ativa', async () => {
    const usuario = userEvent.setup();
    const aoEscolher = vi.fn();
    render(<Montada onSelect={aoEscolher} />);
    await abrir(usuario);
    const opcoes = screen.getAllByRole('option');
    await usuario.hover(opcoes[2]!);
    expect(opcoes[2]?.getAttribute('aria-selected')).toBe('true');
    expect(aoEscolher).not.toHaveBeenCalled();
    await usuario.click(opcoes[2]!);
    expect(aoEscolher).toHaveBeenCalledExactlyOnceWith('novo-cliente');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('Esc fecha sem executar, devolve o foco ao botão de origem e reabrir começa limpo', async () => {
    const usuario = userEvent.setup();
    const aoEscolher = vi.fn();
    render(<Montada onSelect={aoEscolher} />);
    const gatilho = screen.getByRole('button', { name: 'Abrir comandos' });
    const campo = await abrir(usuario);
    await usuario.type(campo, 'novo');
    await usuario.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(aoEscolher).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(document.activeElement).toBe(gatilho);
    });
    const outra = await abrir(usuario);
    expect((outra as HTMLInputElement).value).toBe('');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('o texto digitado é limitado e nunca vira HTML', async () => {
    const usuario = userEvent.setup();
    render(<Montada onSelect={vi.fn()} />);
    const campo = await abrir(usuario);
    await usuario.type(campo, '<img src=x onerror=alert(1)>');
    expect(document.querySelector('img')).toBeNull();
    expect(campo.getAttribute('maxlength')).toBe('80');
  });

  it('o idioma vem do UiProvider', async () => {
    const usuario = userEvent.setup();
    render(
      <UiProvider locale="en">
        <Montada onSelect={vi.fn()} />
      </UiProvider>,
    );
    await usuario.click(screen.getByRole('button', { name: 'Abrir comandos' }));
    expect(await screen.findByRole('combobox', { name: 'Command' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('3 commands');
  });
});
