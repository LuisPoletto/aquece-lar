import { Icon } from '@/components/Icon';
import type { Kpi } from '@/types/dashboard';
import styles from './KpiCard.module.css';

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.head}>
        <span className={styles.label}>{kpi.label}</span>
        <span className={styles.icon}>
          <Icon name={kpi.icon} size={18} />
        </span>
      </div>
      <span className={styles.value}>{kpi.value}</span>
      <div className={styles.foot}>
        <span className={styles.delta}>
          <Icon name="trend" size={12} />
          {kpi.delta}
        </span>
        <span className={styles.note}>{kpi.note}</span>
      </div>
    </div>
  );
}
