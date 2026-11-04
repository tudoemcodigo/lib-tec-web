// Servidor do E2E: serve o dist REAL do pacote sob uma CSP estrita (nonce + strict-dynamic, style-src 'self', sem
// unsafe-inline), como o TEC.Bff serve a SPA (FRT-SEG-05). Também imita o GET /bff/theme com casos de tema.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const PORT = 4572;
const DIST = join(import.meta.dirname, '..', 'dist');
const FILE = /^\/dist\/([a-z]+\.(js|css))$/;

const accent = { light: '#b3001b', dark: '#ff9aa6' };
const onAccent = { light: '#ffffff', dark: '#1a0004' };
const christmas = {
  id: 'christmas-2026',
  tokens: { 'color-accent': accent, 'color-on-accent': onAccent },
  assets: {},
  animation: 'snow',
};

const CASES = {
  christmas: { contract: 1, theme: christmas },
  none: { contract: 1, theme: null },
  // Hostis: a SPA precisa recusar e ficar no tema padrão
  'protected-token': {
    contract: 1,
    theme: { ...christmas, tokens: { 'color-error': { light: '#000000', dark: '#ffffff' } } },
  },
  'css-injection': {
    contract: 1,
    theme: {
      ...christmas,
      tokens: { 'color-accent': { light: '#fff;}body{display:none', dark: '#ffffff' } },
    },
  },
  'low-contrast': {
    contract: 1,
    theme: { ...christmas, tokens: { 'color-accent': { light: '#f7f9f9', dark: '#222a3f' } } },
  },
};

const PAGE = (nonce) => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>theme e2e</title>
<link rel="stylesheet" href="/dist/tokens.css">
<link rel="stylesheet" href="/dist/animations.css">
<link rel="stylesheet" href="/probe.css">
<script type="importmap" nonce="${nonce}">{"imports":{"react":"/stub-react.js"}}</script>
</head><body>
<p id="probe">probe</p>
<div id="inline-control" style="color: rgb(255, 0, 0)">controle: style inline (deve ser bloqueado)</div>
<script type="module" nonce="${nonce}">
  window.__violations = [];
  document.addEventListener('securitypolicyviolation', (e) => window.__violations.push(e.violatedDirective));
  const tec = await import('/dist/index.js');
  window.tec = tec;
  window.fetchCase = (name) => (signal) => fetch('/bff/theme?case=' + name, { signal }).then((r) => r.json());
  window.__ready = true;
</script>
</body></html>`;

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${String(PORT)}`);
  if (url.pathname === '/') {
    const nonce = randomBytes(16).toString('base64');
    const csp = [
      "default-src 'none'",
      `script-src 'nonce-${nonce}' 'strict-dynamic'`,
      "style-src 'self'",
      "img-src 'self'",
      "connect-src 'self'",
      "base-uri 'none'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': csp,
    });
    res.end(PAGE(nonce));
    return;
  }
  if (url.pathname === '/probe.css') {
    res.writeHead(200, { 'content-type': 'text/css' });
    res.end('#probe { color: var(--tec-color-accent); background-color: var(--tec-color-bg); }');
    return;
  }
  if (url.pathname === '/stub-react.js') {
    res.writeHead(200, { 'content-type': 'text/javascript' });
    res.end(
      'export const useSyncExternalStore = () => { throw new Error("hook fora do React"); };',
    );
    return;
  }
  if (url.pathname === '/bff/theme') {
    const body = CASES[url.searchParams.get('case') ?? ''];
    res.writeHead(body ? 200 : 404, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body ?? { error: 'caso desconhecido' }));
    return;
  }
  const match = FILE.exec(url.pathname);
  if (match?.[1] !== undefined) {
    try {
      const data = await readFile(join(DIST, match[1]));
      res.writeHead(200, { 'content-type': match[2] === 'css' ? 'text/css' : 'text/javascript' });
      res.end(data);
      return;
    } catch {
      // cai no 404
    }
  }
  res.writeHead(404).end();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`theme e2e em http://127.0.0.1:${String(PORT)}`);
});
