// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fillUiText,
  Pagination,
  UiProvider,
  useDebouncedValue,
  useUiLocale,
} from '../src/index.js';

afterEach(cleanup);

const base = { page: 2, totalPages: 5, total: 83, hasPrevious: true, hasNext: true };

describe('Pagination', () => {
  it('mostra a página, o total real de registros e muda de página', () => {
    const onChange = vi.fn();
    render(<Pagination {...base} onChange={onChange} />);
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeTruthy();
    expect(screen.getByText('Página 2 / 5')).toBeTruthy();
    expect(screen.getByText('83 registros')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(onChange).toHaveBeenNthCalledWith(1, 3);
    expect(onChange).toHaveBeenNthCalledWith(2, 1);
  });

  it('sem total de páginas mostra só o número; primeira e última desabilitam os botões', () => {
    render(
      <Pagination
        {...base}
        page={1}
        totalPages={0}
        total={1}
        hasPrevious={false}
        hasNext={false}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByText('Página 1')).toBeTruthy();
    expect(screen.getByText('1 registro')).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Anterior' }).disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Próxima' }).disabled).toBe(true);
  });

  it('zero registros diz "Nenhum registro"; milhar sai no formato do idioma', () => {
    const { rerender } = render(<Pagination {...base} total={0} onChange={() => undefined} />);
    expect(screen.getByText('Nenhum registro')).toBeTruthy();
    rerender(<Pagination {...base} total={1500} onChange={() => undefined} />);
    expect(screen.getByText('1.500 registros')).toBeTruthy();
  });

  it('respeita o idioma do UiProvider', () => {
    render(
      <UiProvider locale="en">
        <Pagination {...base} total={1500} onChange={() => undefined} />
      </UiProvider>,
    );
    expect(screen.getByText('1,500 records')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
    expect(screen.getByText('Page 2 / 5')).toBeTruthy();
  });
});

describe('useUiLocale e fillUiText', () => {
  it('o locale padrão é pt-BR e o do provider vale', () => {
    const { result, rerender } = renderHook(() => useUiLocale());
    expect(result.current).toBe('pt-BR');
    rerender();
    const { result: ingles } = renderHook(() => useUiLocale(), {
      wrapper: ({ children }) => <UiProvider locale="en">{children}</UiProvider>,
    });
    expect(ingles.current).toBe('en');
  });

  it('troca {nome} pelos valores e deixa o que não tem valor como está', () => {
    expect(fillUiText('Página {page} de {total}', { page: 2 })).toBe('Página 2 de {total}');
    expect(fillUiText('{__proto__} {constructor}', {})).toBe('{__proto__} {constructor}');
  });
});

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('só devolve o valor novo depois do atraso, e cada mudança reinicia a contagem', () => {
    const { result, rerender } = renderHook(({ valor }) => useDebouncedValue(valor, 300), {
      initialProps: { valor: 'a' },
    });
    expect(result.current).toBe('a');
    rerender({ valor: 'ab' });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');
    rerender({ valor: 'abc' });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(result.current).toBe('abc');
  });

  it('ao desmontar, o timer pendente é limpo', () => {
    const { rerender, unmount } = renderHook(({ valor }) => useDebouncedValue(valor, 300), {
      initialProps: { valor: 'a' },
    });
    rerender({ valor: 'b' });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
