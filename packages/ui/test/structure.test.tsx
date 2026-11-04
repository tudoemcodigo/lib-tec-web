// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Badge,
  Button,
  buttonAttributes,
  ConfirmDialog,
  DataList,
  FormErrorSummary,
  PageHeader,
  ScrollRegion,
  Section,
  SelectField,
  SummaryList,
  TextAreaField,
  TextField,
} from '../src/index.js';

afterEach(cleanup);

describe('PageHeader', () => {
  it('trilha com links, página atual marcada e um único h1', () => {
    render(
      <PageHeader
        title="Maria da Silva"
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Clientes', href: '/clientes' },
        ]}
        status={<Badge tone="success">Ativo</Badge>}
        actions={<Button>Salvar</Button>}
        description="Dados do cliente"
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Você está em' });
    expect(nav.querySelectorAll('a')).toHaveLength(2);
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Maria da Silva');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('Ativo')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeTruthy();
    expect(screen.getByText('Dados do cliente')).toBeTruthy();
  });

  it('usa o link do roteador do sistema quando informado e item sem href é texto', () => {
    render(
      <PageHeader
        title="Novo"
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Seção' }]}
        renderLink={(item, children) => (
          <a data-router href={item.href}>
            {children}
          </a>
        )}
      />,
    );
    expect(document.querySelectorAll('a[data-router]')).toHaveLength(1);
    expect(screen.getByText('Seção').closest('a')).toBeNull();
  });

  it('sem trilha nem ações, só o título; título hostil é texto', () => {
    render(<PageHeader title={'<b>x</b>'} />);
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(document.querySelector('b')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('<b>x</b>');
  });
});

describe('Section, DataList, SummaryList, ScrollRegion', () => {
  it('seção nomeada pelo título; sem título não inventa nome', () => {
    const { rerender } = render(
      <Section
        title="Endereço"
        description="Onde mora"
        actions={<button type="button">Editar</button>}
      >
        conteúdo
      </Section>,
    );
    expect(screen.getByRole('region', { name: 'Endereço' })).toBeTruthy();
    rerender(<Section>só corpo</Section>);
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.getByText('só corpo')).toBeTruthy();
  });

  it('lista de dados troca valor vazio por travessão', () => {
    render(
      <DataList
        items={[
          { label: 'Telefone', value: '' },
          { label: 'E-mail', value: 'a@b.com' },
          { label: 'Nascimento', value: null },
        ]}
      />,
    );
    expect(screen.getByText('E-mail').nextElementSibling?.textContent).toBe('a@b.com');
    expect(screen.getByText('Telefone').nextElementSibling?.textContent).toBe('—');
    expect(screen.getByText('Nascimento').nextElementSibling?.textContent).toBe('—');
  });

  it('resumo marca a linha de destaque', () => {
    render(
      <SummaryList
        rows={[
          { label: 'Subtotal', value: 'R$ 10,00' },
          { label: 'Total', value: 'R$ 12,00', emphasis: true },
        ]}
      />,
    );
    expect(screen.getByText('Total').parentElement?.hasAttribute('data-emphasis')).toBe(true);
    expect(screen.getByText('Subtotal').parentElement?.hasAttribute('data-emphasis')).toBe(false);
  });

  it('região rolável é focável e tem nome', () => {
    render(<ScrollRegion label="Itens">tabela</ScrollRegion>);
    const regiao = screen.getByRole('region', { name: 'Itens' });
    expect(regiao.getAttribute('tabindex')).toBe('0');
    cleanup();
    render(<ScrollRegion>tabela</ScrollRegion>);
    expect(screen.getByRole('region', { name: 'Tabela com rolagem' })).toBeTruthy();
  });
});

describe('Button, Badge e buttonAttributes', () => {
  it('padrão é botão de tipo button; variante vai no data-variant', () => {
    render(<Button variant="danger">Excluir</Button>);
    const botao = screen.getByRole('button', { name: 'Excluir' });
    expect(botao.getAttribute('type')).toBe('button');
    expect(botao.getAttribute('data-variant')).toBe('danger');
  });

  it('em andamento: desabilitado, aria-busy e sem novo clique', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick} icon={<i data-testid="ic" />}>
        Salvar
      </Button>,
    );
    const botao = screen.getByRole('button', { name: 'Salvar' });
    expect((botao as HTMLButtonElement).disabled).toBe(true);
    expect(botao.getAttribute('aria-busy')).toBe('true');
    fireEvent.click(botao);
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByTestId('ic')).toBeTruthy();
  });

  it('disabled sem loading não marca aria-busy; type submit é respeitado', () => {
    render(
      <Button disabled type="submit">
        Enviar
      </Button>,
    );
    const botao = screen.getByRole('button', { name: 'Enviar' });
    expect(botao.hasAttribute('aria-busy')).toBe(false);
    expect(botao.getAttribute('type')).toBe('submit');
  });

  it('buttonAttributes dá a aparência de botão a um link', () => {
    expect(buttonAttributes()).toEqual({ className: 'ui-button', 'data-variant': 'primary' });
    render(
      <a href="/x" {...buttonAttributes('secondary')}>
        Ir
      </a>,
    );
    expect(screen.getByRole('link', { name: 'Ir' }).getAttribute('data-variant')).toBe('secondary');
  });

  it('selo leva o texto e o tom', () => {
    render(<Badge tone="error">Cancelado</Badge>);
    expect(screen.getByText('Cancelado').getAttribute('data-tone')).toBe('error');
  });
});

describe('ConfirmDialog', () => {
  const montar = (extra: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Excluir cliente?"
        description="Não dá para desfazer."
        confirmLabel="Excluir"
        onConfirm={onConfirm}
        {...extra}
      />,
    );
    return { onConfirm, onOpenChange };
  };

  it('nomeado pelo título, confirma e cancela', () => {
    const { onConfirm, onOpenChange } = montar({ destructive: true });
    const dialogo = screen.getByRole('dialog', { name: 'Excluir cliente?' });
    expect(dialogo.textContent).toContain('Não dá para desfazer.');
    const confirmar = screen.getByRole('button', { name: 'Excluir' });
    expect(confirmar.getAttribute('data-variant')).toBe('danger');
    fireEvent.click(confirmar);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalled();
  });

  it('pendente bloqueia a confirmação (sem duplo envio)', () => {
    const { onConfirm } = montar({ pending: true });
    const confirmar = screen.getByRole('button', { name: 'Excluir' });
    expect((confirmar as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(confirmar);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('fechado não renderiza', () => {
    montar({ open: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Campos de formulário', () => {
  it('campo associa rótulo, ajuda e erro; obrigatório é dito ao leitor de tela', () => {
    render(
      <TextField
        name="nome"
        label="Nome"
        required
        help="Como no documento"
        error="Informe o nome"
      />,
    );
    const campo = screen.getByRole('textbox', { name: /Nome/ });
    expect(campo.getAttribute('aria-invalid')).toBe('true');
    expect(campo.hasAttribute('required')).toBe(true);
    expect(screen.getByText('(obrigatório)', { exact: false })).toBeTruthy();
    expect(screen.getByText('Como no documento')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toBe('Informe o nome');
  });

  it('sem erro não há alerta', () => {
    render(<TextField name="nome" label="Nome" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('seleção e área de texto com opções e desabilitada', () => {
    render(
      <>
        <SelectField
          name="tipo"
          label="Tipo"
          options={[
            { value: 'a', text: 'A' },
            { value: 'b', text: 'B', disabled: true },
          ]}
        />
        <TextAreaField name="obs" label="Observação" error="Longo demais" />
      </>,
    );
    expect(screen.getByRole('combobox', { name: 'Tipo' })).toBeTruthy();
    expect(screen.getByRole<HTMLOptionElement>('option', { name: 'B' }).disabled).toBe(true);
    expect(screen.getByRole('textbox', { name: 'Observação' }).getAttribute('aria-invalid')).toBe(
      'true',
    );
  });
});

describe('FormErrorSummary', () => {
  it('vazio não renderiza', () => {
    render(<FormErrorSummary errors={[]} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('recebe o foco, lista os erros e o link leva ao campo', () => {
    render(
      <>
        <FormErrorSummary
          errors={[
            { field: 'email', message: 'E-mail inválido' },
            { field: 'nome', message: 'Informe o nome' },
          ]}
        />
        <TextField name="email" label="E-mail" />
        <TextField name="nome" label="Nome" />
      </>,
    );
    const resumo = screen.getByRole('alert');
    expect(document.activeElement).toBe(resumo);
    expect(resumo.textContent).toContain('Corrija os campos abaixo para continuar');
    fireEvent.click(screen.getByRole('link', { name: 'E-mail inválido' }));
    expect(document.activeElement?.getAttribute('name')).toBe('email');
  });

  it('nome de campo hostil não quebra a busca do elemento', () => {
    render(<FormErrorSummary errors={[{ field: 'a"]\\b', message: 'x' }]} title="Erros" />);
    expect(() => fireEvent.click(screen.getByRole('link', { name: 'x' }))).not.toThrow();
    expect(screen.getByText('Erros')).toBeTruthy();
  });

  it('um novo erro devolve o foco ao resumo', () => {
    const { rerender } = render(<FormErrorSummary errors={[{ field: 'a', message: 'um' }]} />);
    (document.activeElement as HTMLElement).blur();
    rerender(<FormErrorSummary errors={[{ field: 'a', message: 'dois' }]} />);
    expect(document.activeElement).toBe(screen.getByRole('alert'));
  });
});
