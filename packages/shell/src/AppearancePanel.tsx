import { useId } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import {
  CONTRASTS,
  DEFAULT_PREFERENCES,
  MOTIONS,
  SEASONALS,
  TEXT_SIZES,
  THEMES,
  setPreferences,
  usePreferences,
  type Preferences,
} from '@tudoemcodigo/theme';
import { Button } from '@tudoemcodigo/ui';
import { useShellText, type ShellMessageKey } from './messages.js';

type Field = 'theme' | 'textSize' | 'contrast' | 'motion' | 'seasonal';

interface GroupProps<K extends Field> {
  readonly field: K;
  readonly values: readonly Preferences[K][];
  readonly current: Preferences[K];
}

/** Opções mutuamente exclusivas: radios nativos, que o teclado (setas) e o leitor de tela já entendem. */
function Group<K extends Field>({ field, values, current }: GroupProps<K>) {
  const name = useId();
  const text = useShellText();
  return (
    <fieldset className="shell-options">
      <legend>{text(`shell.appearance.${field}`)}</legend>
      {values.map((value) => (
        <label key={value} className="shell-option">
          <input
            type="radio"
            name={name}
            value={value}
            checked={current === value}
            onChange={() => {
              setPreferences({ [field]: value });
            }}
          />
          <span>{text(`shell.appearance.${field}.${value}` as ShellMessageKey)}</span>
        </label>
      ))}
    </fieldset>
  );
}

interface AppearancePanelProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Mostra a opção de ligar os atalhos de uma tecla; o sistema que os desliga não oferece a opção. */
  readonly shortcuts: boolean;
}

/**
 * Preferências de exibição: tema, tamanho do texto, contraste, animações e atalhos (WCAG 1.4.4, 1.4.6, 2.1.4, 2.3.3). As
 * escolhas são gravadas pelo pacote `theme` (única escrita em storage permitida); a casca não grava nada.
 */
export function AppearancePanel({ open, onOpenChange, shortcuts }: AppearancePanelProps) {
  const text = useShellText();
  const preferences = usePreferences();
  const shortcutsId = useId();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="ui-backdrop" />
        <Dialog.Popup className="ui-dialog shell-appearance-dialog">
          <Dialog.Title>{text('shell.appearance.title')}</Dialog.Title>
          <Dialog.Description className="ui-help">
            {text('shell.appearance.description')}
          </Dialog.Description>
          <div className="shell-options-grid">
            <Group field="theme" values={THEMES} current={preferences.theme} />
            <Group field="textSize" values={TEXT_SIZES} current={preferences.textSize} />
            <Group field="contrast" values={CONTRASTS} current={preferences.contrast} />
            <Group field="motion" values={MOTIONS} current={preferences.motion} />
            <Group field="seasonal" values={SEASONALS} current={preferences.seasonal} />
          </div>
          {shortcuts ? (
            <fieldset className="shell-options">
              <legend>{text('shell.appearance.shortcuts')}</legend>
              <label className="shell-option" htmlFor={shortcutsId}>
                <input
                  id={shortcutsId}
                  type="checkbox"
                  checked={preferences.shortcuts}
                  onChange={(event) => {
                    setPreferences({ shortcuts: event.target.checked });
                  }}
                />
                <span>{text('shell.appearance.shortcuts.enable')}</span>
              </label>
            </fieldset>
          ) : null}
          <div className="ui-dialog-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setPreferences(DEFAULT_PREFERENCES);
              }}
            >
              {text('shell.appearance.restore')}
            </Button>
            <Dialog.Close render={<Button />}>{text('shell.appearance.close')}</Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
