import { describe, expect, it } from 'vitest';
import { formatBRLRounded, toISODate } from '@/lib/format';
import type { Period } from '@/types/dashboard';
import { getDashboard, InvalidPeriodError } from './dashboardService';
import { createQuote, listQuotes } from './quotesService';

function lastDays(days: number): Period {
  const now = new Date();
  return {
    from: toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1))),
    to: toISODate(now),
  };
}

function kpi(data: Awaited<ReturnType<typeof getDashboard>>, id: string) {
  return data.kpis.find((k) => k.id === id);
}

describe('getDashboard', () => {
  it('bate com a lista de orçamentos do mesmo período', async () => {
    const period = lastDays(30);
    const [data, quotes] = await Promise.all([getDashboard(period), listQuotes(period)]);
    const total = quotes.reduce((sum, q) => sum + q.amount, 0);

    expect(quotes.length).toBeGreaterThan(30); // o mês nunca fica vazio
    expect(kpi(data, 'orcamentos')?.value).toBe(String(quotes.length));
    expect(kpi(data, 'valor')?.value).toBe(formatBRLRounded(total));
    expect(kpi(data, 'clientes')?.value).toBe(String(new Set(quotes.map((q) => q.customer)).size));

    expect(data.daily).toHaveLength(30);
    expect(data.daily.reduce((sum, d) => sum + d.quantity, 0)).toBe(quotes.length);
    expect(data.daily.at(-1)?.partial).toBe(true);
    expect(data.ranking.reduce((sum, r) => sum + r.quotes, 0)).toBe(quotes.length);
    expect(data.recentQuotes.map((q) => q.id)).toEqual(quotes.slice(0, 10).map((q) => q.id));
  });

  it('um orçamento novo entra no total, no dia de hoje, no ranking e nos recentes', async () => {
    const period = lastDays(7);
    const before = await getDashboard(period);

    const quote = await createQuote({
      customerInfo: { name: 'Restaurante Brasa Viva', detail: '', phone: '' },
      sellerInfo: { name: 'Carlos Menezes', detail: '', phone: '' },
      items: [{ code: 'BLR-200', description: 'Boiler de acumulação 200 L', quantity: 1, unitPrice: 3790 }],
      validUntil: '2099-01-01',
      paymentTerms: '3x sem juros no cartão',
      discount: null,
      notes: '',
    });
    const after = await getDashboard(period);

    expect(Number(kpi(after, 'orcamentos')?.value)).toBe(Number(kpi(before, 'orcamentos')?.value) + 1);
    expect(after.daily.at(-1)?.quantity).toBe((before.daily.at(-1)?.quantity ?? 0) + 1);
    expect(after.daily.at(-1)?.amount).toBe((before.daily.at(-1)?.amount ?? 0) + 3790);
    const carlos = (data: typeof after) => data.ranking.find((r) => r.name === 'Carlos Menezes');
    expect(carlos(after)?.quotes).toBe((carlos(before)?.quotes ?? 0) + 1);
    expect(after.recentQuotes[0]?.id).toBe(quote.id);
  });

  it('conta os vendedores ativos do cadastro', async () => {
    const data = await getDashboard(lastDays(30));
    expect(kpi(data, 'vendedores')).toMatchObject({ value: '6', delta: '6 de 8' });
  });

  it('recusa período inválido', async () => {
    await expect(getDashboard({ from: '2026-10-10', to: '2026-10-01' })).rejects.toBeInstanceOf(InvalidPeriodError);
  });
});
