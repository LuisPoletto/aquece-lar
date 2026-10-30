import { useEffect, useState } from 'react';
import { getDashboard, InvalidPeriodError } from '@/services/dashboardService';
import type { DashboardData, Period } from '@/types/dashboard';

type DashboardState =
  | { status: 'loading'; data: DashboardData | null }
  | { status: 'success'; data: DashboardData }
  | { status: 'error'; data: DashboardData | null; message: string };

export function useDashboard(period: Period, reloadKey = 0): DashboardState {
  const [state, setState] = useState<DashboardState>({ status: 'loading', data: null });
  const from = period.from;
  const to = period.to;

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ status: 'loading', data: prev.data }));

    getDashboard({ from, to }, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof InvalidPeriodError) {
          setState((prev) => ({ status: 'error', data: prev.data, message: error.message }));
          return;
        }
        console.error('Falha ao carregar o dashboard', error);
        setState((prev) => ({
          status: 'error',
          data: prev.data,
          message: 'Não foi possível carregar os dados do dashboard.',
        }));
      });

    return () => controller.abort();
  }, [from, to, reloadKey]);

  return state;
}
