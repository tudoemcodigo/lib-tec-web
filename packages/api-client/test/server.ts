import { setupServer } from 'msw/node';

/** Servidor MSW dos testes do pacote: chamada sem handler falha (FRT-TST-04) e rede externa real é impossível. */
export const servidor = setupServer();
