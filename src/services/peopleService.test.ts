import { describe, expect, it } from 'vitest';
import { listCustomers, listSellers } from './peopleService';
import { createQuote, quotesSnapshot } from './quotesService';

async function newQuote(customer: string, seller: string, amount: number) {
  return createQuote({
    customerInfo: { name: customer, detail: '', phone: '' },
    sellerInfo: { name: seller, detail: '', phone: '' },
    items: [{ code: 'X', description: 'Item', quantity: 1, unitPrice: amount }],
    validUntil: '2099-01-01',
    paymentTerms: '3x sem juros no cartão',
    discount: null,
    notes: '',
  });
}

describe('contagens derivadas dos orçamentos', () => {
  it('cada cliente mostra quantos orçamentos tem e a data do último', async () => {
    const customers = await listCustomers();
    for (const customer of customers) {
      const own = quotesSnapshot().filter((q) => q.customer === customer.name);
      expect(customer.quotes, customer.name).toBe(own.length);
    }
    expect(customers.every((c) => c.quotes > 0 && c.lastQuoteAt)).toBe(true);
  });

  it('orçamento novo soma no cliente e vira o último', async () => {
    const before = (await listCustomers()).find((c) => c.name === 'Marcos Andrade');
    const quote = await newQuote('Marcos Andrade', 'Patrícia Lima', 1000);
    const after = (await listCustomers()).find((c) => c.name === 'Marcos Andrade');

    expect(after?.quotes).toBe((before?.quotes ?? 0) + 1);
    expect(after?.lastQuoteAt).toBe(quote.createdAt);
  });

  it('orçamento novo soma no mês corrente do vendedor', async () => {
    const before = (await listSellers()).find((s) => s.name === 'Diego Ferraz');
    await newQuote('Ricardo Moretto', 'Diego Ferraz', 2500);
    const after = (await listSellers()).find((s) => s.name === 'Diego Ferraz');

    expect(after?.quotes).toBe((before?.quotes ?? 0) + 1);
    expect(after?.amount).toBe((before?.amount ?? 0) + 2500);
  });

  it('vendedor inativo, sem orçamentos no mês, fica zerado', async () => {
    const inactive = (await listSellers()).filter((s) => s.status === 'Inativo');
    expect(inactive.length).toBeGreaterThan(0);
    expect(inactive.every((s) => s.quotes === 0 && s.amount === 0)).toBe(true);
  });
});
