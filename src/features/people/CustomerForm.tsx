import { useState, type FormEvent } from 'react';
import type { Customer, CustomerKind } from '@/types/people';
import styles from './Form.module.css';

export type CustomerDraft = Pick<Customer, 'name' | 'kind' | 'document' | 'phone' | 'city' | 'seller'>;

type Errors = Partial<Record<keyof CustomerDraft, string>>;

const EMPTY: CustomerDraft = { name: '', kind: 'PJ', document: '', phone: '', city: '', seller: '' };

function validate(draft: CustomerDraft): Errors {
  const errors: Errors = {};
  if (draft.name.trim().length < 3) errors.name = 'Informe o nome do cliente.';
  const digits = draft.document.replace(/\D/g, '');
  const expected = draft.kind === 'PJ' ? 14 : 11;
  if (digits.length > 0 && digits.length !== expected) {
    errors.document = draft.kind === 'PJ' ? 'O CNPJ deve ter 14 dígitos.' : 'O CPF deve ter 11 dígitos.';
  }
  return errors;
}

interface CustomerFormProps {
  initial?: Customer;
  sellers: string[];
  busy: boolean;
  onSubmit: (draft: CustomerDraft) => void;
  onCancel: () => void;
}

export function CustomerForm({ initial, sellers, busy, onSubmit, onCancel }: CustomerFormProps) {
  const [draft, setDraft] = useState<CustomerDraft>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  // Mantém o vendedor atual na lista mesmo que ele tenha sido excluído.
  const sellerOptions = draft.seller && !sellers.includes(draft.seller) ? [draft.seller, ...sellers] : sellers;

  function set<K extends keyof CustomerDraft>(key: K, value: CustomerDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ ...draft, name: draft.name.trim(), document: draft.document.trim() });
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.grid}>
        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.label}>Nome *</span>
          <input
            className={styles.input}
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            autoFocus
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Tipo</span>
          <select
            className={styles.input}
            value={draft.kind}
            onChange={(e) => set('kind', e.target.value as CustomerKind)}
          >
            <option value="PJ">Empresa (CNPJ)</option>
            <option value="PF">Pessoa (CPF)</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>{draft.kind === 'PJ' ? 'CNPJ' : 'CPF'}</span>
          <input
            className={styles.input}
            value={draft.document}
            onChange={(e) => set('document', e.target.value)}
            inputMode="numeric"
            placeholder={draft.kind === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
            aria-invalid={Boolean(errors.document)}
          />
          {errors.document && <p className={styles.error}>{errors.document}</p>}
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Telefone</span>
          <input
            type="tel"
            className={styles.input}
            value={draft.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="(54) 99999-9999"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Cidade</span>
          <input className={styles.input} value={draft.city} onChange={(e) => set('city', e.target.value)} />
        </label>
        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.label}>Vendedor responsável</span>
          <select className={styles.input} value={draft.seller} onChange={(e) => set('seller', e.target.value)}>
            <option value="">Sem vendedor</option>
            {sellerOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
