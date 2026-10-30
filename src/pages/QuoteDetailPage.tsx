import { Link, useParams } from 'react-router-dom';
import styles from './PlaceholderPage.module.css';

export function QuoteDetailPage() {
  const { id } = useParams();
  const number = id ? `#${id}` : 'orçamento';

  return (
    <section className={`card ${styles.card}`}>
      <h1 className={styles.title}>Orçamento {number}</h1>
      <p className={styles.body}>
        Detalhe e PDF do orçamento ainda não foram implementados. Esta rota existe para a navegação do dashboard
        funcionar de ponta a ponta.
      </p>
      <p className={styles.body}>
        <Link to="/">Voltar ao dashboard</Link>
      </p>
    </section>
  );
}
