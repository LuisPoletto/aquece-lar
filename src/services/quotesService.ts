import type { Period, QuoteStatus } from '@/types/dashboard';
import type { CatalogProduct, Quote, QuoteDetail, QuoteDraft, QuoteEvent } from '@/types/quotes';
import { toISODate } from '@/lib/format';
import { validatePeriod } from './dashboardService';
import { fromMock } from './mockLatency';
import { CATALOG_MOCK } from './mocks/catalogMock';
import { buildHistory, buildQuoteDetail } from './mocks/quoteDetailMock';
import { QUOTES_MOCK } from './mocks/quotesMock';

/**
 * Cópia em memória: mudanças de status e orçamentos novos valem até a página
 * ser recarregada. O histórico parte do status original do mock e recebe os
 * novos eventos; os orçamentos criados guardam os dados do formulário.
 */
let quotes = [...QUOTES_MOCK];
const history = new Map<string, QuoteEvent[]>(QUOTES_MOCK.map((q) => [q.id, buildHistory(q)]));
const drafts = new Map<string, QuoteDraft>();

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
    const events = history.get(id) ?? [];
    const draft = drafts.get(id);
    return draft ? { ...quote, ...draft, history: events } : buildQuoteDetail(quote, events);
  }, signal);
}

export function listCatalog(signal?: AbortSignal): Promise<CatalogProduct[]> {
  return fromMock(() => CATALOG_MOCK, signal);
}

/** Cria o orçamento como pendente, com o próximo número da sequência. */
export function createQuote(draft: QuoteDraft): Promise<Quote> {
  return fromMock(() => {
    if (draft.items.length === 0) throw new Error('O orçamento precisa de ao menos um item.');
    const next = Math.max(0, ...quotes.map((q) => Number(q.id) || 0)) + 1;
    const total = draft.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const createdAt = new Date().toISOString();
    const quote: Quote = {
      id: String(next),
      number: `#${next}`,
      customer: draft.customerInfo.name,
      seller: draft.sellerInfo.name,
      amount: Math.round(total * 100) / 100,
      status: 'Pendente',
      createdAt,
    };
    quotes = [quote, ...quotes];
    drafts.set(quote.id, draft);
    history.set(quote.id, [{ status: 'Pendente', at: createdAt, note: 'Orçamento criado' }]);
    return quote;
  });
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
