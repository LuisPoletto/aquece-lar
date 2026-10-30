import type { Quote, QuoteDetail, QuoteEvent, QuoteItem } from '@/types/quotes';
import { toISODate } from '@/lib/format';
import { CUSTOMERS_MOCK, SELLERS_MOCK } from './peopleMock';

/** Catálogo fictício: [código, descrição, peso relativo no valor]. */
const PRODUCTS: Array<[code: string, description: string, weight: number]> = [
  ['AQG-20D', 'Aquecedor a gás digital 20 L/min', 9],
  ['AQG-33P', 'Aquecedor a gás de passagem 33 L/min', 12],
  ['BLR-200', 'Boiler de acumulação 200 L', 10],
  ['LRL-900', 'Lareira a lenha 90 cm com vidro', 14],
  ['PIS-AQ3', 'Aquecedor de piscina 3 kW', 11],
  ['CHM-150', 'Chaminé inox 150 mm (kit 3 m)', 4],
  ['KIT-INS', 'Kit de instalação hidráulica', 2],
  ['VLV-GAS', 'Válvula de segurança para gás', 1],
  ['SRV-INS', 'Serviço de instalação e teste', 3],
];

const VALID_DAYS = 15;
const PAYMENT_TERMS = ['À vista com 5% de desconto', '3x sem juros no cartão', 'Entrada + 2x no boleto'];

function hoursAfter(iso: string, hours: number): string {
  return new Date(Date.parse(iso) + hours * 3_600_000).toISOString();
}

/** Itens determinísticos cuja soma fecha exatamente o valor do orçamento. */
function buildItems(quote: Quote): QuoteItem[] {
  const seed = Number(quote.id) || 0;
  const count = 2 + (seed % 3);
  const picked = Array.from({ length: count }, (_, i) => PRODUCTS[(seed * 7 + i * 4) % PRODUCTS.length]!);
  const weights = picked.map(([, , w], i) => w * (i === 0 ? 2 : 1));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  let used = 0;
  return picked.map(([code, description], i) => {
    const last = i === picked.length - 1;
    const quantity = last ? 1 : 1 + ((seed + i) % 2);
    const lineTotal = last
      ? Math.round((quote.amount - used) * 100) / 100
      : Math.round(((weights[i]! / weightSum) * quote.amount) / quantity) * quantity;
    used += lineTotal;
    return { code, description, quantity, unitPrice: lineTotal / quantity };
  });
}

/** Histórico coerente com o status original do orçamento. */
export function buildHistory(quote: Quote): QuoteEvent[] {
  const events: QuoteEvent[] = [{ status: 'Pendente', at: quote.createdAt, note: 'Orçamento criado' }];
  if (quote.status === 'Enviado' || quote.status === 'Aprovado') {
    events.push({ status: 'Enviado', at: hoursAfter(quote.createdAt, 2), note: 'Enviado ao cliente por WhatsApp' });
  }
  if (quote.status === 'Aprovado') {
    events.push({ status: 'Aprovado', at: hoursAfter(quote.createdAt, 30), note: 'Aprovado pelo cliente' });
  }
  if (quote.status === 'Cancelado') {
    events.push({ status: 'Cancelado', at: hoursAfter(quote.createdAt, 26), note: 'Cliente desistiu da compra' });
  }
  return events;
}

export function buildQuoteDetail(quote: Quote, history: QuoteEvent[]): QuoteDetail {
  const customer = CUSTOMERS_MOCK.find((c) => c.name === quote.customer);
  const seller = SELLERS_MOCK.find((s) => s.name === quote.seller);
  const seed = Number(quote.id) || 0;
  const validUntil = new Date(Date.parse(quote.createdAt) + VALID_DAYS * 86_400_000);

  return {
    ...quote,
    customerInfo: {
      name: quote.customer,
      detail: customer?.document ?? '',
      phone: customer?.phone ?? '',
      city: customer?.city,
    },
    sellerInfo: {
      name: quote.seller,
      detail: seller?.email ?? '',
      phone: seller?.phone ?? '',
    },
    items: buildItems(quote),
    validUntil: toISODate(validUntil),
    paymentTerms: PAYMENT_TERMS[seed % PAYMENT_TERMS.length]!,
    notes: 'Prazo de entrega de 7 a 10 dias úteis após a aprovação. Instalação agendada conforme disponibilidade.',
    history,
  };
}
