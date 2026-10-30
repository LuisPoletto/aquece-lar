import { Link } from 'react-router-dom';
import type { SellerRank } from '@/types/dashboard';
import { formatBRLRounded, initials } from '@/lib/format';
import styles from './SellerRanking.module.css';

export function SellerRanking({ sellers }: { sellers: SellerRank[] }) {
  const sorted = [...sellers].sort((a, b) => b.amount - a.amount);
  const max = Math.max(0, ...sorted.map((s) => s.amount));

  return (
    <section className={`card ${styles.card}`} aria-labelledby="ranking-titulo">
      <div className={styles.head}>
        <div className={styles.titles}>
          <h2 id="ranking-titulo" className={styles.title}>
            Ranking de vendedores
          </h2>
          <p className={styles.subtitle}>Por valor orçado no período</p>
        </div>
        <Link to="/vendedores" className="link-strong">
          Ver todos
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className={styles.empty}>Nenhum vendedor com orçamentos no período.</p>
      ) : (
        <ol className={styles.list}>
          {sorted.map((seller, index) => (
            <li key={seller.id} className={styles.item}>
              <div className={styles.row}>
                <span className={styles.pos}>{index + 1}</span>
                <span className={styles.avatar} aria-hidden="true">
                  {initials(seller.name)}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{seller.name}</span>
                  <span className={styles.qtd}>{seller.quotes} orçamentos</span>
                </span>
                <span className={styles.amount}>{formatBRLRounded(seller.amount)}</span>
              </div>
              <div className={styles.track} aria-hidden="true">
                <div
                  className={styles.fill}
                  style={{ width: `${max > 0 ? Math.round((seller.amount / max) * 100) : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
