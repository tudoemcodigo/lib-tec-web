import type { ComponentPropsWithoutRef } from 'react';
import { buttonAttributes } from './controls.js';
import { IconClose } from './icons.js';
import { useUiText } from './messages.js';

/**
 * "Cancelar" de um formulário: link com a aparência de botão secundário, ícone e o texto do pacote (`ui.cancel`). Não conhece
 * o roteador: o sistema o liga ao dele (`createLink(CancelAnchor)` no TanStack Router), e `to`, `params` e `search` seguem
 * tipados pelas rotas do sistema. Por isso o `ui` não depende de nenhum roteador.
 */
export function CancelAnchor(props: Omit<ComponentPropsWithoutRef<'a'>, 'children'>) {
  const text = useUiText();
  return (
    <a {...props} {...buttonAttributes('secondary')}>
      <span className="ui-button-icon">
        <IconClose />
      </span>
      {text('ui.cancel')}
    </a>
  );
}
