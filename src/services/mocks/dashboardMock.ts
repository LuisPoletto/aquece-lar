import type { DailyPoint, DashboardData, Kpi, Period, SellerRank } from '@/types/dashboard';
import type { Seller } from '@/types/people';
import type { Quote } from '@/types/quotes';
import { formatBRLRounded, parseISODate, toISODate } from '@/lib/format';
import { inPeriod, previousPeriod } from '../period';

const RECENT_COUNT = 10;

function percentDelta(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? '0%' : '—';
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

function countDelta(current: number, previous: number): string {
  const diff = current - previous;
  return `${diff > 0 ? '+' : ''}${diff}`;
}

function sum(quotes: readonly Quote[]): number {
  return quotes.reduce((total, q) => total + q.amount, 0);
}

function buildDaily(period: Period, quotes: readonly Quote[]): DailyPoint[] {
  const today = toISODate(new Date());
  const byDay = new Map<string, Quote[]>();
  for (const quote of quotes) {
    const day = toISODate(new Date(quote.createdAt));
    byDay.set(day, [...(byDay.get(day) ?? []), quote]);
  }

  const points: DailyPoint[] = [];
  const cursor = parseISODate(period.from);
  const end = parseISODate(period.to);
  while (cursor <= end) {
    const date = toISODate(cursor);
    const dayQuotes = byDay.get(date) ?? [];
    points.push({ date, quantity: dayQuotes.length, amount: sum(dayQuotes), partial: date === today });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}

/**
 * Simula o que a API vai calcular: tudo sai dos mesmos orçamentos da
 * listagem, então um orçamento novo aparece no dashboard na hora.
 */
export function buildDashboard(period: Period, allQuotes: readonly Quote[], sellers: Seller[]): DashboardData {
  const current = allQuotes.filter((q) => inPeriod(q.createdAt, period));
  const previous = allQuotes.filter((q) => inPeriod(q.createdAt, previousPeriod(period)));
  const customers = new Set(current.map((q) => q.customer)).size;
  const previousCustomers = new Set(previous.map((q) => q.customer)).size;
  const active = sellers.filter((s) => s.status === 'Ativo');

  const kpis: Kpi[] = [
    {
      id: 'orcamentos',
      label: 'Total de orçamentos',
      icon: 'file',
      value: String(current.length),
      delta: percentDelta(current.length, previous.length),
      note: 'vs. período anterior',
    },
    {
      id: 'valor',
      label: 'Valor total',
      icon: 'dollar',
      value: formatBRLRounded(sum(current)),
      delta: percentDelta(sum(current), sum(previous)),
      note: 'vs. período anterior',
    },
    {
      id: 'clientes',
      label: 'Clientes atendidos',
      icon: 'users',
      value: String(customers),
      delta: countDelta(customers, previousCustomers),
      note: 'vs. período anterior',
    },
    {
      id: 'vendedores',
      label: 'Vendedores ativos',
      icon: 'user',
      value: String(active.length),
      delta: `${active.length} de ${sellers.length}`,
      note: 'cadastrados',
    },
  ];

  const ranking: SellerRank[] = active.map((seller) => {
    const own = current.filter((q) => q.seller === seller.name);
    return { id: seller.id, name: seller.name, quotes: own.length, amount: sum(own) };
  });

  const recentQuotes = [...current]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, RECENT_COUNT);

  return { kpis, daily: buildDaily(period, current), ranking, recentQuotes };
}
