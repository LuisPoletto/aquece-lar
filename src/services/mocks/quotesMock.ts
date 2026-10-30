import type { QuoteStatus } from '@/types/dashboard';
import type { Quote } from '@/types/quotes';
import { RECENT_QUOTES } from './dashboardMock';
import { CUSTOMERS_MOCK, SELLERS_MOCK } from './peopleMock';

const OLDER_COUNT = 51;
const STATUS_CYCLE: QuoteStatus[] = ['Aprovado', 'Enviado', 'Aprovado', 'Cancelado', 'Pendente', 'Aprovado', 'Enviado'];

/**
 * Os 10 mais recentes são os mesmos do dashboard; os anteriores (#1121 a
 * #1171) são gerados de forma determinística, um a cada ~1,1 dia para trás.
 */
function buildOlder(): Quote[] {
  const customers = CUSTOMERS_MOCK.map((c) => c.name);
  const sellers = SELLERS_MOCK.filter((s) => s.status === 'Ativo').map((s) => s.name);
  const start = new Date('2026-10-27T15:00:00-03:00').getTime();

  return Array.from({ length: OLDER_COUNT }, (_, i) => {
    const number = 1171 - i;
    const createdAt = new Date(start - i * 26.5 * 3_600_000 - ((i * 37) % 300) * 60_000);
    return {
      id: String(number),
      number: `#${number}`,
      customer: customers[(i * 5) % customers.length] ?? '',
      seller: sellers[(i * 5 + 1) % sellers.length] ?? '',
      amount: 4200 + ((i * 7919) % 380) * 100,
      status: STATUS_CYCLE[i % STATUS_CYCLE.length] ?? 'Enviado',
      createdAt: createdAt.toISOString(),
    };
  });
}

export const QUOTES_MOCK: Quote[] = [...RECENT_QUOTES, ...buildOlder()];
