import type { Customer, Seller } from '@/types/people';
import type { Quote } from '@/types/quotes';
import { fromMock } from './mockLatency';
import { CUSTOMERS_MOCK, SELLERS_MOCK } from './mocks/peopleMock';
import { quotesSnapshot } from './quotesService';

/**
 * Cópias em memória dos mocks: cadastros, edições e exclusões valem
 * até a página ser recarregada. Na troca pelo backend, cada função
 * abaixo vira uma chamada HTTP com a mesma assinatura. As contagens de
 * orçamentos (`quotes`, `amount`, `lastQuoteAt`) são sempre recalculadas
 * na listagem, como a API fará.
 */
let sellers = [...SELLERS_MOCK];
let customers = [...CUSTOMERS_MOCK];

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
}

export function newId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}`;
}

/** Orçamentos e valor do vendedor no mês corrente, calculados sobre os orçamentos. */
function withMonthStats(seller: Seller, quotes: readonly Quote[]): Seller {
  const now = new Date();
  const own = quotes.filter((q) => {
    const created = new Date(q.createdAt);
    return q.seller === seller.name && created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  });
  return { ...seller, quotes: own.length, amount: own.reduce((total, q) => total + q.amount, 0) };
}

/** Total de orçamentos do cliente e data do último, calculados sobre os orçamentos. */
function withQuoteStats(customer: Customer, quotes: readonly Quote[]): Customer {
  const own = quotes.filter((q) => q.customer === customer.name);
  const last = own.reduce<string | null>((latest, q) => (!latest || q.createdAt > latest ? q.createdAt : latest), null);
  return { ...customer, quotes: own.length, lastQuoteAt: last };
}

export function listSellers(signal?: AbortSignal): Promise<Seller[]> {
  return fromMock(() => sellers.map((s) => withMonthStats(s, quotesSnapshot())), signal);
}

export function saveSeller(seller: Seller): Promise<Seller> {
  return fromMock(() => {
    sellers = upsert(sellers, seller);
    return seller;
  });
}

export function deleteSeller(id: string): Promise<void> {
  return fromMock(() => {
    sellers = sellers.filter((s) => s.id !== id);
  });
}

export function listCustomers(signal?: AbortSignal): Promise<Customer[]> {
  return fromMock(() => customers.map((c) => withQuoteStats(c, quotesSnapshot())), signal);
}

export function saveCustomer(customer: Customer): Promise<Customer> {
  return fromMock(() => {
    customers = upsert(customers, customer);
    return customer;
  });
}

export function deleteCustomer(id: string): Promise<void> {
  return fromMock(() => {
    customers = customers.filter((c) => c.id !== id);
  });
}
