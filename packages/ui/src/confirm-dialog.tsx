import type { ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Button } from './controls.js';
import { focusAfterClose, type ReturnFocus } from './focus.js';
import { useUiText } from './messages.js';

/*
 * Arquivo próprio de propósito: o Dialog (Base UI) pesa ~20 kB gzip e o `Button` é usado em toda tela. Juntos num módulo só,
 * o empacotador leva o diálogo para a carga inicial mesmo de quem nunca abre um.
 */

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly pending?: boolean | undefined;
  /** Ação destrutiva: o botão de confirmar fica vermelho. */
  readonly destructive?: boolean | undefined;
  readonly children?: ReactNode;
  /** Elemento que recebe o foco ao fechar, quando o que abriu a janela deixa de existir (item de menu). */
  readonly returnFocus?: ReturnFocus | undefined;
}

/** Modal que prende o foco, fecha com Esc e devolve o foco ao gatilho (FRT-ACE-03). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending,
  destructive,
  children,
  returnFocus,
}: ConfirmDialogProps) {
  const text = useUiText();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="ui-backdrop" />
        <Dialog.Popup className="ui-dialog" finalFocus={focusAfterClose(returnFocus)}>
          <Dialog.Title className="ui-dialog-title">{title}</Dialog.Title>
          <Dialog.Description className="ui-dialog-text">{description}</Dialog.Description>
          {children}
          <div className="ui-dialog-actions">
            <Dialog.Close render={<Button variant="secondary" />}>
              {text('ui.confirm.cancel')}
            </Dialog.Close>
            <Button
              variant={destructive === true ? 'danger' : 'primary'}
              onClick={onConfirm}
              loading={pending === true}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
