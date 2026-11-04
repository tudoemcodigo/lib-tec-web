/**
 * Confere o `package.json` de um pacote contra FRT-PKG-02/04: escopo, licença, `exports` com `types`,
 * `files` em lista permitida, `sideEffects` só de CSS, sem script de instalação e sem React nas dependências.
 */
const SCOPE = '@tudoemcodigo/';
const REGISTRY = 'https://npm.pkg.github.com';
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const PEER_ONLY = ['react', 'react-dom', '@base-ui/react'];
const INSTALL_SCRIPTS = ['preinstall', 'install', 'postinstall'];

/**
 * @param {unknown} pkg conteúdo do package.json já lido.
 * @param {string} dirName nome da pasta do pacote em `packages/`.
 * @returns {string[]} problemas encontrados (vazio quando está conforme).
 */
export function checkPackage(pkg, dirName) {
  if (typeof pkg !== 'object' || pkg === null || Array.isArray(pkg)) {
    return ['package.json não é um objeto'];
  }
  const p = /** @type {Record<string, any>} */ (pkg);
  const problems = [];

  if (typeof p.name !== 'string' || !p.name.startsWith(SCOPE) || p.name !== `${SCOPE}${dirName}`) {
    problems.push(`name deve ser "${SCOPE}${dirName}"`);
  }
  if (typeof p.version !== 'string' || !SEMVER.test(p.version)) {
    problems.push('version deve ser SemVer');
  }
  if (p.license !== 'Apache-2.0') {
    problems.push('license deve ser Apache-2.0');
  }
  if (p.repository?.directory !== `packages/${dirName}`) {
    problems.push(`repository.directory deve ser "packages/${dirName}"`);
  }
  if (p.publishConfig?.registry !== REGISTRY) {
    problems.push(`publishConfig.registry deve ser ${REGISTRY}`);
  }
  if (p.private === true) {
    problems.push('pacote publicável não pode ser private');
  }

  checkFiles(p.files, problems);
  checkExports(p.exports, problems);
  checkSideEffects(p.sideEffects, problems);

  for (const script of INSTALL_SCRIPTS) {
    if (p.scripts?.[script] !== undefined) {
      problems.push(`script "${script}" é proibido (FRT-PKG-04)`);
    }
  }
  for (const dep of PEER_ONLY) {
    if (p.dependencies?.[dep] !== undefined) {
      problems.push(`${dep} deve ser peerDependency, não dependency`);
    }
  }
  return problems;
}

function checkFiles(files, problems) {
  if (!Array.isArray(files) || files.length === 0) {
    problems.push('files deve ser uma lista permitida não vazia');
    return;
  }
  for (const entry of files) {
    if (
      typeof entry !== 'string' ||
      entry === '*' ||
      entry === '.' ||
      entry === './' ||
      entry.startsWith('..')
    ) {
      problems.push(`files tem entrada ampla ou inválida: ${String(entry)}`);
    }
  }
}

function checkExports(exportsField, problems) {
  if (typeof exportsField !== 'object' || exportsField === null || Array.isArray(exportsField)) {
    problems.push('exports deve ser um objeto por subcaminho');
    return;
  }
  for (const [key, target] of Object.entries(exportsField)) {
    if (key !== '.' && !key.startsWith('./')) {
      problems.push(`exports "${key}" deve ser "." ou um subcaminho "./..."`);
      continue;
    }
    const isData = key.endsWith('.json') || key.endsWith('.css');
    if (isData) {
      continue;
    }
    if (typeof target !== 'object' || target === null || typeof target.types !== 'string') {
      problems.push(`exports "${key}" precisa da condição "types"`);
    }
  }
}

function checkSideEffects(sideEffects, problems) {
  if (sideEffects === false) {
    return;
  }
  if (
    Array.isArray(sideEffects) &&
    sideEffects.every((glob) => typeof glob === 'string' && glob.endsWith('.css'))
  ) {
    return;
  }
  problems.push('sideEffects deve ser false ou uma lista só de arquivos CSS');
}
