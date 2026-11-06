// @vitest-environment jsdom
import { act, cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PREFERENCES_STORAGE_KEY, getPreferences, initPreferences } from '@tudoemcodigo/theme';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BASE_PROPS, renderShell } from './helpers.js';

beforeEach(() => {
  // O jsdom não implementa a rolagem; o roteador a chama a cada troca de rota
  window.scrollTo = vi.fn();
  localStorage.clear();
  initPreferences();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  initPreferences();
});

const main = () => screen.getByRole('main');
const key = (user: ReturnType<typeof userEvent.setup>, keys: string) => user.keyboard(keys);

describe('estrutura da casca', () => {
  it('tem links de salto, cabeçalho, menu, conteúdo e rodapé, com a marca nomeada', async () => {
    renderShell('/clientes', { version: '1.2.3' });
    expect(await screen.findByText('Página Clientes')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' }).getAttribute('href')).toBe(
      '#shell-content',
    );
    expect(screen.getByRole('link', { name: 'Ir para o menu' }).getAttribute('href')).toBe(
      '#shell-menu',
    );
    expect(screen.queryByRole('link', { name: 'Ir para a busca' })).toBeNull();
    expect(screen.getByRole('img', { name: 'Marca Teste' })).toBeTruthy();
    expect(main().id).toBe('shell-content');
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).toContain(`© ${String(new Date().getFullYear())} Marca Teste`);
    expect(footer.textContent).toContain('Versão 1.2.3');
    expect(within(footer).getByRole('link', { name: 'Ajuda' }).getAttribute('href')).toBe('/ajuda');
  });

  it('sem versão o rodapé não mostra versão; sem páginas da casca não há links padrão', async () => {
    renderShell('/', { routes: { help: false, accessibility: false } });
    await screen.findByText('Página Início');
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).not.toContain('Versão');
    expect(within(footer).queryByRole('navigation')).toBeNull();
  });

  it('links extras do rodapé entram depois dos padrão', async () => {
    renderShell('/', { footerLinks: [{ to: '/pedidos', label: 'Termos' }] });
    await screen.findByText('Página Início');
    const links = within(screen.getByRole('navigation', { name: 'Links do rodapé' })).getAllByRole(
      'link',
    );
    expect(links.map((l) => l.textContent)).toEqual(['Ajuda', 'Acessibilidade', 'Termos']);
  });
});

describe('nome do sistema no cabeçalho', () => {
  it('mostra o nome como texto simples (não é h1 nem link), com title para o nome completo', async () => {
    renderShell('/', { systemName: 'Gestão de Pedidos' });
    await screen.findByText('Página Início');
    const name = within(screen.getByRole('banner')).getByText('Gestão de Pedidos');
    expect(name.tagName).toBe('P');
    expect(name.className).toBe('shell-app-name');
    expect(name.getAttribute('title')).toBe('Gestão de Pedidos');
    expect(name.closest('a')).toBeNull();
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
  });

  it('sem a prop, ou vazia, não existe elemento nem espaço reservado', async () => {
    const { unmount } = renderShell('/');
    await screen.findByText('Página Início');
    expect(document.querySelector('.shell-app-name')).toBeNull();
    unmount();
    renderShell('/', { systemName: '' });
    await screen.findByText('Página Início');
    expect(document.querySelector('.shell-app-name')).toBeNull();
  });

  it('texto hostil e nome gigante viram só texto', async () => {
    const hostile = '<img src=x onerror=alert(1)>' + 'x'.repeat(500);
    renderShell('/', { systemName: hostile });
    await screen.findByText('Página Início');
    const name = document.querySelector('.shell-app-name');
    expect(name?.textContent).toBe(hostile);
    expect(name?.getAttribute('title')).toBe(hostile);
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });

  it('não muda o título da aba (document.title continua Página · Marca)', async () => {
    renderShell('/clientes', { systemName: 'Sistema X', pageTitle: () => 'Clientes' });
    await waitFor(() => {
      expect(document.title).toBe('Clientes · Marca Teste');
    });
  });
});

describe('menu lateral', () => {
  it('mostra só o que a pessoa pode ver e marca a rota exata do início', async () => {
    renderShell('/clientes', { user: { name: 'Leitor', permissions: new Set(['clientes.ler']) } });
    await screen.findByText('Página Clientes');
    const menu = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(menu).getByRole('link', { name: 'Clientes' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(
      within(menu).getByRole('link', { name: 'Início' }).getAttribute('aria-current'),
    ).toBeNull();
    expect(within(menu).queryByRole('link', { name: 'Pedidos' })).toBeNull();
  });

  it('permissão que o navegador inventa não abre nada: sem a permissão exigida o item não existe', async () => {
    renderShell('/', { user: { name: 'X', permissions: ['clientes.ler.extra', '__proto__'] } });
    await screen.findByText('Página Início');
    const menu = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(menu).getAllByRole('link')).toHaveLength(1);
  });

  it('recolhe e expande mantendo o nome acessível pelo title', async () => {
    const user = userEvent.setup();
    renderShell('/clientes');
    await screen.findByText('Página Clientes');
    await user.click(screen.getByRole('button', { name: 'Recolher menu' }));
    expect(screen.getByRole('link', { name: 'Clientes' }).getAttribute('title')).toBe('Clientes');
    await user.click(screen.getByRole('button', { name: 'Expandir menu' }));
    expect(screen.getByRole('link', { name: 'Clientes' }).hasAttribute('title')).toBe(false);
  });

  it('a gaveta abre pelo botão, fecha com Esc devolvendo o foco e fecha ao navegar', async () => {
    const user = userEvent.setup();
    renderShell('/clientes');
    await screen.findByText('Página Clientes');
    const button = screen.getByRole('button', { name: 'Abrir menu' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    await user.click(button);
    expect(screen.getByRole('button', { name: 'Fechar menu' }).getAttribute('aria-expanded')).toBe(
      'true',
    );
    act(() => {
      screen.getByRole('link', { name: 'Clientes' }).focus();
    });
    await key(user, '{Escape}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Abrir menu' }));

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    await user.click(screen.getByRole('link', { name: 'Pedidos' }));
    await screen.findByText('Página Pedidos');
    expect(screen.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
  });

  it('clicar no fundo fecha a gaveta', async () => {
    const user = userEvent.setup();
    renderShell('/');
    await screen.findByText('Página Início');
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(document.querySelector('.shell-menu-backdrop')!);
    expect(document.querySelector('.shell-menu-backdrop')).toBeNull();
  });
});

describe('busca do sistema (slot)', () => {
  function Search({ id, className, variant }: { id: string; className: string; variant: string }) {
    return (
      <form role="search" className={className} data-variant={variant}>
        <input id={id} type="search" aria-label="Buscar" />
      </form>
    );
  }

  it('o slot recebe id, classes e variante; há link de salto; na gaveta há uma segunda busca', async () => {
    const user = userEvent.setup();
    renderShell('/', { search: Search });
    await screen.findByText('Página Início');
    expect(screen.getByRole('link', { name: 'Ir para a busca' }).getAttribute('href')).toBe(
      '#shell-search',
    );
    const field = screen.getByRole('searchbox');
    expect(field.id).toBe('shell-search');
    expect(field.closest('form')?.className).toBe('shell-search shell-search-header');
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(
      screen
        .getAllByRole('searchbox')
        .map((f) => f.id)
        .sort(),
    ).toEqual(['shell-search', 'shell-search-drawer']);
  });
});

describe('menu do usuário', () => {
  it('abre ao clicar no nome, com perfil e saída; sair chama o sistema', async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    renderShell('/', { onSignOut });
    await user.click(await screen.findByRole('button', { name: 'Menu do usuário Ana Souza' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Meu perfil' }).getAttribute('href')).toBe(
      '/perfil',
    );
    await user.click(within(menu).getByRole('menuitem', { name: 'Sair' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('sem página de perfil, o menu só tem a saída', async () => {
    const user = userEvent.setup();
    renderShell('/', { routes: { profile: false } });
    await user.click(await screen.findByRole('button', { name: 'Menu do usuário Ana Souza' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(1);
  });

  it('nome com marcação é texto, e nome só com símbolos mostra "?" no avatar', async () => {
    renderShell('/', { user: { name: '<img src=x onerror=alert(1)>', permissions: [] } });
    await screen.findByText('Página Início');
    expect(document.querySelector('img[src="x"]')).toBeNull();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(document.querySelector('.shell-avatar')?.getAttribute('data-initials')).toBe('IO');
    cleanup();
    renderShell('/', { user: { name: '123 !!', permissions: [] } });
    await screen.findByText('Página Início');
    expect(document.querySelector('.shell-avatar')?.getAttribute('data-initials')).toBe('?');
  });
});

describe('anúncio da troca de rota', () => {
  it('título da aba com o nome da marca e foco no conteúdo ao trocar de rota, não na carga', async () => {
    const user = userEvent.setup();
    renderShell('/clientes', {
      pageTitle: (data) => (data as { title?: string } | undefined)?.title,
    });
    await screen.findByText('Página Clientes');
    expect(document.title).toBe('Clientes · Marca Teste');
    expect(document.activeElement).not.toBe(main());
    await user.click(screen.getByRole('link', { name: 'Pedidos' }));
    await screen.findByText('Página Pedidos');
    await waitFor(() => {
      expect(document.activeElement).toBe(main());
    });
    expect(document.title).toBe('Pedidos · Marca Teste');
  });

  it('sem pageTitle a aba mostra só a marca; as páginas da casca têm título próprio', async () => {
    renderShell('/ajuda');
    await screen.findByRole('heading', { level: 1, name: 'Ajuda' });
    expect(document.title).toBe('Ajuda · Marca Teste');
    cleanup();
    renderShell('/clientes');
    await screen.findByText('Página Clientes');
    expect(document.title).toBe('Marca Teste');
  });

  it('título que não é texto vindo do sistema não quebra a casca', async () => {
    renderShell('/clientes', { pageTitle: () => undefined });
    await screen.findByText('Página Clientes');
    expect(document.title).toBe('Marca Teste');
  });
});

describe('aparência', () => {
  it('abre pelo botão do cabeçalho; as escolhas valem na hora e só o pacote theme grava', async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    renderShell('/');
    await screen.findByText('Página Início');
    // Abrir e fechar janelas da casca não grava nada
    await user.click(screen.getByRole('button', { name: 'Recolher menu' }));
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(setItem).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Aparência e acessibilidade' }));
    const dialog = await screen.findByRole('dialog', { name: 'Aparência e acessibilidade' });
    await user.click(within(dialog).getByRole('radio', { name: 'Escuro' }));
    await user.click(within(dialog).getByRole('radio', { name: 'Alto contraste' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high');
    expect(setItem.mock.calls.every(([chave]) => chave === PREFERENCES_STORAGE_KEY)).toBe(true);

    await user.click(within(dialog).getByRole('button', { name: 'Restaurar o padrão' }));
    expect(getPreferences().theme).toBe('system');
    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    setItem.mockRestore();
  });

  it('a opção de atalhos de uma tecla some quando o sistema os desliga', async () => {
    const user = userEvent.setup();
    renderShell('/', { shortcuts: false });
    await screen.findByText('Página Início');
    await user.click(screen.getByRole('button', { name: 'Aparência e acessibilidade' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('checkbox')).toBeNull();
  });

  it('com atalhos ligados, a opção existe e liga e desliga a preferência', async () => {
    const user = userEvent.setup();
    renderShell('/');
    await screen.findByText('Página Início');
    await user.click(screen.getByRole('button', { name: 'Aparência e acessibilidade' }));
    const box = within(await screen.findByRole('dialog')).getByRole('checkbox', {
      name: 'Ativar atalhos de uma tecla',
    });
    await user.click(box);
    expect(getPreferences().shortcuts).toBe(false);
  });
});

describe('paleta de comandos', () => {
  const open = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{Control>}k{/Control}');
    return screen.findByRole('combobox', { name: 'Comando' });
  };
  const options = () => screen.getAllByRole('option').map((o) => o.textContent);

  it('Ctrl+K e Cmd+K abrem; K sozinho e Ctrl+Alt+K não', async () => {
    const user = userEvent.setup();
    renderShell('/');
    await screen.findByText('Página Início');
    await key(user, 'k');
    await key(user, '{Control>}{Alt>}k{/Alt}{/Control}');
    expect(screen.queryByRole('combobox', { name: 'Comando' })).toBeNull();
    await user.keyboard('{Meta>}k{/Meta}');
    expect(await screen.findByRole('combobox', { name: 'Comando' })).toBeTruthy();
  });

  it('lista páginas e comandos conforme a permissão, na ordem páginas, casca, sistema, aparência', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderShell('/', {
      user: { name: 'Leitora', permissions: ['clientes.ler'] },
      commands: [
        { id: 'novo', label: 'Novo cliente', permission: 'clientes.escrever', to: '/clientes' },
        { id: 'rel', label: 'Relatório', permission: 'clientes.ler', onSelect },
        { id: 'vazio', label: 'Sem destino nem ação' },
      ],
    });
    await screen.findByText('Página Início');
    await open(user);
    const texts = options();
    expect(texts[0]).toContain('Ir para Início');
    expect(texts[1]).toContain('Ir para Clientes');
    expect(texts.some((t) => t.includes('Ir para Pedidos'))).toBe(false);
    expect(texts.some((t) => t.includes('Novo cliente'))).toBe(false);
    expect(texts.some((t) => t.includes('Sem destino'))).toBe(false);
    expect(texts.findIndex((t) => t.includes('Ir para Ajuda'))).toBe(2);
    expect(texts.findIndex((t) => t.includes('Relatório'))).toBeGreaterThan(3);
    expect(texts.at(-1)).toContain('Aparência e acessibilidade');
    await user.type(screen.getByRole('combobox', { name: 'Comando' }), 'relat');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('comando com destino navega e fecha; "Aparência" abre o painel', async () => {
    const user = userEvent.setup();
    const { router } = renderShell('/', {
      commands: [{ id: 'novo', label: 'Novo pedido', to: '/pedidos' }],
    });
    await screen.findByText('Página Início');
    const field = await open(user);
    await user.type(field, 'novo pedido');
    await user.keyboard('{Enter}');
    await screen.findByText('Página Pedidos');
    expect(router.state.location.pathname).toBe('/pedidos');
    expect(screen.queryByRole('combobox', { name: 'Comando' })).toBeNull();

    const again = await open(user);
    await user.type(again, 'contraste');
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Aparência e acessibilidade' })).toBeTruthy();
  });

  it('rótulo de comando com marcação é texto', async () => {
    const user = userEvent.setup();
    renderShell('/', { commands: [{ id: 'x', label: '<b onclick=alert(1)>Ação</b>', to: '/' }] });
    await screen.findByText('Página Início');
    await open(user);
    expect(options().some((t) => t.includes('<b onclick=alert(1)>Ação</b>'))).toBe(true);
    expect(document.querySelector('b')).toBeNull();
  });
});

describe('atalhos de teclado', () => {
  function Search({ id }: { id: string }) {
    return <input id={id} type="search" aria-label="Buscar" />;
  }

  it('g seguido da letra do item navega, respeitando a permissão; letra inválida ou sem permissão não', async () => {
    const user = userEvent.setup();
    const { router } = renderShell('/', {
      user: { name: 'L', permissions: ['clientes.ler'] },
      nav: [
        ...BASE_PROPS.nav,
        { to: '/ajuda', label: 'Hostil', icon: BASE_PROPS.nav[0]!.icon, shortcut: 'G' },
      ],
    });
    await screen.findByText('Página Início');
    await key(user, 'gc');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/clientes');
    });
    await key(user, 'gp');
    await key(user, 'gG');
    await key(user, 'gz');
    expect(router.state.location.pathname).toBe('/clientes');
    await key(user, 'gi');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
  });

  it('a sequência expira: g, espera e depois a letra não navega', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['Date'] });
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    const { router } = renderShell('/');
    await screen.findByText('Página Início');
    await key(user, 'g');
    vi.advanceTimersByTime(2000);
    await key(user, 'c');
    expect(router.state.location.pathname).toBe('/');
    vi.useRealTimers();
  });

  it('/ foca a busca e ? abre a ajuda na tabela de atalhos; sem busca, / não faz nada', async () => {
    const user = userEvent.setup();
    const { router } = renderShell('/', { search: Search });
    await screen.findByText('Página Início');
    await key(user, '/');
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
    (document.activeElement as HTMLElement).blur();
    await key(user, '?');
    await screen.findByRole('heading', { level: 1, name: 'Ajuda' });
    expect(router.state.location.hash).toBe('shell-help-shortcuts');
  });

  it('sem busca configurada, / não é capturado', async () => {
    renderShell('/');
    await screen.findByText('Página Início');
    const event = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('desligados pelo sistema (shortcuts=false) ou pela pessoa, não fazem nada (WCAG 2.1.4)', async () => {
    const user = userEvent.setup();
    const first = renderShell('/', { shortcuts: false });
    await screen.findByText('Página Início');
    await key(user, 'gc');
    expect(first.router.state.location.pathname).toBe('/');
    cleanup();

    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ shortcuts: false }));
    initPreferences();
    const third = renderShell('/');
    await screen.findByText('Página Início');
    await key(user, 'gc');
    expect(third.router.state.location.pathname).toBe('/');
  });

  it('com modificador, dentro de campo ou de menu, não dispara', async () => {
    const user = userEvent.setup();
    const { router } = renderShell('/', { search: Search });
    await screen.findByText('Página Início');
    await user.keyboard('{Control>}g{/Control}c');
    await user.click(screen.getByRole('searchbox'));
    await key(user, 'gc');
    expect(router.state.location.pathname).toBe('/');
  });

  it('o atalho do sistema não é capturado por quem já tratou a tecla', async () => {
    const { router } = renderShell('/');
    await screen.findByText('Página Início');
    const handled = new KeyboardEvent('keydown', { key: 'g', bubbles: true, cancelable: true });
    handled.preventDefault();
    document.dispatchEvent(handled);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', bubbles: true }));
    expect(router.state.location.pathname).toBe('/');
  });
});

describe('voltar ao topo e bloqueio', () => {
  it('o botão só aparece depois de rolar e leva ao topo com o foco no conteúdo', async () => {
    const user = userEvent.setup();
    renderShell('/');
    await screen.findByText('Página Início');
    expect(screen.queryByRole('button', { name: 'Voltar ao topo' })).toBeNull();
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true });
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    await user.click(await screen.findByRole('button', { name: 'Voltar ao topo' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
    expect(document.activeElement).toBe(main());
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('busy bloqueia a tela com o rótulo de processamento depois do atraso', async () => {
    renderShell('/', { busy: true });
    await screen.findByText('Página Início');
    await waitFor(
      () => {
        expect(document.querySelector('dialog[open], [data-busy], .ui-busy')).toBeTruthy();
      },
      { timeout: 2000 },
    );
  });
});

describe('textos: idioma e sobrescrita', () => {
  it('troca o idioma e sobrescreve chaves; valor que não é texto é ignorado', async () => {
    renderShell('/', {
      locale: 'en',
      messages: {
        'shell.footer.version': 'Build {version}',
        'shell.nav.help': 42 as unknown as string,
      },
      version: '9',
    });
    await screen.findByText('Página Início');
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeTruthy();
    expect(screen.getByRole('contentinfo').textContent).toContain('Build 9');
    expect(
      within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Help' }),
    ).toBeTruthy();
  });

  it('idioma sem catálogo cai em pt-BR', async () => {
    renderShell('/', { locale: 'xx' });
    await screen.findByText('Página Início');
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeTruthy();
  });
});

describe('páginas da casca', () => {
  it('perfil: nome, permissões com texto do sistema, código cru quando não há texto e saída', async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    renderShell('/perfil', {
      onSignOut,
      user: { name: 'Ana Souza', permissions: ['b.escrever', 'a.ler', '__proto__', 'constructor'] },
      permissionLabels: { 'a.ler': 'Ver coisas' },
    });
    await screen.findByRole('heading', { level: 1, name: 'Meu perfil' });
    expect(screen.getByText('Ver coisas')).toBeTruthy();
    // Código sem texto cadastrado aparece cru; nome herdado do protótipo nunca vira rótulo
    expect(screen.getByText('b.escrever').tagName).toBe('CODE');
    expect(screen.getByText('constructor').tagName).toBe('CODE');
    expect(screen.getByText('__proto__').tagName).toBe('CODE');
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('perfil sem permissão diz isso', async () => {
    renderShell('/perfil', { user: { name: 'Sem Nada', permissions: [] } });
    expect(await screen.findByText('Nenhuma permissão neste sistema.')).toBeTruthy();
  });

  it('ajuda: atalhos montados a partir do menu, com texto próprio de um item; sem busca, sem a linha /', async () => {
    renderShell('/ajuda', {
      nav: [
        { ...BASE_PROPS.nav[0]!, shortcutDescription: 'Vai para o Início' },
        ...BASE_PROPS.nav.slice(1),
      ],
    });
    await screen.findByRole('heading', { level: 1, name: 'Ajuda' });
    const rows = screen.getAllByRole('row').map((r) => r.textContent);
    expect(rows.some((r) => r.includes('/Vai para a busca'))).toBe(false);
    expect(rows.some((r) => r.includes('Vai para o Início'))).toBe(true);
    expect(rows.some((r) => r.includes('Vai para Clientes'))).toBe(true);
    expect(rows.some((r) => r.includes('Ctrl'))).toBe(true);
  });

  it('ajuda com atalhos desligados lista só paleta e Esc', async () => {
    renderShell('/ajuda', { shortcuts: false });
    await screen.findByRole('heading', { level: 1, name: 'Ajuda' });
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
  });

  it('acessibilidade: recursos, verificado, limites e como relatar', async () => {
    renderShell('/acessibilidade');
    await screen.findByRole('heading', { level: 1, name: 'Acessibilidade' });
    for (const name of [
      'Recursos disponíveis',
      'O que foi verificado',
      'O que ainda não foi verificado',
      'Encontrou uma barreira?',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    }
  });

  it('página da casca fora de um AppShell falha alto, não renderiza vazia', async () => {
    const { render } = await import('@testing-library/react');
    const { ProfilePage } = await import('../src/index.js');
    const silence = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<ProfilePage />)).toThrow(/AppShell/);
    silence.mockRestore();
  });
});
