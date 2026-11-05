import { describe, expect, it, vi } from 'vitest';
import { createLogger, type LogEntry } from '../src/logger.js';

const NOW = new Date('2026-11-04T12:00:00.000Z');

function montar(production: boolean) {
  const linhas: LogEntry[] = [];
  const logger = createLogger({
    production,
    now: () => NOW,
    write: (e) => linhas.push(e),
    context: () => ({ traceId: 'abc123', route: '/clientes/42?q=ana@x.com', version: '1.2.3' }),
  });
  return { logger, linhas };
}

describe('createLogger', () => {
  it('anexa traceId, rota parametrizada, versão e hora a cada linha', () => {
    const { logger, linhas } = montar(false);
    logger.info('carregou');
    expect(linhas[0]).toMatchObject({
      level: 'info',
      time: '2026-11-04T12:00:00.000Z',
      message: 'carregou',
      traceId: 'abc123',
      route: '/clientes/:id',
      version: '1.2.3',
    });
  });

  it('descarta debug em produção e mantém os demais níveis', () => {
    const { logger, linhas } = montar(true);
    logger.debug('ruído');
    logger.info('a');
    logger.warn('b');
    logger.error('c');
    expect(linhas.map((l) => l.level)).toEqual(['info', 'warn', 'error']);
  });

  it('em desenvolvimento o debug sai', () => {
    const { logger, linhas } = montar(false);
    logger.debug('visível');
    expect(linhas).toHaveLength(1);
  });

  it('redige dado pessoal na mensagem e nos valores, e descarta objeto aninhado', () => {
    const { logger, linhas } = montar(false);
    logger.error('falha de ana@exemplo.com', {
      cpf: '529.982.247-25',
      quantidade: 3,
      ativo: true,
      nada: null,
      aninhado: { email: 'ana@exemplo.com' },
      lista: ['529.982.247-25'],
    });
    const texto = JSON.stringify(linhas);
    expect(texto).not.toContain('ana@exemplo.com');
    expect(texto).not.toContain('529.982.247-25');
    expect(linhas[0]?.data).toEqual({ cpf: '[cpf]', quantidade: 3, ativo: true, nada: null });
  });

  it('limita a quantidade de campos de dados', () => {
    const { logger, linhas } = montar(false);
    const data = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`k${String(i)}`, i]));
    logger.info('muitos', data);
    expect(Object.keys(linhas[0]?.data ?? {})).toHaveLength(20);
  });

  it('falha do destino não derruba quem loga', () => {
    const logger = createLogger({
      production: false,
      write: () => {
        throw new Error('destino fora');
      },
    });
    expect(() => {
      logger.error('x');
    }).not.toThrow();
  });

  it('sem contexto nem destino, escreve JSON no console no nível certo', () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const logger = createLogger({ production: false });
    logger.error('e');
    logger.warn('w');
    logger.info('i');
    expect(JSON.parse(String(erro.mock.calls[0]?.[0]))).toMatchObject({ level: 'error' });
    expect(aviso).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
});
