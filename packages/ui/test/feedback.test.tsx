// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Alert,
  EmptyState,
  ErrorState,
  LoadingState,
  ToastProvider,
  UiProvider,
  useToast,
  type ToastApi,
} from '../src/index.js';

afterEach(cleanup);

describe('Alert', () => {
  it('erro é anunciado de imediato; os demais, com educação', () => {
    const { rerender } = render(<Alert tone="error" title="Falhou" />);
    expect(screen.getByRole('alert').textContent).toContain('Falhou');
    rerender(<Alert tone="success" title="Salvo" />);
    expect(screen.getByRole('status').textContent).toContain('Salvo');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('o tom aparece em texto para o leitor de tela, não só em cor', () => {
    render(<Alert tone="warning" title="Atenção ao prazo" />);
    expect(screen.getByRole('status').textContent).toContain('Atenção: ');
  });

  it('mostra detalhe e ação; dispensar chama o retorno só quando informado', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <Alert tone="info" action={<button type="button">Agir</button>}>
        detalhe
      </Alert>,
    );
    expect(screen.getByText('detalhe')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Agir' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Dispensar aviso' })).toBeNull();
    rerender(<Alert tone="info" title="x" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dispensar aviso' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('texto hostil vira texto, nunca marcação', () => {
    render(<Alert tone="error" title={'<img src=x onerror=alert(1)>'} />);
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('respeita o idioma e a sobrescrita do UiProvider', () => {
    render(
      <UiProvider locale="en" messages={{ 'ui.tone.error': 'Problem' }}>
        <Alert tone="error" title="x" onDismiss={() => undefined} />
      </UiProvider>,
    );
    expect(screen.getByRole('alert').textContent).toContain('Problem: ');
    expect(screen.getByRole('button', { name: 'Dismiss notice' })).toBeTruthy();
  });

  it('idioma sem catálogo cai em pt-BR', () => {
    render(
      <UiProvider locale="xx">
        <Alert tone="info" title="x" onDismiss={() => undefined} />
      </UiProvider>,
    );
    expect(screen.getByRole('button', { name: 'Dispensar aviso' })).toBeTruthy();
  });
});

describe('Toast', () => {
  let api: ToastApi;
  function Capture() {
    api = useToast();
    return null;
  }
  const montar = () =>
    render(
      <ToastProvider>
        <Capture />
      </ToastProvider>,
    );

  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sucesso aparece como status, com título padrão, e some sozinho em 5 s', () => {
    montar();
    act(() => {
      api.success('Cliente criado.');
    });
    const toast = screen.getByRole('status');
    expect(toast.textContent).toContain('Sucesso');
    expect(toast.textContent).toContain('Cliente criado.');
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(screen.queryByRole('status')).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('erro é alerta e fica até a pessoa fechar', () => {
    montar();
    act(() => {
      api.error('Não foi possível salvar.');
    });
    act(() => {
      vi.advanceTimersByTime(600_000);
    });
    expect(screen.getByRole('alert').textContent).toContain('Não foi possível salvar.');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('mouse em cima pausa a contagem e ao sair ela recomeça', () => {
    montar();
    act(() => {
      api.info('Algo');
    });
    const toast = screen.getByRole('status');
    fireEvent.mouseEnter(toast);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.queryByRole('status')).not.toBeNull();
    fireEvent.mouseLeave(toast);
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('foco em cima também pausa', () => {
    montar();
    act(() => {
      api.warning('Aviso', { title: 'Prazo' });
    });
    const toast = screen.getByRole('status');
    expect(toast.textContent).toContain('Prazo');
    fireEvent.focus(toast);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.queryByRole('status')).not.toBeNull();
    fireEvent.blur(toast);
  });

  it('duration 0 mantém; duration própria vale', () => {
    montar();
    act(() => {
      api.success('fica', { duration: 0 });
      api.success('vai', { duration: 1000 });
    });
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toContain('fica');
  });

  it('no máximo 4: o excesso derruba o mais antigo que não é erro, e erro nunca é descartado', () => {
    montar();
    act(() => {
      api.error('erro-1');
      api.info('i-1');
      api.info('i-2');
      api.info('i-3');
      api.info('i-4');
      api.info('i-5');
    });
    const texto = document.body.textContent;
    expect(texto).toContain('erro-1');
    expect(texto).not.toContain('i-1');
    expect(texto).toContain('i-5');
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('só erros além do limite: todos ficam (nada some sem a pessoa ver)', () => {
    montar();
    act(() => {
      for (let i = 0; i < 6; i += 1) api.error(`e-${String(i)}`);
    });
    expect(screen.getAllByRole('alert')).toHaveLength(6);
  });

  it('dismiss por id, clear e mensagem gigante cortada', () => {
    montar();
    let id = '';
    act(() => {
      id = api.success('um', { duration: 0 });
      api.success('x'.repeat(5000), { duration: 0 });
    });
    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getAllByRole('status')[1]?.textContent.length).toBeLessThan(700);
    act(() => {
      api.dismiss(id);
    });
    expect(screen.getAllByRole('status')).toHaveLength(1);
    act(() => {
      api.clear();
    });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('mensagem hostil é texto', () => {
    montar();
    act(() => {
      api.error('<script>alert(1)</script>');
    });
    expect(document.querySelector('script')).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('<script>alert(1)</script>');
  });

  it('a região tem nome acessível e useToast fora do provider falha claramente', () => {
    montar();
    expect(screen.getByRole('region', { name: 'Notificações' })).toBeTruthy();
    cleanup();
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Capture />)).toThrow(/ToastProvider/);
    erro.mockRestore();
  });
});

describe('ErrorState', () => {
  it('diz o que houve, mostra o código de suporte e oferece nova tentativa', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Não foi possível carregar"
        message="Tente de novo em instantes."
        supportCode="abc123"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar' })).toBeTruthy();
    expect(screen.getByText('abc123')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('sem código nem nova tentativa, não mostra esses controles', () => {
    render(<ErrorState title="Falhou" action={<a href="/">Início</a>} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('link', { name: 'Início' })).toBeTruthy();
  });

  it('copia o código e confirma; falha na área de transferência não quebra', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ErrorState title="Falhou" supportCode="trace-9" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));
    expect(writeText).toHaveBeenCalledWith('trace-9');
    expect(await screen.findByRole('button', { name: 'Código copiado' })).toBeTruthy();

    cleanup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('negado')) },
      configurable: true,
    });
    render(<ErrorState title="Falhou" supportCode="trace-9" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));
    await Promise.resolve();
    expect(screen.getByRole('button', { name: 'Copiar código' })).toBeTruthy();
  });
});

describe('EmptyState e LoadingState', () => {
  it('estado vazio convida a agir', () => {
    render(
      <EmptyState
        title="Nenhum cliente ainda"
        description="Cadastre o primeiro."
        action={<a href="/novo">Novo cliente</a>}
      />,
    );
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nenhum cliente ainda' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Novo cliente' })).toBeTruthy();
  });

  it('título é h2 por padrão e h1 quando o estado ocupa a página', () => {
    const { rerender } = render(<EmptyState title="Vazio" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Vazio' })).toBeTruthy();
    rerender(<EmptyState title="Página não encontrada" headingLevel={1} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    cleanup();
    render(<ErrorState title="Falhou" headingLevel={1} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Falhou' })).toBeTruthy();
  });

  it('sem descrição nem ação, só título', () => {
    render(<EmptyState title="Vazio" icon={<span data-testid="i" />} />);
    expect(screen.getByTestId('i')).toBeTruthy();
    expect(document.querySelector('.ui-state-actions')).toBeNull();
  });

  it('carregando anuncia uma vez e limita as linhas', () => {
    const { rerender } = render(<LoadingState rows={3} />);
    expect(screen.getByRole('status').textContent).toBe('Carregando…');
    expect(document.querySelectorAll('.ui-skeleton')).toHaveLength(3);
    rerender(<LoadingState rows={5000} label="Buscando" />);
    expect(document.querySelectorAll('.ui-skeleton')).toHaveLength(12);
    expect(screen.getByRole('status').textContent).toBe('Buscando');
    rerender(<LoadingState rows={-3} />);
    expect(document.querySelectorAll('.ui-skeleton')).toHaveLength(1);
  });
});
