// CLI: confere o package.json de todo pacote em packages/ (FRT-PKG-04). Sai com 1 se houver problema.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkPackage } from './check-package.js';

const root = join(import.meta.dirname, '..', 'packages');
let failed = false;

for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const pkg = JSON.parse(readFileSync(join(root, entry.name, 'package.json'), 'utf8'));
  const problems = checkPackage(pkg, entry.name);
  for (const problem of problems) {
    console.error(`packages/${entry.name}: ${problem}`);
  }
  failed ||= problems.length > 0;
}

if (failed) process.exit(1);
console.log('check:packages ok');
