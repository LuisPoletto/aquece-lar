import type { Customer, Seller } from '@/types/people';
import { fromMock } from './mockLatency';
import { CUSTOMERS_MOCK, SELLERS_MOCK } from './mocks/peopleMock';

/**
 * Cópias em memória dos mocks: cadastros, edições e exclusões valem
 * até a página ser recarregada. Na troca pelo backend, cada função
 * abaixo vira uma chamada HTTP com a mesma assinatura.
 */
let sellers = [...SELLERS_MOCK];
let customers = [...CUSTOMERS_MOCK];

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
}

export function newId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}`;
}

export function listSellers(signal?: AbortSignal): Promise<Seller[]> {
  return fromMock(() => sellers, signal);
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
  return fromMock(() => customers, signal);
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
