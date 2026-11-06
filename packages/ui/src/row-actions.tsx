import { Suspense, useState, type ReactNode } from 'react';
import { IconButton } from './controls.js';
import { IconMore } from './icons.js';

export interface LazyRowActionsProps {
  /** Nome do botão de ações ("Ações de Maria da Silva"). */
  readonly label: string;
  /** O menu de verdade, carregado sob demanda; recebe `true` para já abrir (o clique que o pediu). */
  readonly render: (openOnMount: boolean) => ReactNode;
}

/**
 * Botão de ações de uma linha cujo menu só é baixado no primeiro clique. O menu e a janela do Base UI pesam ~46 kB gzip e não
 * fazem falta para VER a lista: baixá-los ao renderizar a lista estouraria o orçamento de JavaScript da rota (FRT-OPE-02). Até o
 * clique, um botão idêntico (mesmo tamanho e nome) ocupa o lugar, e o clique abre o menu assim que o código chega.
 */
export function LazyRowActions({ label, render }: LazyRowActionsProps) {
  const [requested, setRequested] = useState(false);
  const placeholder = (
    <div className="ui-row-actions">
      <IconButton
        label={label}
        icon={<IconMore />}
        aria-haspopup="menu"
        aria-expanded={false}
        onClick={() => {
          setRequested(true);
        }}
      />
    </div>
  );
  if (!requested) return placeholder;
  return <Suspense fallback={placeholder}>{render(true)}</Suspense>;
}
