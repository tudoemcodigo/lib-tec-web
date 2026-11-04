import { z } from 'zod';

/**
 * Único ponto do pacote que importa o Zod. O Zod 4 sonda `new Function()` para ligar um JIT interno; com CSP sem
 * `unsafe-eval` a sonda gera violação nos relatórios (FRT-SEG-04/05). A configuração mora aqui, na cadeia de dependência de
 * todo esquema, porque a ordem de importação do ponto de entrada não garante nada: o bundler junta o núcleo do Zod e os
 * esquemas num chunk compartilhado que pode executar antes do corpo do ponto de entrada do sistema.
 */
z.config({ jitless: true });

export { z };
