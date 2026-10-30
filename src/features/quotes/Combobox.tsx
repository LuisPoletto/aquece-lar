import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/Icon';
import { matches, normalize } from '@/features/people/useList';
import formStyles from '@/features/people/Form.module.css';
import styles from './Combobox.module.css';

export interface ComboboxOption {
  id: string;
  name: string;
  /** Linha secundária na lista (cidade, região); também entra na busca. */
  hint?: string;
}

interface ComboboxProps {
  id: string;
  options: ComboboxOption[];
  /** Id da opção escolhida; `''` = nenhuma. */
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  invalid?: boolean;
}

/** Campo que aceita digitar para filtrar e também abre a lista completa. */
export function Combobox({ id, options, value, onChange, placeholder, invalid }: ComboboxProps) {
  const selected = options.find((o) => o.id === value);
  const [text, setText] = useState(selected?.name ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `${id}-lista`;

  // Acompanha escolhas feitas por fora, como o vendedor sugerido pelo cliente.
  useEffect(() => {
    setText(selected?.name ?? '');
  }, [selected?.name]);

  // Com o nome escolhido no campo, a lista mostra todas as opções.
  const filtered = text === (selected?.name ?? '') ? options : options.filter((o) => matches(text, o.name, o.hint ?? ''));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function show() {
    const index = filtered.findIndex((o) => o.id === value);
    setActive(Math.max(0, index));
    setOpen(true);
  }

  function choose(option: ComboboxOption) {
    onChange(option.id);
    setText(option.name);
    setOpen(false);
  }

  // Ao sair do campo: nome exato escolhe, vazio limpa, qualquer outro texto volta ao escolhido.
  function commit() {
    setOpen(false);
    const exact = options.find((o) => normalize(o.name) === normalize(text.trim()));
    if (exact) choose(exact);
    else if (text.trim() === '') onChange('');
    else setText(selected?.name ?? '');
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) return show();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (filtered.length === 0 ? 0 : (i + step + filtered.length) % filtered.length));
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      const option = filtered[active];
      if (option) choose(option);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setText(selected?.name ?? '');
    }
  }

  const activeOption = open ? filtered[active] : undefined;

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        id={id}
        className={`${formStyles.input} ${styles.input}`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption ? `${id}-op-${activeOption.id}` : undefined}
        aria-invalid={invalid}
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        onBlur={commit}
      />
      <button
        type="button"
        className={styles.toggle}
        tabIndex={-1}
        aria-label={open ? 'Fechar lista' : 'Abrir lista'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          inputRef.current?.focus();
          if (open) setOpen(false);
          else show();
        }}
      >
        <Icon name="chevDown" size={16} />
      </button>

      {open && (
        <ul ref={listRef} id={listId} role="listbox" className={styles.list}>
          {filtered.length === 0 ? (
            <li className={styles.empty}>Nenhum resultado para “{text.trim()}”</li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.id}
                id={`${id}-op-${option.id}`}
                role="option"
                aria-selected={option.id === value}
                data-index={index}
                className={`${styles.option} ${index === active ? styles.active : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(option)}
              >
                <span className={styles.optionText}>
                  <span className={styles.name}>{option.name}</span>
                  {option.hint && <span className={styles.hint}>{option.hint}</span>}
                </span>
                {option.id === value && <Icon name="check" size={16} />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
