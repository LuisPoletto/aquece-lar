import type { DashboardData, Period } from '@/types/dashboard';
import { parseISODate } from '@/lib/format';
import { buildDashboardMock } from './mocks/dashboardMock';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PERIOD_DAYS = 366;
const MOCK_LATENCY_MS = 250;

export class InvalidPeriodError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPeriodError';
  }
}

export function validatePeriod(period: Period): void {
  if (!ISO_DATE.test(period.from) || !ISO_DATE.test(period.to)) {
    throw new InvalidPeriodError('Informe datas válidas.');
  }
  const from = parseISODate(period.from);
  const to = parseISODate(period.to);
  if (from > to) {
    throw new InvalidPeriodError('A data inicial deve ser anterior ou igual à data final.');
  }
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  if (days > MAX_PERIOD_DAYS) {
    throw new InvalidPeriodError(`O período não pode ultrapassar ${MAX_PERIOD_DAYS} dias.`);
  }
}

/**
 * Retorna os dados do dashboard para o período.
 * Enquanto não houver backend, os dados vêm de mocks locais; a assinatura
 * já é assíncrona e cancelável para a troca por uma chamada HTTP real.
 */
export function getDashboard(period: Period, signal?: AbortSignal): Promise<DashboardData> {
  return new Promise((resolve, reject) => {
    validatePeriod(period);
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve(buildDashboardMock(period));
    }, MOCK_LATENCY_MS);

    function onAbort() {
      window.clearTimeout(timer);
      reject(signal?.reason);
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
