import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { BusyOverlay, IconClose, IconContrast, IconMenu, IconSearch } from '@tudoemcodigo/ui';
import { BackToTop } from './BackToTop.js';
import { ShellContext, type ShellContextValue } from './context.js';
import { ShellIcon } from './icons.js';
import { CONTENT_ID, DRAWER_SEARCH_ID, MENU_ID, SEARCH_ID } from './ids.js';
import { ShellTextProvider, useShellText } from './messages.js';
import { resolveRoutes } from './permissions.js';
import { ShellMenu } from './ShellMenu.js';
import type { AppShellProps } from './types.js';
import { useAnnounceRoute } from './useAnnounceRoute.js';
import { useShortcuts } from './useShortcuts.js';
import { UserMenu } from './UserMenu.js';

// A janela de preferências só é baixada na primeira abertura (orçamento de JavaScript da carga inicial, FRT-EST-07)
const AppearancePanel = lazy(() =>
  import('./AppearancePanel.js').then((module) => ({ default: module.AppearancePanel })),
);

// A paleta de comandos também só é baixada na primeira abertura
const Palette = lazy(() => import('./Palette.js').then((module) => ({ default: module.Palette })));

const NO_LABELS: Readonly<Record<string, string>> = {};

/** Bloqueio total da tela, com a marca animada, enquanto o sistema processa algo ou o roteador troca de página. */
function Busy({ busy }: { readonly busy: boolean }) {
  const text = useShellText();
  const navigating = useRouterState({ select: (state) => state.isLoading });
  return (
    <BusyOverlay
      active={busy || navigating}
      label={busy ? text('shell.busy') : text('shell.loading')}
    />
  );
}

function Shell({
  appName,
  systemName,
  user,
  nav,
  onSignOut,
  version,
  search: Search,
  routes: routesProp,
  commands = [],
  footerLinks = [],
  shortcuts = true,
  busy = false,
  permissionLabels = NO_LABELS,
  pageTitle,
  children,
}: Omit<AppShellProps, 'locale' | 'messages'>) {
  const text = useShellText();
  const routes = useMemo(
    () => resolveRoutes(routesProp),
    // As quatro chaves bastam: o objeto de `routes` costuma ser criado a cada render do sistema
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routesProp?.home, routesProp?.profile, routesProp?.help, routesProp?.accessibility],
  );
  useAnnounceRoute(appName, routes, pageTitle);
  useShortcuts({ enabled: shortcuts, user, nav, routes, hasSearch: Search !== undefined });

  // Gaveta (telas estreitas), recolhimento (telas largas) e janelas são estado efêmero de interface: nada vai a storage
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteLoaded, setPaletteLoaded] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  const openAppearance = () => {
    setAppearanceLoaded(true);
    setAppearanceOpen(true);
  };
  const openPalette = () => {
    setPaletteLoaded(true);
    setPaletteOpen(true);
  };

  // Ctrl/Cmd+K abre a paleta de qualquer ponto; tem modificador, então não é atalho de uma tecla (WCAG 2.1.4)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteLoaded(true);
        setPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const context: ShellContextValue = {
    appName,
    user,
    nav,
    routes,
    onSignOut,
    hasSearch: Search !== undefined,
    shortcuts,
    permissionLabels,
  };
  const footerNav = [
    ...(routes.help === null ? [] : [{ to: routes.help, label: text('shell.nav.help') }]),
    ...(routes.accessibility === null
      ? []
      : [{ to: routes.accessibility, label: text('shell.nav.accessibility') }]),
    ...footerLinks,
  ];

  return (
    <ShellContext.Provider value={context}>
      <div className="shell" data-collapsed={collapsed ? '' : undefined}>
        <div className="shell-skip">
          <a className="ui-skip-link" href={`#${CONTENT_ID}`}>
            {text('shell.skip.content')}
          </a>
          <a className="ui-skip-link shell-skip-menu" href={`#${MENU_ID}`}>
            {text('shell.skip.menu')}
          </a>
          {Search ? (
            <a className="ui-skip-link shell-skip-search" href={`#${SEARCH_ID}`}>
              {text('shell.skip.search')}
            </a>
          ) : null}
        </div>
        <header className="shell-header">
          <button
            type="button"
            ref={menuButton}
            className="shell-header-menu"
            aria-controls={MENU_ID}
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? text('shell.nav.closeMenu') : text('shell.nav.openMenu')}
            onClick={() => {
              setDrawerOpen((open) => !open);
            }}
          >
            <ShellIcon icon={drawerOpen ? IconClose : IconMenu} />
          </button>
          <span className="shell-header-symbol" aria-hidden="true" />
          {systemName ? (
            <p className="shell-app-name" title={systemName}>
              {systemName}
            </p>
          ) : null}
          <div className="shell-header-actions">
            {Search ? (
              <Search
                id={SEARCH_ID}
                className="shell-search shell-search-header"
                variant="header"
              />
            ) : null}
            <button
              type="button"
              className="shell-header-button"
              aria-label={text('shell.palette.open')}
              title={text('shell.palette.open')}
              onClick={openPalette}
            >
              <ShellIcon icon={IconSearch} />
            </button>
            <button
              type="button"
              className="shell-header-button"
              aria-label={text('shell.appearance.open')}
              title={text('shell.appearance.open')}
              onClick={openAppearance}
            >
              <ShellIcon icon={IconContrast} />
            </button>
            <UserMenu name={user.name} profileTo={routes.profile} onSignOut={onSignOut} />
          </div>
        </header>

        <ShellMenu
          appName={appName}
          homeTo={routes.home}
          user={user}
          nav={nav}
          open={drawerOpen}
          collapsed={collapsed}
          top={
            Search && drawerOpen ? (
              <Search
                id={DRAWER_SEARCH_ID}
                className="shell-search shell-search-drawer"
                variant="drawer"
              />
            ) : null
          }
          onNavigate={() => {
            setDrawerOpen(false);
          }}
          onEscape={() => {
            setDrawerOpen(false);
            menuButton.current?.focus();
          }}
          onToggleCollapse={() => {
            setCollapsed((value) => !value);
          }}
        />
        {/* O fundo só existe para o clique de quem usa mouse; o teclado fecha com Esc ou pelo botão. */}
        {drawerOpen ? (
          <div
            className="shell-menu-backdrop"
            aria-hidden="true"
            onClick={() => {
              setDrawerOpen(false);
            }}
          />
        ) : null}

        <div className="shell-area">
          <main id={CONTENT_ID} className="shell-main" tabIndex={-1}>
            {children ?? <Outlet />}
          </main>
          <footer className="shell-footer">
            <span>
              {text('shell.footer.copyright', {
                year: String(new Date().getFullYear()),
                app: appName,
              })}
            </span>
            {footerNav.length > 0 ? (
              <nav aria-label={text('shell.footer.nav')} className="shell-footer-links">
                {footerNav.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            ) : null}
            {version === undefined ? null : (
              <span>{text('shell.footer.version', { version })}</span>
            )}
          </footer>
        </div>
        <BackToTop />
        <Busy busy={busy} />
        {paletteLoaded ? (
          <Suspense fallback={null}>
            <Palette
              open={paletteOpen}
              onOpenChange={setPaletteOpen}
              user={user}
              nav={nav}
              routes={routes}
              commands={commands}
              onOpenAppearance={openAppearance}
            />
          </Suspense>
        ) : null}
        {appearanceLoaded ? (
          <Suspense fallback={null}>
            <AppearancePanel
              open={appearanceOpen}
              onOpenChange={setAppearanceOpen}
              shortcuts={shortcuts}
            />
          </Suspense>
        ) : null}
      </div>
    </ShellContext.Provider>
  );
}

/**
 * Casca da aplicação: links de salto, cabeçalho (busca do sistema, paleta, aparência e menu do usuário), menu lateral, área de
 * trabalho, rodapé, voltar ao topo, bloqueio da tela, paleta de comandos e painel de aparência. Tudo que é do sistema (nome,
 * menu, permissões, comandos, busca, textos) entra por props; o pacote não conhece rota, permissão nem dado de nenhum sistema.
 * Use como componente da rota raiz: o conteúdo da rota aparece onde está o `Outlet`.
 */
export function AppShell({ locale, messages, ...props }: AppShellProps) {
  return (
    <ShellTextProvider
      {...(locale === undefined ? {} : { locale })}
      {...(messages === undefined ? {} : { messages })}
    >
      <Shell {...props} />
    </ShellTextProvider>
  );
}
