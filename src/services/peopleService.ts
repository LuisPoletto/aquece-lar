import type { Customer, Seller } from '@/types/people';
import { CUSTOMERS_MOCK, SELLERS_MOCK } from './mocks/peopleMock';

const MOCK_LATENCY_MS = 250;

/**
 * Cópias em memória dos mocks: cadastros, edições e exclusões valem
 * até a página ser recarregada. Na troca pelo backend, cada função
 * abaixo vira uma chamada HTTP com a mesma assinatura.
 */
let sellers = [...SELLERS_MOCK];
let customers = [...CUSTOMERS_MOCK];

/** Resolve o valor após a latência simulada, respeitando o cancelamento. */
function fromMock<T>(produce: () => T, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve(produce());
    }, MOCK_LATENCY_MS);

    function onAbort() {
      window.clearTimeout(timer);
      reject(signal?.reason);
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

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
