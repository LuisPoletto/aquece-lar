import { useEffect, useState } from 'react';
import { getQuote, QuoteNotFoundError } from '@/services/quotesService';
import type { QuoteDetail } from '@/types/quotes';

type QuoteState =
  | { status: 'loading'; data: QuoteDetail | null }
  | { status: 'success'; data: QuoteDetail }
  | { status: 'not-found'; data: null }
  | { status: 'error'; data: QuoteDetail | null; message: string };

export function useQuote(id: string, reloadKey = 0): QuoteState {
  const [state, setState] = useState<QuoteState>({ status: 'loading', data: null });

  useEffect(() => {
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
