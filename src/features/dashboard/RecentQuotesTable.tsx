import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import type { RecentQuote } from '@/types/dashboard';
import { formatBRL, formatDateTime } from '@/lib/format';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import styles from './RecentQuotesTable.module.css';

export function RecentQuotesTable({ quotes }: { quotes: RecentQuote[] }) {
  return (
    <section className={`card ${styles.card}`} aria-labelledby="ultimos-orcamentos-titulo">
      <div className={styles.head}>
        <h2 id="ultimos-orcamentos-titulo" className={styles.title}>
          Últimos 10 orçamentos
        </h2>
        <Link to="/orcamentos" className="link-strong">
          Ver todos os orçamentos
          <Icon name="chevRight" size={14} />
        </Link>
      </div>

      {quotes.length === 0 ? (
        <p className={styles.empty}>Nenhum orçamento recente.</p>
      ) : (
        <>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Nº</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Vendedor</th>
                  <th scope="col" className={styles.num}>
                    Valor
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">Data</th>
                  <th scope="col" className={styles.actionsHead}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className={styles.row}>
                    <td className={styles.number}>{quote.number}</td>
                    <td>{quote.customer}</td>
                    <td className={styles.muted}>{quote.seller}</td>
                    <td className={styles.num}>{formatBRL(quote.amount)}</td>
                    <td>
                      <QuoteStatusBadge status={quote.status} />
                    </td>
                    <td className={styles.date}>{formatDateTime(quote.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          to={`/orcamentos/${quote.id}`}
                          className="icon-btn icon-btn--sm"
                          aria-label={`Abrir orçamento ${quote.number}`}
                        >
                          <Icon name="eye" size={17} />
                        </Link>
                        <Link
                          to={`/orcamentos/${quote.id}/pdf`}
                          className="icon-btn icon-btn--sm"
                          aria-label={`Baixar PDF ${quote.number}`}
                        >
                          <Icon name="download" size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className={styles.cards}>
            {quotes.map((quote) => (
              <li key={quote.id} className={styles.quoteCard}>
                <div className={styles.cardTop}>
                  <span className={styles.number}>{quote.number}</span>
                  <QuoteStatusBadge status={quote.status} />
                </div>
                <p className={styles.cardCustomer}>{quote.customer}</p>
                <p className={styles.cardMeta}>
                  {quote.seller} · {formatDateTime(quote.createdAt)}
                </p>
                <div className={styles.cardFoot}>
                  <span className={styles.cardAmount}>{formatBRL(quote.amount)}</span>
                  <div className={styles.actions}>
                    <Link
                      to={`/orcamentos/${quote.id}`}
                      className="icon-btn icon-btn--sm"
                      aria-label={`Abrir orçamento ${quote.number}`}
                    >
                      <Icon name="eye" size={17} />
                    </Link>
                    <Link
                      to={`/orcamentos/${quote.id}/pdf`}
                      className="icon-btn icon-btn--sm"
                      aria-label={`Baixar PDF ${quote.number}`}
                    >
                      <Icon name="download" size={17} />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
