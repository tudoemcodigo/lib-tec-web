import { useEffect, useState } from 'react';
import { IconTop } from '@tudoemcodigo/ui';
import { ShellIcon } from './icons.js';
import { CONTENT_ID } from './ids.js';
import { useShellText } from './messages.js';

/** Quanto da página precisa ter rolado para o botão aparecer, em pixels. */
export const BACK_TO_TOP_THRESHOLD = 400;

/** Botão que reaparece depois de rolar a página; devolve o foco ao conteúdo para o teclado seguir de onde parou. */
export function BackToTop() {
  const text = useShellText();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > BACK_TO_TOP_THRESHOLD);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      className="shell-back-to-top"
      aria-label={text('shell.backToTop')}
      onClick={() => {
        window.scrollTo({ top: 0 });
        document.getElementById(CONTENT_ID)?.focus();
      }}
    >
      <ShellIcon icon={IconTop} />
    </button>
  );
}
