// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActionMenu, FaIcon, IconEye, IconMore, IconTrash } from '../src/index.js';

afterEach(cleanup);

const abrir = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.click(screen.getByRole('button', { name: 'Ações de Maria da Silva' }));
  return screen.findByRole('menu');
};

describe('ActionMenu', () => {
  it('o botão só tem ícone, mas tem nome e dica; abre o menu com os itens', async () => {
    const usuario = userEvent.setup();
    render(
      <ActionMenu
        label="Ações de Maria da Silva"
        items={[
          { label: 'Visualizar', href: '/clientes/1', icon: <IconEye /> },
          { label: 'Excluir', onSelect: () => undefined, icon: <IconTrash />, tone: 'danger' },
        ]}
      />,
    );
    const botao = screen.getByRole('button', { name: 'Ações de Maria da Silva' });
    expect(botao.getAttribute('title')).toBe('Ações de Maria da Silva');
    expect(botao.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('menu')).toBeNull();
    const menu = await abrir(usuario);
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
  });

  it('item de link navega pelo href', async () => {
    const usuario = userEvent.setup();
    render(
      <ActionMenu
        label="Ações de Maria da Silva"
        items={[{ label: 'Visualizar', href: '/clientes/1' }]}
      />,
    );
    await abrir(usuario);
    expect(screen.getByRole('menuitem', { name: 'Visualizar' }).getAttribute('href')).toBe(
      '/clientes/1',
    );
  });

  it('renderLink troca o elemento do link (por exemplo, o do roteador)', async () => {
    const usuario = userEvent.setup();
    render(
      <ActionMenu
        label="Ações de Maria da Silva"
        items={[{ label: 'Visualizar', href: '/clientes/1' }]}
        // eslint-disable-next-line jsx-a11y/anchor-has-content -- o Base UI injeta o conteúdo do item neste elemento
        renderLink={(item) => <a data-router href={`/app${item.href ?? ''}`} />}
      />,
    );
    await abrir(usuario);
    const item = screen.getByRole('menuitem', { name: 'Visualizar' });
    expect(item.hasAttribute('data-router')).toBe(true);
    expect(item.getAttribute('href')).toBe('/app/clientes/1');
  });

  it('item de ação chama onSelect e fecha o menu; desabilitado não chama', async () => {
    const usuario = userEvent.setup();
    const onSelect = vi.fn();
    const bloqueado = vi.fn();
    render(
      <ActionMenu
        label="Ações de Maria da Silva"
        items={[
          { label: 'Inativar', onSelect },
          { label: 'Excluir', onSelect: bloqueado, disabled: true, separatorBefore: true },
        ]}
      />,
    );
    await abrir(usuario);
    expect(screen.getByRole('separator')).toBeTruthy();
    await usuario.click(screen.getByRole('menuitem', { name: 'Excluir' }));
    expect(bloqueado).not.toHaveBeenCalled();
    await usuario.click(screen.getByRole('menuitem', { name: 'Inativar' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('Enter abre, Esc fecha e devolve o foco ao botão', async () => {
    const usuario = userEvent.setup();
    render(
      <ActionMenu
        label="Ações de Maria da Silva"
        items={[{ label: 'Inativar', onSelect: () => undefined }]}
      />,
    );
    const botao = screen.getByRole('button', { name: 'Ações de Maria da Silva' });
    botao.focus();
    await usuario.keyboard('{Enter}');
    await screen.findByRole('menu');
    await usuario.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(document.activeElement).toBe(botao);
  });

  it('defaultOpen abre o menu na primeira renderização', async () => {
    render(
      <ActionMenu
        label="Ações de Maria da Silva"
        defaultOpen
        items={[{ label: 'Inativar', onSelect: () => undefined }]}
      />,
    );
    expect(await screen.findByRole('menuitem', { name: 'Inativar' })).toBeTruthy();
  });

  it('rótulos hostis viram texto', async () => {
    const usuario = userEvent.setup();
    render(
      <ActionMenu
        label="<img src=x onerror=alert(1)>"
        items={[{ label: '<b>Excluir</b>', onSelect: () => undefined }]}
      />,
    );
    await usuario.click(screen.getByRole('button'));
    await screen.findByRole('menu');
    expect(document.querySelector('b')).toBeNull();
    expect(screen.getByRole('menuitem').textContent).toBe('<b>Excluir</b>');
  });
});

describe('FaIcon', () => {
  it('desenha o ícone do Font Awesome como SVG decorativo, no tamanho do texto', () => {
    const { container } = render(<FaIcon icon={faEye} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('viewBox')).toBe(
      `0 0 ${String(faEye.icon[0])} ${String(faEye.icon[1])}`,
    );
    expect(svg?.getAttribute('width')).toBe('1em');
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('aceita ícone com mais de um traçado', () => {
    const duplo = {
      ...faEye,
      icon: [10, 10, [], '', ['M0 0h1v1z', 'M2 2h1v1z']],
    } as unknown as typeof faEye;
    const { container } = render(<FaIcon icon={duplo} />);
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('os ícones nomeados saem do mesmo desenho e ficam decorativos', () => {
    const { container } = render(
      <>
        <IconMore />
        <IconEye />
      </>,
    );
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
  });
});
