import type { DailyPoint, DashboardData, Kpi, Period, RecentQuote, SellerRank } from '@/types/dashboard';
import { formatBRLRounded, parseISODate, toISODate } from '@/lib/format';

const DAILY_QUANTITY = [6, 7, 2, 0, 8, 6, 7, 9, 5, 2, 1, 7, 8, 10, 6, 7, 3, 0, 9, 8, 11, 7, 6, 2, 1, 8, 10, 9, 12, 4];

const SELLERS: Array<[id: string, name: string, quotes: number, weight: number]> = [
  ['v1', 'Carlos Menezes', 42, 1.1],
  ['v2', 'Patrícia Lima', 38, 0.95],
  ['v3', 'Rafael Bortolini', 31, 1.05],
  ['v4', 'Aline Costa', 27, 0.9],
  ['v5', 'Diego Ferraz', 24, 1.0],
  ['v6', 'Tatiane Rocha', 19, 0.98],
];

export const RECENT_QUOTES: RecentQuote[] = [
  { id: '1181', number: '#1181', customer: 'Restaurante Brasa Viva', seller: 'Carlos Menezes', amount: 18940, status: 'Pendente', createdAt: '2026-10-30T09:42:00-03:00' },
  { id: '1180', number: '#1180', customer: 'Marcos Andrade', seller: 'Patrícia Lima', amount: 7380, status: 'Enviado', createdAt: '2026-10-29T18:15:00-03:00' },
  { id: '1179', number: '#1179', customer: 'Condomínio Vale Verde', seller: 'Rafael Bortolini', amount: 32410, status: 'Aprovado', createdAt: '2026-10-29T16:03:00-03:00' },
  { id: '1178', number: '#1178', customer: 'Juliana Teixeira', seller: 'Aline Costa', amount: 5920, status: 'Enviado', createdAt: '2026-10-29T11:27:00-03:00' },
  { id: '1177', number: '#1177', customer: 'Pousada Recanto da Serra', seller: 'Carlos Menezes', amount: 24750, status: 'Pendente', createdAt: '2026-10-29T10:08:00-03:00' },
  { id: '1176', number: '#1176', customer: 'Ricardo Moretto', seller: 'Diego Ferraz', amount: 9860, status: 'Aprovado', createdAt: '2026-10-28T17:51:00-03:00' },
  { id: '1175', number: '#1175', customer: 'Espaço Gourmet Bento', seller: 'Patrícia Lima', amount: 15230, status: 'Cancelado', createdAt: '2026-10-28T14:36:00-03:00' },
  { id: '1174', number: '#1174', customer: 'Ana Paula Ribeiro', seller: 'Tatiane Rocha', amount: 6480, status: 'Enviado', createdAt: '2026-10-28T09:12:00-03:00' },
  { id: '1173', number: '#1173', customer: 'Clube Recreativo Serrano', seller: 'Rafael Bortolini', amount: 41200, status: 'Pendente', createdAt: '2026-10-27T19:40:00-03:00' },
  { id: '1172', number: '#1172', customer: 'Felipe Zanella', seller: 'Aline Costa', amount: 8150, status: 'Aprovado', createdAt: '2026-10-27T15:22:00-03:00' },
];

function buildDaily(period: Period): DailyPoint[] {
  const today = toISODate(new Date());
  const points: DailyPoint[] = [];
  const cursor = parseISODate(period.from);
  const end = parseISODate(period.to);

  while (cursor <= end) {
    const index = (cursor.getDate() - 1) % DAILY_QUANTITY.length;
    const quantity = DAILY_QUANTITY[index] ?? 0;
    const date = toISODate(cursor);
    points.push({
      date,
      quantity,
      amount: quantity * (7200 + ((index * 37) % 30) * 110),
      partial: date === today,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}

export function buildDashboardMock(period: Period): DashboardData {
  const daily = buildDaily(period);
  const totalQuantity = daily.reduce((sum, p) => sum + p.quantity, 0);
  const totalAmount = daily.reduce((sum, p) => sum + p.amount, 0);

  const weightSum = SELLERS.reduce((sum, [, , quotes, weight]) => sum + quotes * weight, 0);
  const ranking: SellerRank[] = SELLERS.map(([id, name, quotes, weight]) => ({
    id,
    name,
    quotes,
    amount: weightSum > 0 ? ((quotes * weight) / weightSum) * totalAmount : 0,
  }));

  const kpis: Kpi[] = [
    { id: 'orcamentos', label: 'Total de orçamentos', icon: 'file', value: String(totalQuantity), delta: '+18%', note: 'vs. período anterior' },
    { id: 'valor', label: 'Valor total', icon: 'dollar', value: formatBRLRounded(totalAmount), delta: '+11%', note: 'vs. período anterior' },
    { id: 'clientes', label: 'Clientes', icon: 'users', value: '96', delta: '+14', note: 'novos no período' },
    { id: 'vendedores', label: 'Vendedores ativos', icon: 'user', value: '6', delta: '6 de 8', note: 'cadastrados' },
  ];

  return { kpis, daily, ranking, recentQuotes: RECENT_QUOTES };
}
