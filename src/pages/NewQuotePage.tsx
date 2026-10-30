import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { DEFAULT_NOTES, PAYMENT_TERMS, VALID_DAYS } from '@/config/quotes';
import { useList } from '@/features/people/useList';
import { Combobox, type ComboboxOption } from '@/features/quotes/Combobox';
import { formatBRL, initials, toISODate } from '@/lib/format';
import { listCustomers, listSellers } from '@/services/peopleService';
import { createQuote, listCatalog } from '@/services/quotesService';
import type { QuoteContact } from '@/types/quotes';
import formStyles from '@/features/people/Form.module.css';
import detailStyles from './QuoteDetailPage.module.css';
import styles from './NewQuotePage.module.css';

/** Linha do formulário; quantidade e valor ficam como texto enquanto são digitados. */
interface Line {
  key: number;
  code: string;
  quantity: string;
  unitPrice: string;
}

type LineErrors = Partial<Record<'code' | 'quantity' | 'unitPrice', string>>;

interface Errors {
  customer?: string;
  seller?: string;
  validUntil?: string;
  lines?: Record<number, LineErrors>;
}

const FORM_ID = 'novo-orcamento';

function emptyLine(key: number): Line {
  return { key, code: '', quantity: '1', unitPrice: '' };
}

function lineTotal(line: Line): number {
  const total = Number(line.quantity) * Number(line.unitPrice);
  return Number.isFinite(total) ? total : 0;
}

function defaultValidUntil(): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + VALID_DAYS));
}

function validateLine(line: Line): LineErrors {
  const errors: LineErrors = {};
  if (!line.code) errors.code = 'Escolha o produto.';
  const quantity = Number(line.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) errors.quantity = 'Mínimo 1.';
  const price = Number(line.unitPrice);
  if (line.unitPrice.trim() === '' || !Number.isFinite(price) || price <= 0) errors.unitPrice = 'Valor inválido.';
  return errors;
}

interface PickerCardProps {
  id: string;
  title: string;
  placeholder: string;
  value: string;
  options: ComboboxOption[];
  contact: QuoteContact | null;
  error?: string;
  onChange: (id: string) => void;
}

function PickerCard({ id, title, placeholder, value, options, contact, error, onChange }: PickerCardProps) {
  return (
    <section className={`card ${detailStyles.side}`}>
      <label htmlFor={id} className={detailStyles.sideTitle}>
        {title} *
      </label>
      <Combobox
        id={id}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        invalid={Boolean(error)}
      />
      {error && <p className={formStyles.error}>{error}</p>}
      {contact && (
        <>
          <div className={detailStyles.contact}>
            <span className={detailStyles.avatar} aria-hidden="true">
              {initials(contact.name)}
            </span>
            <div className={detailStyles.contactText}>
              <span className={detailStyles.contactName}>{contact.name}</span>
              {contact.detail && <span className={detailStyles.muted}>{contact.detail}</span>}
            </div>
          </div>
          {(contact.phone || contact.city) && (
            <dl className={detailStyles.facts}>
              {contact.phone && (
                <div>
                  <dt>Telefone</dt>
                  <dd>{contact.phone}</dd>
                </div>
              )}
              {contact.city && (
                <div>
                  <dt>Cidade</dt>
                  <dd>{contact.city}</dd>
                </div>
              )}
            </dl>
          )}
        </>
      )}
    </section>
  );
}

export function NewQuotePage() {
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const customersState = useList(listCustomers, 'Não foi possível carregar os clientes.', reloadKey);
  const sellersState = useList(listSellers, 'Não foi possível carregar os vendedores.', reloadKey);
  const catalogState = useList(listCatalog, 'Não foi possível carregar os produtos.', reloadKey);

  const [customerId, setCustomerId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const nextKey = useRef(1);
  const [lines, setLines] = useState<Line[]>([emptyLine(0)]);
  const [validUntil, setValidUntil] = useState(defaultValidUntil);
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS[0] ?? '');
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');

  const customers = customersState.data;
  const catalog = catalogState.data;
  const activeSellers = useMemo(
    () => (sellersState.data ?? []).filter((s) => s.status === 'Ativo'),
    [sellersState.data],
  );

  const customerOptions = useMemo(
    () => (customers ?? []).map((c) => ({ id: c.id, name: c.name, hint: c.city })),
    [customers],
  );
  const sellerOptions = useMemo(
    () => activeSellers.map((s) => ({ id: s.id, name: s.name, hint: s.region })),
    [activeSellers],
  );

  const customer = customers?.find((c) => c.id === customerId) ?? null;
  const seller = activeSellers.find((s) => s.id === sellerId) ?? null;
  const customerContact: QuoteContact | null = customer && {
    name: customer.name,
    detail: customer.document,
    phone: customer.phone,
    city: customer.city || undefined,
  };
  const sellerContact: QuoteContact | null = seller && { name: seller.name, detail: seller.email, phone: seller.phone };

  const total = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const units = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  const today = toISODate(new Date());

  function chooseCustomer(id: string) {
    setCustomerId(id);
    // Sugere o vendedor responsável pelo cliente se nenhum foi escolhido.
    const owner = activeSellers.find((s) => s.name === customers?.find((c) => c.id === id)?.seller);
    if (!sellerId && owner) setSellerId(owner.id);
  }

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function chooseProduct(key: number, code: string) {
    const product = catalog?.find((p) => p.code === code);
    updateLine(key, { code, unitPrice: product ? String(product.unitPrice) : '' });
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine(nextKey.current++)]);
  }

  function removeLine(key: number) {
    setLines((prev) => prev.filter((line) => line.key !== key));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    if (!customer) found.customer = 'Escolha o cliente.';
    if (!seller) found.seller = 'Escolha o vendedor.';
    if (!validUntil) found.validUntil = 'Informe a validade.';
    else if (validUntil < today) found.validUntil = 'A validade não pode ser anterior a hoje.';
    const lineErrors: Record<number, LineErrors> = {};
    for (const line of lines) {
      const lineError = validateLine(line);
      if (Object.keys(lineError).length > 0) lineErrors[line.key] = lineError;
    }
    if (Object.keys(lineErrors).length > 0) found.lines = lineErrors;
    setErrors(found);
    if (Object.keys(found).length > 0 || !customerContact || !sellerContact || !catalog) return;

    setBusy(true);
    setSaveError('');
    try {
      const quote = await createQuote({
        customerInfo: customerContact,
        sellerInfo: sellerContact,
        items: lines.map((line) => ({
          code: line.code,
          description: catalog.find((p) => p.code === line.code)?.description ?? line.code,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
        })),
        validUntil,
        paymentTerms,
        notes: notes.trim(),
      });
      navigate(`/orcamentos/${quote.id}`);
    } catch (error) {
      console.error('Falha ao salvar o orçamento', error);
      setSaveError('Não foi possível salvar o orçamento. Tente novamente.');
      setBusy(false);
    }
  }

  const loadError = [customersState, sellersState, catalogState].find((s) => s.status === 'error');

  return (
    <>
      <Link to="/orcamentos" className={`link-strong ${detailStyles.back}`}>
        <Icon name="chevLeft" size={14} />
        Orçamentos
      </Link>

      <div className={detailStyles.pageHead}>
        <div className={detailStyles.titles}>
          <h1 className={detailStyles.h1}>Novo orçamento</h1>
          <p className={detailStyles.sub}>Ele é criado como pendente e pode ser enviado ao cliente depois.</p>
        </div>
        <div className={detailStyles.actions}>
          <Link to="/orcamentos" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={busy || !catalog}>
            <Icon name="save" size={16} />
            {busy ? 'Salvando…' : 'Salvar orçamento'}
          </button>
        </div>
      </div>

      {(loadError || saveError) && (
        <div className={detailStyles.alert} role="alert">
          <span>{saveError || (loadError?.status === 'error' ? loadError.message : '')}</span>
          {loadError && (
            <button type="button" className="btn btn-secondary" onClick={() => setReloadKey((k) => k + 1)}>
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {!customers || !sellersState.data || !catalog ? (
        !loadError && (
          <div className={`card ${detailStyles.skeleton}`} aria-busy="true">
            <span className="sr-only">Carregando formulário…</span>
          </div>
        )
      ) : (
        <form id={FORM_ID} className={detailStyles.layout} onSubmit={submit} noValidate>
          <div className={detailStyles.mainCol}>
            <section className={`card ${detailStyles.itemsCard}`} aria-labelledby="itens-titulo">
              <div className={detailStyles.cardHead}>
                <h2 id="itens-titulo" className={detailStyles.cardTitle}>
                  Itens
                </h2>
                <span className={detailStyles.muted}>
                  {units} {units === 1 ? 'unidade' : 'unidades'}
                </span>
              </div>

              <div className={`${styles.line} ${styles.lineHead}`} aria-hidden="true">
                <span>Produto</span>
                <span className={styles.num}>Qtd.</span>
                <span className={styles.num}>Valor unit.</span>
                <span className={styles.num}>Total</span>
                <span />
              </div>
              <ul className={styles.lines}>
                {lines.map((line, index) => {
                  const lineError = errors.lines?.[line.key];
                  const taken = new Set(lines.filter((l) => l.key !== line.key).map((l) => l.code));
                  return (
                    <li key={line.key} className={styles.line}>
                      <label className={formStyles.field}>
                        <span className={styles.cellLabel}>Produto</span>
                        <select
                          className={formStyles.input}
                          value={line.code}
                          onChange={(e) => chooseProduct(line.key, e.target.value)}
                          aria-invalid={Boolean(lineError?.code)}
                        >
                          <option value="">Escolha um produto</option>
                          {catalog.map((product) => (
                            <option key={product.code} value={product.code} disabled={taken.has(product.code)}>
                              {product.code} · {product.description}
                            </option>
                          ))}
                        </select>
                        {lineError?.code && <p className={formStyles.error}>{lineError.code}</p>}
                      </label>
                      <label className={formStyles.field}>
                        <span className={styles.cellLabel}>Qtd.</span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          className={`${formStyles.input} ${styles.numInput}`}
                          value={line.quantity}
                          onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                          aria-invalid={Boolean(lineError?.quantity)}
                        />
                        {lineError?.quantity && <p className={formStyles.error}>{lineError.quantity}</p>}
                      </label>
                      <label className={formStyles.field}>
                        <span className={styles.cellLabel}>Valor unit. (R$)</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          inputMode="decimal"
                          className={`${formStyles.input} ${styles.numInput}`}
                          value={line.unitPrice}
                          onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })}
                          aria-invalid={Boolean(lineError?.unitPrice)}
                        />
                        {lineError?.unitPrice && <p className={formStyles.error}>{lineError.unitPrice}</p>}
                      </label>
                      <div className={styles.lineTotal}>
                        <span className={styles.cellLabel}>Total</span>
                        <span className={styles.num}>{formatBRL(lineTotal(line))}</span>
                      </div>
                      <button
                        type="button"
                        className={`icon-btn icon-btn--sm ${styles.remove}`}
                        onClick={() => removeLine(line.key)}
                        disabled={lines.length === 1}
                        aria-label={`Remover item ${index + 1}`}
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.addRow}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addLine}
                  disabled={lines.length >= catalog.length}
                >
                  <Icon name="plus" size={16} />
                  Adicionar item
                </button>
              </div>
              <div className={detailStyles.total}>
                <span>Total do orçamento</span>
                <strong>{formatBRL(total)}</strong>
              </div>
            </section>

            <section className={`card ${detailStyles.side}`} aria-labelledby="condicoes-titulo">
              <h2 id="condicoes-titulo" className={detailStyles.sideTitle}>
                Condições
              </h2>
              <div className={formStyles.grid}>
                <label className={formStyles.field}>
                  <span className={formStyles.label}>Validade *</span>
                  <input
                    type="date"
                    className={formStyles.input}
                    value={validUntil}
                    min={today}
                    onChange={(e) => setValidUntil(e.target.value)}
                    aria-invalid={Boolean(errors.validUntil)}
                  />
                  {errors.validUntil && <p className={formStyles.error}>{errors.validUntil}</p>}
                </label>
                <label className={formStyles.field}>
                  <span className={formStyles.label}>Pagamento</span>
                  <select
                    className={formStyles.input}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  >
                    {PAYMENT_TERMS.map((terms) => (
                      <option key={terms} value={terms}>
                        {terms}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`${formStyles.field} ${formStyles.full}`}>
                  <span className={formStyles.label}>Observações</span>
                  <textarea
                    className={`${formStyles.input} ${styles.textarea}`}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </div>
            </section>
          </div>

          <div className={`${detailStyles.sideCol} ${styles.pickers}`}>
            <PickerCard
              id="cliente"
              title="Cliente"
              placeholder="Digite ou escolha o cliente"
              value={customerId}
              options={customerOptions}
              contact={customerContact}
              error={errors.customer}
              onChange={chooseCustomer}
            />
            <PickerCard
              id="vendedor"
              title="Vendedor"
              placeholder="Digite ou escolha o vendedor"
              value={sellerId}
              options={sellerOptions}
              contact={sellerContact}
              error={errors.seller}
              onChange={setSellerId}
            />
          </div>
        </form>
      )}
    </>
  );
}
