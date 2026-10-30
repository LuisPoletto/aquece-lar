import { useLocation } from 'react-router-dom';
import { ALL_NAV_ITEMS } from '@/config/navigation';
import styles from './PlaceholderPage.module.css';

export function PlaceholderPage() {
  const { pathname } = useLocation();
  const nav = ALL_NAV_ITEMS.find((item) => item.to === pathname);
  const title = nav?.label ?? 'Página';

  return (
    <section className={`card ${styles.card}`}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.body}>
        Esta tela ainda não foi implementada. O layout, a navegação e o tema já estão prontos para receber o
        conteúdo desta funcionalidade.
      </p>
    </section>
  );
}
