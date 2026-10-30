import type { QuoteStatus, RecentQuote } from './dashboard';

/** Orçamento na listagem; mesmo formato da tabela do dashboard. */
export type Quote = RecentQuote;

export interface QuoteItem {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteEvent {
  status: QuoteStatus;
  /** Data/hora ISO. */
  at: string;
  note: string;
}

export interface QuoteContact {
  name: string;
  /** Linha secundária: documento do cliente ou e-mail do vendedor. */
  detail: string;
  phone: string;
  city?: string;
}

export interface QuoteDetail extends Quote {
  customerInfo: QuoteContact;
  sellerInfo: QuoteContact;
  items: QuoteItem[];
  /** Data ISO (AAAA-MM-DD) até quando o orçamento vale. */
  validUntil: string;
  paymentTerms: string;
  notes: string;
  history: QuoteEvent[];
}

/** O que o formulário envia; número, data, status, total e histórico vêm do serviço. */
export type QuoteDraft = Pick<
  QuoteDetail,
  'customerInfo' | 'sellerInfo' | 'items' | 'validUntil' | 'paymentTerms' | 'notes'
>;

export interface CatalogProduct {
  code: string;
  description: string;
  /** Preço de tabela; pode ser ajustado em cada orçamento. */
  unitPrice: number;
}
