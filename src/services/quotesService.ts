import type { Period, QuoteStatus } from '@/types/dashboard';
import type { Quote, QuoteDetail, QuoteEvent } from '@/types/quotes';
import { toISODate } from '@/lib/format';
import { validatePeriod } from './dashboardService';
import { fromMock } from './mockLatency';
import { buildHistory, buildQuoteDetail } from './mocks/quoteDetailMock';
import { QUOTES_MOCK } from './mocks/quotesMock';

/**
 * Cópia em memória: mudanças de status valem até a página ser recarregada.
 * O histórico parte do status original do mock e recebe os novos eventos.
 */
let quotes = [...QUOTES_MOCK];
const history = new Map<string, QuoteEvent[]>(QUOTES_MOCK.map((q) => [q.id, buildHistory(q)]));

export class QuoteNotFoundError extends Error {
  constructor(id: string) {
    super(`Orçamento ${id} não encontrado.`);
    this.name = 'QuoteNotFoundError';
  }
}

/** Orçamentos criados no período, do mais recente para o mais antigo. */
export function listQuotes(period: Period, signal?: AbortSignal): Promise<Quote[]> {
  return fromMock(() => {
    validatePeriod(period);
    return quotes
      .filter((q) => {
        const day = toISODate(new Date(q.createdAt));
        return day >= period.from && day <= period.to;
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, signal);
}

export function getQuote(id: string, signal?: AbortSignal): Promise<QuoteDetail> {
  return fromMock(() => {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) throw new QuoteNotFoundError(id);
    return buildQuoteDetail(quote, history.get(id) ?? []);
  }, signal);
}

const STATUS_NOTES: Record<QuoteStatus, string> = {
  Pendente: 'Voltou para pendente',
  Enviado: 'Enviado ao cliente',
  Aprovado: 'Aprovado pelo cliente',
  Cancelado: 'Orçamento cancelado',
};

export function updateQuoteStatus(id: string, status: QuoteStatus): Promise<void> {
  return fromMock(() => {
    if (!quotes.some((q) => q.id === id)) throw new QuoteNotFoundError(id);
    quotes = quotes.map((q) => (q.id === id ? { ...q, status } : q));
    const events = history.get(id) ?? [];
    history.set(id, [...events, { status, at: new Date().toISOString(), note: STATUS_NOTES[status] }]);
  });
}
