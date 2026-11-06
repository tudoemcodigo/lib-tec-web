// Copia os .css de src/ para dist/ do pacote em que o npm run build está rodando (o tsc só emite JS e .d.ts).
// A pasta src/brand/ (arquivos da marca, como os SVG do theme) vai inteira para dist/brand/, sem alterar um byte.
import { cpSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const src = join(process.cwd(), 'src');
const dist = join(process.cwd(), 'dist');
mkdirSync(dist, { recursive: true });
for (const file of readdirSync(src)) {
  if (file.endsWith('.css')) cpSync(join(src, file), join(dist, file));
}
if (existsSync(join(src, 'brand'))) {
  cpSync(join(src, 'brand'), join(dist, 'brand'), { recursive: true });
}
