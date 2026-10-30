import { useEffect, useState } from 'react';

type ListState<T> =
  | { status: 'loading'; data: T[] | null }
  | { status: 'success'; data: T[] }
  | { status: 'error'; data: T[] | null; message: string };

/** Carrega uma listagem cancelável; `reloadKey` força nova busca. */
export function useList<T>(
  load: (signal: AbortSignal) => Promise<T[]>,
  errorMessage: string,
  reloadKey = 0,
): ListState<T> {
  const [state, setState] = useState<ListState<T>>({ status: 'loading', data: null });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ status: 'loading', data: prev.data }));

    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(errorMessage, error);
        setState((prev) => ({ status: 'error', data: prev.data, message: errorMessage }));
      });

    return () => controller.abort();
  }, [load, errorMessage, reloadKey]);

  return state;
}

/** Normaliza para busca sem acento e sem diferenciar maiúsculas. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function matches(query: string, ...fields: string[]): boolean {
  const q = normalize(query.trim());
  return q === '' || fields.some((field) => normalize(field).includes(q));
}
