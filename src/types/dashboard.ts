import type { IconName } from '@/components/Icon';

export type QuoteStatus = 'Pendente' | 'Enviado' | 'Aprovado' | 'Cancelado';

export interface Period {
  /** Data inicial no formato ISO (AAAA-MM-DD). */
  from: string;
  /** Data final no formato ISO (AAAA-MM-DD). */
  to: string;
}

export interface Kpi {
  id: string;
  label: string;
  icon: IconName;
  value: string;
  delta: string;
  note: string;
}

export interface DailyPoint {
  /** Data ISO (AAAA-MM-DD). */
  date: string;
  quantity: number;
  amount: number;
  /** Dia ainda em andamento (dados parciais). */
  partial: boolean;
}

export interface SellerRank {
  id: string;
  name: string;
  quotes: number;
  amount: number;
}

export interface RecentQuote {
  id: string;
  number: string;
  customer: string;
  seller: string;
  amount: number;
  status: QuoteStatus;
  /** Data/hora ISO. */
  createdAt: string;
}

export interface DashboardData {
  kpis: Kpi[];
  daily: DailyPoint[];
  ranking: SellerRank[];
  recentQuotes: RecentQuote[];
}
