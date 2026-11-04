import type { ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { IconClose } from './icons.js';
import { focusAfterClose, type ReturnFocus } from './focus.js';
import { useUiText } from './messages.js';

/* Arquivo próprio pelo mesmo motivo do ConfirmDialog: o Dialog (Base UI) não deve entrar na carga inicial de quem não o abre. */

export interface SheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Nome do painel: é o nome acessível da janela e o título visível. */
  readonly title: string;
  readonly description?: string | undefined;
  /** Ações do painel (Editar, Fechar…), alinhadas à direita no rodapé. Um só botão primário. */
  readonly footer?: ReactNode;
  readonly children: ReactNode;
  /** Elemento que recebe o foco ao fechar, quando o que abriu o painel deixa de existir (item de menu). */
  readonly returnFocus?: ReturnFocus | undefined;
}

/**
 * Painel lateral para ver ou editar um registro sem sair da lista (master-detail). É modal: prende o foco, fecha com Esc ou ao
 * clicar fora, e devolve o foco ao elemento que o abriu (FRT-ACE-03).
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  returnFocus,
}: SheetProps) {
  const text = useUiText();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="ui-backdrop" />
        <Dialog.Popup className="ui-sheet" finalFocus={focusAfterClose(returnFocus)}>
          <header className="ui-sheet-header">
            <div>
              <Dialog.Title className="ui-sheet-title">{title}</Dialog.Title>
              {description !== undefined ? (
                <Dialog.Description className="ui-sheet-description">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close
              className="ui-icon-action"
              aria-label={text('ui.sheet.close')}
              title={text('ui.sheet.close')}
            >
              <IconClose />
            </Dialog.Close>
          </header>
          <div className="ui-sheet-body">{children}</div>
          <footer className="ui-sheet-footer">{footer}</footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
