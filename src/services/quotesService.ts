import type { Period } from '@/types/dashboard';
import type { Quote } from '@/types/quotes';
import { toISODate } from '@/lib/format';
import { validatePeriod } from './dashboardService';
import { fromMock } from './mockLatency';
import { QUOTES_MOCK } from './mocks/quotesMock';

/** Orçamentos criados no período, do mais recente para o mais antigo. */
export function listQuotes(period: Period, signal?: AbortSignal): Promise<Quote[]> {
  return fromMock(() => {
    validatePeriod(period);
    return QUOTES_MOCK.filter((q) => {
      const day = toISODate(new Date(q.createdAt));
      return day >= period.from && day <= period.to;
    }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, signal);
}
