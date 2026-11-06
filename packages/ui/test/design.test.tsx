// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Badge,
  Button,
  LoadingState,
  RefreshBar,
  ScrollRegion,
  Sheet,
  type BadgeTone,
} from '../src/index.js';

afterEach(cleanup);

const css = readFileSync(join(import.meta.dirname, '..', 'src', 'ui.css'), 'utf8');

/** Corpo do bloco `seletor { ... }` (o seletor começa uma linha, com o recuo da camada). */
function block(selector: string): string {
  const start = css.indexOf(`\n  ${selector} {`);
  expect(start, `seletor ${selector}`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

describe('Button em andamento: largura fixa', () => {
  it('sem ícone, o indicador fica sobre o texto, que segue dando o nome ao botão', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Salvar
      </Button>,
    );
    const botao = screen.getByRole('button', { name: 'Salvar' });
    expect(botao.getAttribute('data-overlay')).toBe('true');
    expect(botao.getAttribute('aria-busy')).toBe('true');
    expect(botao.querySelectorAll('.ui-button-spinner')).toHaveLength(1);
    expect(botao.querySelector('.ui-button-label')?.textContent).toBe('Salvar');
    fireEvent.click(botao);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fora de carga não há indicador nem marca', () => {
    render(<Button icon={<i data-testid="ic" />}>Salvar</Button>);
    const botao = screen.getByRole('button', { name: 'Salvar' });
    expect(botao.querySelector('.ui-button-spinner')).toBeNull();
    expect(botao.hasAttribute('data-overlay')).toBe(false);
    expect(screen.getByTestId('ic')).toBeTruthy();
  });

  it('o CSS não tira o texto do leitor de tela (opacity, nunca visibility nem display)', () => {
    const label = block('.ui-button[data-overlay] > .ui-button-label');
    expect(label).toContain('opacity: 0');
    expect(label).not.toMatch(/visibility|display/);
  });
});

describe('Badge: texto, ícone do tom e cor', () => {
  it.each<BadgeTone>(['success', 'warning', 'error', 'info', 'blue', 'violet', 'teal'])(
    '%s tem ícone próprio',
    (tone) => {
      render(<Badge tone={tone}>Situação</Badge>);
      const selo = screen.getByText('Situação');
      expect(selo.querySelector('.ui-badge-icon svg')).not.toBeNull();
      expect(selo.getAttribute('data-tone')).toBe(tone);
    },
  );

  it('cada tom usa um ícone diferente (a cor não é o único sinal)', () => {
    const formas = (['success', 'warning', 'error', 'info', 'blue', 'violet', 'teal'] as const).map(
      (tone) => {
        const { container, unmount } = render(<Badge tone={tone}>x</Badge>);
        const forma = container.querySelector('path')?.getAttribute('d') ?? '';
        unmount();
        return forma;
      },
    );
    expect(new Set(formas).size).toBe(7);
    expect(formas.every((forma) => forma.length > 0)).toBe(true);
  });

  it('neutro não tem ícone, só o ponto do CSS; conteúdo hostil é texto', () => {
    render(<Badge tone="neutral">{'<img src=x onerror=alert(1)>'}</Badge>);
    expect(document.querySelector('.ui-badge-icon')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
  });
});

describe('LoadingState em tabela', () => {
  it('anuncia uma vez e esconde o desenho do leitor de tela', () => {
    render(<LoadingState variant="table" rows={3} columns={5} label="Carregando clientes" />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByText('Carregando clientes')).toBeTruthy();
    const tabela = document.querySelector('.ui-skeleton-table');
    expect(tabela?.getAttribute('aria-hidden')).toBe('true');
    // cabeçalho + 3 linhas, 5 colunas cada
    expect(tabela?.querySelectorAll('.ui-skeleton-row')).toHaveLength(4);
    expect(tabela?.querySelectorAll('.ui-skeleton-row[data-head]')).toHaveLength(1);
    expect(tabela?.querySelectorAll('.ui-skeleton')).toHaveLength(20);
  });

  it.each([
    [-5, 1],
    [0, 1],
    [999, 12],
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 1],
    [3.9, 3],
  ])('colunas hostis (%s) ficam entre 1 e 12 (%s)', (colunas, esperado) => {
    const { container } = render(<LoadingState variant="table" rows={1} columns={colunas} />);
    expect(container.querySelectorAll('.ui-skeleton-row')[0]?.children).toHaveLength(esperado);
  });

  it('linhas hostis também são limitadas, e o modo padrão segue sendo as linhas', () => {
    const { container } = render(<LoadingState rows={Number.NaN} />);
    expect(container.querySelectorAll('.ui-skeleton')).toHaveLength(1);
    expect(container.querySelector('.ui-skeleton-table')).toBeNull();
  });
});

describe('RefreshBar', () => {
  it('é só visual e ocupa o mesmo lugar ligada ou desligada', () => {
    const { rerender, container } = render(<RefreshBar active={false} />);
    const barra = container.firstElementChild;
    expect(barra?.getAttribute('aria-hidden')).toBe('true');
    expect(barra?.hasAttribute('data-active')).toBe(false);
    rerender(<RefreshBar active />);
    expect(container.firstElementChild?.getAttribute('data-active')).toBe('true');
    expect(block('.ui-refresh')).toContain('height: 2px');
  });
});

describe('ScrollRegion com cabeçalho fixo', () => {
  it('marca a região e segue focável por teclado', () => {
    render(
      <ScrollRegion label="Clientes" stickyHeader>
        <table />
      </ScrollRegion>,
    );
    const regiao = screen.getByRole('region', { name: 'Clientes' });
    expect(regiao.getAttribute('data-sticky-header')).toBe('true');
    expect(regiao.getAttribute('tabindex')).toBe('0');
  });

  it('sem a opção, a região não vira área de rolagem vertical', () => {
    render(
      <ScrollRegion label="Clientes">
        <table />
      </ScrollRegion>,
    );
    expect(screen.getByRole('region').hasAttribute('data-sticky-header')).toBe(false);
  });
});

function ComGatilho({ aoMudar }: { readonly aoMudar?: (aberto: boolean) => void }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAberto(true);
        }}
      >
        Ver detalhes
      </button>
      <Sheet
        open={aberto}
        onOpenChange={(valor) => {
          setAberto(valor);
          aoMudar?.(valor);
        }}
        title="Maria da Silva"
        description="Dados do cliente"
        footer={<button type="button">Editar</button>}
      >
        <p>conteúdo do painel</p>
      </Sheet>
    </>
  );
}

describe('Sheet (painel lateral)', () => {
  it('abre como janela nomeada, com descrição, corpo e rodapé', async () => {
    const usuario = userEvent.setup();
    render(<ComGatilho />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await usuario.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    const janela = await screen.findByRole('dialog', { name: 'Maria da Silva' });
    expect(janela.getAttribute('aria-describedby')).not.toBeNull();
    expect(screen.getByText('conteúdo do painel')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fechar painel' })).toBeTruthy();
  });

  it('Esc fecha e o foco volta ao botão que abriu', async () => {
    const usuario = userEvent.setup();
    const aoMudar = vi.fn();
    render(<ComGatilho aoMudar={aoMudar} />);
    const gatilho = screen.getByRole('button', { name: 'Ver detalhes' });
    await usuario.click(gatilho);
    await screen.findByRole('dialog');
    await usuario.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(aoMudar).toHaveBeenLastCalledWith(false);
    await waitFor(() => {
      expect(document.activeElement).toBe(gatilho);
    });
  });

  it('o foco fica preso dentro do painel enquanto aberto', async () => {
    const usuario = userEvent.setup();
    render(<ComGatilho />);
    await usuario.click(screen.getByRole('button', { name: 'Ver detalhes' }));
    const janela = await screen.findByRole('dialog');
    for (let i = 0; i < 6; i += 1) {
      await usuario.tab();
      // as guardas de foco do Base UI devolvem o foco para dentro logo depois do Tab
      await waitFor(() => {
        expect(janela.contains(document.activeElement)).toBe(true);
      });
    }
  });

  it('título hostil é texto e o botão de fechar fecha', async () => {
    const usuario = userEvent.setup();
    const aoMudar = vi.fn();
    render(
      <Sheet open onOpenChange={aoMudar} title={'<script>x</script>'}>
        corpo
      </Sheet>,
    );
    expect(document.querySelector('script')).toBeNull();
    await usuario.click(await screen.findByRole('button', { name: 'Fechar painel' }));
    expect(aoMudar).toHaveBeenCalledWith(false, expect.anything());
  });
});

describe('returnFocus: janela aberta de um item de menu que deixa de existir', () => {
  function DeMenu({ alvo }: { readonly alvo: () => HTMLElement | null }) {
    const [aberto, setAberto] = useState(false);
    return (
      <>
        <button type="button" data-alvo>
          Menu
        </button>
        {aberto ? null : (
          <button
            type="button"
            onClick={() => {
              setAberto(true);
            }}
          >
            Item efêmero
          </button>
        )}
        <Sheet open={aberto} onOpenChange={setAberto} title="Painel" returnFocus={alvo}>
          corpo
        </Sheet>
      </>
    );
  }

  it('o foco volta ao elemento indicado, não ao body', async () => {
    const usuario = userEvent.setup();
    render(<DeMenu alvo={() => document.querySelector<HTMLElement>('[data-alvo]')} />);
    await usuario.click(screen.getByRole('button', { name: 'Item efêmero' }));
    await screen.findByRole('dialog');
    await usuario.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Menu' }));
    });
  });

  it('alvo ausente ou desligado do documento cai no padrão, sem quebrar', async () => {
    const usuario = userEvent.setup();
    const solto = document.createElement('button');
    render(<DeMenu alvo={() => solto} />);
    await usuario.click(screen.getByRole('button', { name: 'Item efêmero' }));
    await screen.findByRole('dialog');
    await usuario.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(document.activeElement).not.toBe(solto);
  });
});

describe('contrato do CSS (FRT-DSG)', () => {
  it('superfície estática tem só borda; sombra é de camada flutuante', () => {
    expect(block('.ui-section')).not.toContain('box-shadow');
    expect(block('.ui-scroll')).not.toContain('box-shadow');
    for (const flutuante of ['.ui-menu', '.ui-dialog', '.ui-sheet']) {
      expect(block(flutuante), flutuante).toContain('--ui-shadow-raised');
    }
  });

  it('nenhum outline some sem substituto (a regra de foco é do tema)', () => {
    expect(css).not.toMatch(/outline\s*:\s*(none|0)\b/);
    expect(css).not.toMatch(/outline-style\s*:\s*none/);
  });

  it('cores forçadas (Alto Contraste do Windows) têm regras próprias', () => {
    expect(css).toContain('@media (forced-colors: active)');
  });

  it('a densidade compacta lê a altura densa do tema, sem repetir regra por componente', () => {
    expect(block("[data-density='compact']")).toContain('--tec-control-height-dense');
  });
});
