import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { focusAfterClose, type ReturnFocus } from './focus.js';
import { fillUiText, useUiText } from './messages.js';

/* Arquivo próprio pelo mesmo motivo do ConfirmDialog: o Dialog (Base UI) não deve entrar na carga inicial de quem não o abre. */

export interface CommandItem {
  /** Identificador estável do comando. */
  readonly id: string;
  /** O que o comando faz, no imperativo ("Ir para Clientes", "Novo cliente"): é o texto da opção. */
  readonly label: string;
  /** Agrupa e acrescenta uma dica discreta ("Navegar", "Ações"). */
  readonly group?: string;
  /** Outras palavras que também encontram o comando ("cadastro" para Clientes). */
  readonly keywords?: readonly string[];
  readonly icon?: ReactNode;
  readonly onSelect: () => void;
}

export interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly items: readonly CommandItem[];
  readonly returnFocus?: ReturnFocus | undefined;
}

/** Sem acento e sem caixa: "Início" casa com "inicio". */
const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase();

/** Todos os termos digitados precisam aparecer no texto ou nas palavras-chave (E, em qualquer ordem). */
export function filterCommands(
  items: readonly CommandItem[],
  query: string,
): readonly CommandItem[] {
  const terms = normalize(query).split(/\s+/u).filter(Boolean);
  if (terms.length === 0) return items;
  return items.filter((item) => {
    const haystack = normalize([item.label, item.group ?? '', ...(item.keywords ?? [])].join(' '));
    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Paleta de comandos (`Ctrl/Cmd+K`): janela modal com busca e lista de ações e páginas, toda operável por teclado. Padrão
 * combobox com lista (`aria-activedescendant`): o foco fica no campo, as setas movem a opção ativa, `Enter` executa, `Esc` fecha
 * e o foco volta ao elemento de origem. Quem decide o que aparece é quem monta a lista (por permissão); aqui ninguém
 * ganha acesso: o servidor segue decidindo (SEC-IDN-04).
 */
export function CommandPalette({ open, onOpenChange, items, returnFocus }: CommandPaletteProps) {
  const text = useUiText();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="ui-backdrop" />
        <Dialog.Popup className="ui-palette" finalFocus={focusAfterClose(returnFocus)}>
          <Dialog.Title className="ui-sr">{text('ui.palette.title')}</Dialog.Title>
          <PaletteBody
            items={items}
            onDone={() => {
              onOpenChange(false);
            }}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PaletteBody({
  items,
  onDone,
}: {
  readonly items: readonly CommandItem[];
  readonly onDone: () => void;
}) {
  const text = useUiText();
  const base = useId();
  const listId = `${base}-list`;
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const found = filterCommands(items, query);
  // A opção ativa nunca passa do fim da lista, mesmo que a busca a tenha encurtado
  const current = found.length === 0 ? -1 : Math.min(active, found.length - 1);

  const run = (item: CommandItem | undefined): void => {
    if (item === undefined) return;
    onDone();
    item.onSelect();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (found.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current + 1) % found.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current - 1 + found.length) % found.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(found.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(found[current]);
    }
  };

  const count =
    found.length === 0
      ? text('ui.palette.empty')
      : fillUiText(text(found.length === 1 ? 'ui.palette.one' : 'ui.palette.other'), {
          count: found.length,
        });

  return (
    <>
      <input
        className="ui-palette-input"
        type="text"
        role="combobox"
        aria-label={text('ui.palette.label')}
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={current >= 0 ? `${base}-${String(current)}` : undefined}
        placeholder={text('ui.palette.placeholder')}
        autoComplete="off"
        spellCheck={false}
        maxLength={80}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
      />
      <div
        id={listId}
        role="listbox"
        aria-label={text('ui.palette.title')}
        className="ui-palette-list"
      >
        {found.map((item, index) => (
          // O teclado passa pelo campo (combobox); o clique é só para quem usa mouse.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            key={item.id}
            id={`${base}-${String(index)}`}
            role="option"
            tabIndex={-1}
            // o foco fica no campo (aria-activedescendant): clicar na opção não o tira de lá
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            aria-selected={index === current}
            className="ui-palette-option"
            onMouseMove={() => {
              if (index !== current) setActive(index);
            }}
            onClick={() => {
              run(item);
            }}
          >
            {item.icon !== undefined ? <span className="ui-palette-icon">{item.icon}</span> : null}
            <span className="ui-palette-text">{item.label}</span>
            {item.group !== undefined ? (
              <span className="ui-palette-group">{item.group}</span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="ui-palette-status" role="status">
        {count}
      </p>
    </>
  );
}
