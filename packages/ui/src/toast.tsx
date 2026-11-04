import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Tone } from './alert.js';
import { IconClose, IconError, IconInfo, IconSuccess, IconWarning } from './icons.js';
import { useUiText } from './messages.js';

export interface ToastOptions {
  /** Título curto; sem ele, o nome do tom ("Sucesso") faz o papel para o leitor de tela. */
  readonly title?: string;
  /** Tempo na tela em ms. `0` = fica até a pessoa fechar. Padrão: 5 s (sucesso e informação), 8 s (atenção), sem fim (erro). */
  readonly duration?: number;
}

export interface ToastApi {
  success(message: string, options?: ToastOptions): string;
  info(message: string, options?: ToastOptions): string;
  warning(message: string, options?: ToastOptions): string;
  error(message: string, options?: ToastOptions): string;
  dismiss(id: string): void;
  clear(): void;
}

interface ToastItem {
  readonly id: string;
  readonly tone: Tone;
  readonly message: string;
  readonly title: string | undefined;
  readonly duration: number;
}

const DEFAULT_DURATION: Record<Tone, number> = {
  success: 5000,
  info: 5000,
  warning: 8000,
  error: 0,
};
const MAX_VISIBLE = 4;
const MAX_MESSAGE_LENGTH = 500;

const ToastContext = createContext<ToastApi | null>(null);

const ICONS = {
  success: IconSuccess,
  info: IconInfo,
  warning: IconWarning,
  error: IconError,
} as const satisfies Record<Tone, () => ReactNode>;

/**
 * Notificação transitória de resultado de uma ação ("Cliente criado."). Ela não carrega informação que só exista ali: erro que
 * a pessoa precisa corrigir fica na página (`Alert`, resumo de erros). Fica numa região viva no canto da tela; pausa com o
 * mouse ou o foco em cima (WCAG 2.2.1); no máximo {@link MAX_VISIBLE} ao mesmo tempo, descartando as mais antigas que não
 * sejam de erro.
 */
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const text = useUiText();
  const [items, setItems] = useState<readonly ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems((atuais) => atuais.filter((item) => item.id !== id));
  }, []);

  const show = useCallback((tone: Tone, message: string, options?: ToastOptions): string => {
    counter.current += 1;
    const id = `toast-${String(counter.current)}`;
    const item: ToastItem = {
      id,
      tone,
      message: message.slice(0, MAX_MESSAGE_LENGTH),
      title: options?.title,
      duration: options?.duration ?? DEFAULT_DURATION[tone],
    };
    setItems((atuais) => {
      const todos = [...atuais, item];
      // Excesso sai pelo mais antigo que não é erro; erro só sai por ação da pessoa
      while (todos.length > MAX_VISIBLE) {
        const indice = todos.findIndex((candidato) => candidato.tone !== 'error');
        if (indice === -1 || todos[indice] === item) break;
        todos.splice(indice, 1);
      }
      return todos;
    });
    return id;
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => show('success', message, options),
      info: (message, options) => show('info', message, options),
      warning: (message, options) => show('warning', message, options),
      error: (message, options) => show('error', message, options),
      dismiss,
      clear: () => {
        setItems([]);
      },
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section className="ui-toasts" aria-label={text('ui.toast.region')}>
        {items.map((item) => (
          <ToastView key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </section>
    </ToastContext.Provider>
  );
}

function ToastView({
  item,
  onDismiss,
}: {
  readonly item: ToastItem;
  readonly onDismiss: (id: string) => void;
}) {
  const text = useUiText();
  const [paused, setPaused] = useState(false);
  const Icon = ICONS[item.tone];

  useEffect(() => {
    if (item.duration <= 0 || paused) return undefined;
    const timer = setTimeout(() => {
      onDismiss(item.id);
    }, item.duration);
    return () => {
      clearTimeout(timer);
    };
  }, [item.duration, item.id, onDismiss, paused]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- ponteiro e foco só pausam a contagem (WCAG 2.2.1); a ação é o botão de fechar
    <div
      role={item.tone === 'error' ? 'alert' : 'status'}
      className="ui-toast"
      data-tone={item.tone}
      onMouseEnter={() => {
        setPaused(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
      }}
      onFocus={() => {
        setPaused(true);
      }}
      onBlur={() => {
        setPaused(false);
      }}
    >
      <span className="ui-alert-icon">
        <Icon />
      </span>
      <div className="ui-alert-body">
        <p className="ui-alert-title">{item.title ?? text(`ui.toast.${item.tone}`)}</p>
        <p className="ui-alert-text">{item.message}</p>
      </div>
      <button
        type="button"
        className="ui-icon-button"
        aria-label={text('ui.toast.dismiss')}
        onClick={() => {
          onDismiss(item.id);
        }}
      >
        <IconClose />
      </button>
    </div>
  );
}

/** Acesso às notificações. Fora de um `ToastProvider` lança: é erro de montagem do sistema, não de uso. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api === null) throw new Error('useToast precisa de um ToastProvider acima na árvore.');
  return api;
}
