import { Icon } from '@/components/Icon';
import type { Period } from '@/types/dashboard';
import styles from './PeriodFilter.module.css';

interface PeriodFilterProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className={styles.filter} role="group" aria-label="Período">
      <Icon name="calendar" size={16} />
      <label className={styles.field}>
        De
        <input
          type="date"
          value={value.from}
          max={value.to}
          required
          className={styles.input}
          onChange={(event) => event.target.value && onChange({ ...value, from: event.target.value })}
        />
      </label>
      <span className={styles.sep} aria-hidden="true">
        |
      </span>
      <label className={styles.field}>
        Até
        <input
          type="date"
          value={value.to}
          min={value.from}
          required
          className={styles.input}
          onChange={(event) => event.target.value && onChange({ ...value, to: event.target.value })}
        />
      </label>
    </div>
  );
}
