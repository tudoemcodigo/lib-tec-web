import { useEffect, useState } from 'react';

/** Devolve `value` só depois de `delayMs` sem mudança (debounce de busca); o timer é limpo a cada mudança e ao desmontar. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);
  return debounced;
}
