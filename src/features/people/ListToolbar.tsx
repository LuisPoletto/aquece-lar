import { Icon } from '@/components/Icon';
import styles from './ListToolbar.module.css';

interface ListToolbarProps<F extends string> {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  filters: ReadonlyArray<{ value: F; label: string }>;
  filter: F;
  onFilterChange: (value: F) => void;
  filterLabel: string;
  count: number;
  noun: [singular: string, plural: string];
}

export function ListToolbar<F extends string>({
  query,
  onQueryChange,
  placeholder,
  filters,
  filter,
  onFilterChange,
  filterLabel,
  count,
  noun,
}: ListToolbarProps<F>) {
  return (
    <div className={styles.toolbar}>
      <label className={styles.search}>
        <Icon name="search" size={18} />
        <span className="sr-only">Buscar</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className={styles.input}
        />
      </label>

      <div className={styles.segmented} role="group" aria-label={filterLabel}>
        {filters.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.segment}
            aria-pressed={filter === option.value}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className={styles.count} aria-live="polite">
        {count} {count === 1 ? noun[0] : noun[1]}
      </p>
    </div>
  );
}
