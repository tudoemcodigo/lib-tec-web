import { render } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { IconHome, IconReceipt, IconUsers, UiProvider } from '@tudoemcodigo/ui';
import {
  AccessibilityPage,
  AppShell,
  HelpPage,
  ProfilePage,
  type AppShellProps,
} from '../src/index.js';

export const NAV: AppShellProps['nav'] = [
  { to: '/', label: 'Início', icon: IconHome, exact: true, shortcut: 'i' },
  {
    to: '/clientes',
    label: 'Clientes',
    icon: IconUsers,
    permission: 'clientes.ler',
    shortcut: 'c',
  },
  { to: '/pedidos', label: 'Pedidos', icon: IconReceipt, permission: 'pedidos.ler', shortcut: 'p' },
];

export const BASE_PROPS: AppShellProps = {
  appName: 'Marca Teste',
  user: { name: 'Ana Souza', permissions: ['clientes.ler', 'pedidos.ler'] },
  nav: NAV,
  onSignOut: () => undefined,
};

/** Monta o `AppShell` na rota raiz de um roteador em memória, com páginas simples nas rotas do menu e as da casca. */
export function renderShell(path = '/', props: Partial<AppShellProps> = {}) {
  const merged: AppShellProps = { ...BASE_PROPS, ...props };
  const root = createRootRoute({ component: () => <AppShell {...merged} /> });
  const page = (to: string, title: string) =>
    createRoute({
      getParentRoute: () => root,
      path: to,
      staticData: { title },
      component: () => <p>{`Página ${title}`}</p>,
    });
  const tree = root.addChildren([
    page('/', 'Início'),
    page('/clientes', 'Clientes'),
    page('/pedidos', 'Pedidos'),
    createRoute({ getParentRoute: () => root, path: '/perfil', component: ProfilePage }),
    createRoute({ getParentRoute: () => root, path: '/ajuda', component: HelpPage }),
    createRoute({
      getParentRoute: () => root,
      path: '/acessibilidade',
      component: AccessibilityPage,
    }),
  ]);
  const router = createRouter({
    routeTree: tree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const view = render(
    <UiProvider>
      <RouterProvider router={router} />
    </UiProvider>,
  );
  return { ...view, router };
}
