import type { QuoteDiscount, QuoteItem } from '@/types/quotes';

export interface QuoteTotals {
  subtotal: number;
  /** Valor descontado em reais, já limitado ao subtotal. */
  discount: number;
  total: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Única regra de cálculo do valor do orçamento: lista, detalhe e formulário usam esta. */
export function quoteTotals(items: Array<Pick<QuoteItem, 'quantity' | 'unitPrice'>>, discount: QuoteDiscount | null): QuoteTotals {
  const subtotal = round2(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const raw = !discount ? 0 : discount.type === 'percent' ? (subtotal * discount.value) / 100 : discount.value;
  const off = round2(Math.min(Math.max(raw, 0), subtotal));
  return { subtotal, discount: off, total: round2(subtotal - off) };
}
