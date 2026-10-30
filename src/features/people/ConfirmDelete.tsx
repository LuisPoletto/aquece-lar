import { Modal } from './Modal';
import styles from './Form.module.css';

interface ConfirmDeleteProps {
  /** Nome do item a excluir; `null` mantém o diálogo fechado. */
  name: string | null;
  what: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDelete({ name, what, busy, onConfirm, onCancel }: ConfirmDeleteProps) {
  return (
    <Modal open={name !== null} title={`Excluir ${what}`} onClose={onCancel} size="sm">
      <p className={styles.text}>
        Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.
      </p>
      <div className={styles.actions}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button type="button" className={`btn ${styles.dangerBtn}`} onClick={onConfirm} disabled={busy}>
          {busy ? 'Excluindo…' : 'Excluir'}
        </button>
      </div>
    </Modal>
  );
}
