import { useEffect, useId, useRef, useState } from 'react';
import { useUiText } from './messages.js';

/** Tempo mínimo de espera antes de bloquear a tela, para uma resposta rápida não piscar o bloqueio. */
export const BUSY_DELAY_MS = 250;
/** Depois de aparecer, o bloqueio fica ao menos este tempo, para não piscar na saída. */
export const BUSY_MIN_VISIBLE_MS = 600;

/**
 * `true` só depois de `delayMs` ativo e, uma vez visível, até `minVisibleMs` depois de aparecer. Resposta mais rápida que o
 * atraso nunca mostra nada.
 */
export function useBusyVisible(
  active: boolean,
  delayMs: number = BUSY_DELAY_MS,
  minVisibleMs: number = BUSY_MIN_VISIBLE_MS,
): boolean {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);
  useEffect(() => {
    if (active) {
      if (visible) return undefined;
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delayMs);
      return () => {
        clearTimeout(timer);
      };
    }
    if (!visible) return undefined;
    const remaining = Math.max(0, minVisibleMs - (Date.now() - shownAt.current));
    const timer = setTimeout(() => {
      setVisible(false);
    }, remaining);
    return () => {
      clearTimeout(timer);
    };
  }, [active, visible, delayMs, minVisibleMs]);
  return visible;
}

/** O símbolo da marca em SVG próprio (sem arquivo externo, sem CSS injetado, compatível com CSP estrita). */
export function BrandMark({ animated = true }: { readonly animated?: boolean }) {
  const gradient = useId();
  return (
    <svg
      className="ui-brand-mark"
      data-animated={animated || undefined}
      viewBox="0 0 100 100"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="92" y2="0">
          <stop offset="0" stopColor="#0A84FF" />
          <stop offset="0.55" stopColor="#6A5DF6" />
          <stop offset="1" stopColor="#9A44F8" />
        </linearGradient>
      </defs>
      <path
        className="ui-brand-arc"
        d="M83.10 26.14 A42 42 0 1 0 83.10 77.86"
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <g stroke="currentColor" strokeWidth="7" strokeLinecap="round">
        <line x1="31" y1="38" x2="69" y2="38" />
        <line x1="50" y1="38" x2="50" y2="71" />
      </g>
      <g fill="currentColor">
        <circle className="ui-brand-node" cx="31" cy="38" r="8" />
        <circle className="ui-brand-node" cx="69" cy="38" r="8" />
        <circle className="ui-brand-node" cx="50" cy="71" r="8" />
      </g>
      <circle cx="50" cy="38" r="11" fill="#0A84FF" />
    </svg>
  );
}

export interface BusyOverlayProps {
  /** Há algo em andamento (salvando, excluindo, trocando de página). */
  readonly active: boolean;
  /** O que está acontecendo, em linguagem de quem usa. Sem rótulo, usa "Processando…" do catálogo. */
  readonly label?: string | undefined;
  readonly delayMs?: number;
  readonly minVisibleMs?: number;
}

/**
 * Bloqueio total da tela enquanto algo é processado, com a marca animada. É uma janela modal nativa (`<dialog>`): o resto da
 * página fica inerte, o foco fica retido e, ao terminar, volta ao elemento de antes. `Esc` não fecha (o bloqueio acaba quando
 * o trabalho acaba). Aparece só depois de um atraso curto, para resposta rápida não piscar. Use para **processamento** e
 * troca de página; dados que aparecem dentro da tela usam esqueleto, que não esconde o que já está lido (FRT-DSG-05).
 */
export function BusyOverlay({ active, label, delayMs, minVisibleMs }: BusyOverlayProps) {
  const text = useUiText();
  const visible = useBusyVisible(active, delayMs, minVisibleMs);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!visible || element === null) return undefined;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (typeof element.showModal === 'function') element.showModal();
    else element.setAttribute('open', '');
    return () => {
      if (typeof element.close === 'function') element.close();
      else element.removeAttribute('open');
      if (previous?.isConnected === true) previous.focus();
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <dialog
      ref={dialog}
      className="ui-busy"
      aria-labelledby={titleId}
      aria-busy="true"
      onCancel={(event) => {
        event.preventDefault();
      }}
    >
      <div className="ui-busy-card">
        <BrandMark />
        <p id={titleId} className="ui-busy-label" role="status">
          {label ?? text('ui.busy')}
        </p>
      </div>
    </dialog>
  );
}
