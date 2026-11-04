import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  setSink,
  redact,
  track,
  trackError,
  parameterizeRoute,
  type TelemetryEvent,
} from '../src/telemetry.js';

afterEach(() => {
  setSink(null);
});

describe('redigir', () => {
  it.each([
    ['contato ana.silva@exemplo.com.br agora', 'contato [email] agora'],
    ['cpf 529.982.247-25 ok', 'cpf [cpf] ok'],
    ['cpf 52998224725 ok', 'cpf [cpf] ok'],
    ['cnpj 11.222.333/0001-81 ok', 'cnpj [cnpj] ok'],
    ['Authorization: Bearer abc.def-123', 'Authorization: [credencial]'],
    ['jwt eyJhbGciOi.eyJzdWIiOi.assinatura-x fim', 'jwt [token] fim'],
    ['id 3f2504e0-4f89-41d3-9a0c-0305e82c3301 fim', 'id [id] fim'],
    ['tel (11) 91234-5678 fim', 'tel [telefone] fim'],
  ])('%s', (entrada, esperado) => {
    expect(redact(entrada)).toBe(esperado);
  });

  it('limita o tamanho', () => {
    expect(redact('x'.repeat(5000)).length).toBe(501);
  });
});

describe('rotaParametrizada', () => {
  it.each([
    ['/clientes/3f2504e0-4f89-41d3-9a0c-0305e82c3301', '/clientes/:id'],
    ['/pedidos/42?busca=ana@x.com', '/pedidos/:id'],
    ['/clientes#topo', '/clientes'],
    ['/', '/'],
  ])('%s', (entrada, esperado) => {
    expect(parameterizeRoute(entrada)).toBe(esperado);
  });
});

describe('track', () => {
  it('redige dado pessoal injetado em todo campo antes de entregar ao destino', () => {
    const recebidos: TelemetryEvent[] = [];
    setSink((e) => recebidos.push(e));
    track({
      type: 'error',
      name: 'Falha de ana@exemplo.com',
      detail: 'CPF 529.982.247-25 token eyJabc.eyJdef.ghi',
      route: '/clientes/3f2504e0-4f89-41d3-9a0c-0305e82c3301?email=ana@exemplo.com',
    });
    const texto = JSON.stringify(recebidos);
    expect(texto).not.toContain('ana@exemplo.com');
    expect(texto).not.toContain('529.982.247-25');
    expect(texto).not.toContain('eyJabc');
    expect(texto).not.toContain('3f2504e0');
    expect(recebidos[0]?.route).toBe('/clientes/:id');
  });

  it('sem destino, não faz nada', () => {
    expect(() => {
      track({ type: 'metric', name: 'LCP', value: 1 });
    }).not.toThrow();
  });

  it('falha do destino não derruba a interface', () => {
    setSink(() => {
      throw new Error('destino fora');
    });
    expect(() => {
      track({ type: 'metric', name: 'INP', value: 1 });
    }).not.toThrow();
  });

  it('o disposer remove o destino', () => {
    const destino = vi.fn();
    const remover = setSink(destino);
    remover();
    track({ type: 'route', name: 'x' });
    expect(destino).not.toHaveBeenCalled();
  });

  it('registrarErro leva o traceId e o nome, sem a mensagem crua de dado pessoal', () => {
    const recebidos: TelemetryEvent[] = [];
    setSink((e) => recebidos.push(e));
    trackError(
      Object.assign(new Error('falha'), { name: 'ApiError', traceId: 't-1' }),
      '/clientes/42',
    );
    expect(recebidos[0]).toMatchObject({
      name: 'ApiError',
      traceId: 't-1',
      route: '/clientes/:id',
    });
  });

  it('registrarErro aceita valor que não é Error', () => {
    const recebidos: TelemetryEvent[] = [];
    setSink((e) => recebidos.push(e));
    trackError('texto solto');
    expect(recebidos[0]?.name).toBe('UnknownError');
  });
});
