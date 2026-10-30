import { useEffect, useState } from 'react';
import { getQuote, QuoteNotFoundError } from '@/services/quotesService';
import type { QuoteDetail } from '@/types/quotes';

type QuoteState =
  | { status: 'idle'; data: null }
  | { status: 'loading'; data: QuoteDetail | null }
  | { status: 'success'; data: QuoteDetail }
  | { status: 'not-found'; data: null }
  | { status: 'error'; data: QuoteDetail | null; message: string };

/** `id` nulo não busca nada (estado `idle`), para telas em que o orçamento é opcional. */
export function useQuote(id: string | null, reloadKey = 0): QuoteState {
  const [state, setState] = useState<QuoteState>(
    id === null ? { status: 'idle', data: null } : { status: 'loading', data: null },
  );

  useEffect(() => {
    if (id === null) {
      setState({ status: 'idle', data: null });
      return;
    }
    const controller = new AbortController();
    setState((prev) => ({ status: 'loading', data: prev.data?.id === id ? prev.data : null }));

    getQuote(id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof QuoteNotFoundError) {
          setState({ status: 'not-found', data: null });
          return;
        }
        console.error('Falha ao carregar o orçamento', error);
        setState((prev) => ({ status: 'error', data: prev.data, message: 'Não foi possível carregar o orçamento.' }));
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  return state;
}
