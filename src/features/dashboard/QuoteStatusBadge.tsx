import type { QuoteStatus } from '@/types/dashboard';
import styles from './QuoteStatusBadge.module.css';

const STATUS_CLASS: Record<QuoteStatus, string> = {
  Pendente: styles.warn ?? '',
  Enviado: styles.info ?? '',
  Aprovado: styles.ok ?? '',
  Cancelado: styles.err ?? '',
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>
      <span className={styles.dot} />
      {status}
    </span>
  );
}
