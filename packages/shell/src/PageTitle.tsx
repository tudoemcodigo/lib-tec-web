import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { PageHeader, type BreadcrumbItem } from '@tudoemcodigo/ui';

interface PageTitleProps {
  readonly title: string;
  readonly breadcrumb?: readonly BreadcrumbItem[];
  readonly description?: string;
  readonly titleId?: string;
  readonly actions?: ReactNode;
}

/** Cabeçalho das páginas da casca: trilha com os links do roteador do sistema, título (o `h1`) e descrição. */
export function PageTitle({ title, breadcrumb, description, titleId, actions }: PageTitleProps) {
  return (
    <PageHeader
      title={title}
      {...(breadcrumb ? { breadcrumb } : {})}
      {...(actions === undefined ? {} : { actions })}
      {...(description === undefined ? {} : { description })}
      {...(titleId === undefined ? {} : { titleId })}
      renderLink={(item, children) => (
        // exact: sem isso o roteador marca o pai como página atual dentro das rotas filhas
        <Link to={item.href ?? '/'} activeOptions={{ exact: true, includeSearch: false }}>
          {children}
        </Link>
      )}
    />
  );
}
