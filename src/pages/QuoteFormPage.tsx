import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { DEFAULT_NOTES, PAYMENT_TERMS, VALID_DAYS } from '@/config/quotes';
import { useList } from '@/features/people/useList';
import { Combobox, type ComboboxOption } from '@/features/quotes/Combobox';
import { useQuote } from '@/features/quotes/useQuote';
import { formatBRL, initials, toISODate } from '@/lib/format';import { listCustomers, listSellers } from '@/services/peopleService';
import { createQuote, listCatalog, updateQuote } from '@/services/quotesService';
import type { Customer, Seller } from '@/types/people';
import type { CatalogProduct, QuoteContact, QuoteDetail } from '@/types/quotes';
import formStyles from '@/features/people/Form.module.css';
import detailStyles from './QuoteDetailPage.module.css';
import styles from './QuoteFormPage.module.css';

/** `new` parte do zero; `edit` altera um pendente; `duplicate` cria um novo a partir de outro. */
export type QuoteFormMode = 'new' | 'edit' | 'duplicate';

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

const FORM_ID = 'orcamento-form';

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

interface PageHeadProps {
  backTo: string;
  backLabel: string;
  title: string;
  sub: string;
  children?: ReactNode;
}

function PageHead({ backTo, backLabel, title, sub, children }: PageHeadProps) {
  return (
    <>
      <Link to={backTo} className={`link-strong ${detailStyles.back}`}>
        <Icon name="chevLeft" size={14} />
        {backLabel}
      </Link>
      <div className={detailStyles.pageHead}>
        <div className={detailStyles.titles}>
          <h1 className={detailStyles.h1}>{title}</h1>
          <p className={detailStyles.sub}>{sub}</p>
        </div>
        {children && <div className={detailStyles.actions}>{children}</div>}
      </div>
    </>
  );
}

/** `number` é o do orçamento-base (ex.: "#1182"), ignorado no modo `new`. */
function headText(mode: QuoteFormMode, number: string) {
  if (mode === 'edit') {
    return { title: `Editar orçamento ${number}`, sub: 'As alterações ficam registradas no histórico.', submit: 'Salvar alterações' };
  }
  if (mode === 'duplicate') {
    return { title: `Duplicar orçamento ${number}`, sub: 'Cria um orçamento novo, pendente; o original não muda.', submit: 'Criar cópia' };
  }
  return { title: 'Novo orçamento', sub: 'Ele é criado como pendente e pode ser enviado ao cliente depois.', submit: 'Salvar orçamento' };
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

interface QuoteFormProps {
  mode: QuoteFormMode;
  /** Orçamento editado ou copiado; `null` no modo `new`. */
  base: QuoteDetail | null;
  customers: Customer[];
  /** Só vendedores ativos. */
  sellers: Seller[];
  catalog: CatalogProduct[];
}

function QuoteForm({ mode, base, customers, sellers, catalog }: QuoteFormProps) {
  const navigate = useNavigate();
  const text = headText(mode, base?.number ?? '');
  const backTo = base ? `/orcamentos/${base.id}` : '/orcamentos';

  // Cliente e vendedor do orçamento-base são achados pelo nome; se não existirem mais, ficam em branco.
  const [customerId, setCustomerId] = useState(() => customers.find((c) => c.name === base?.customer)?.id ?? '');
  const [sellerId, setSellerId] = useState(() => sellers.find((s) => s.name === base?.seller)?.id ?? '');
  const [lines, setLines] = useState<Line[]>(() =>
    base
      ? base.items.map((item, key) => ({
          key,
          code: item.code,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
        }))
      : [emptyLine(0)],
  );
  const nextKey = useRef(lines.length);
  // A cópia ganha validade nova; a edição mantém a original.
  const [validUntil, setValidUntil] = useState(() =>
    mode === 'edit' && base ? base.validUntil : defaultValidUntil(),
  );
  const [paymentTerms, setPaymentTerms] = useState(base?.paymentTerms ?? PAYMENT_TERMS[0] ?? '');  const [notes, setNotes] = useState(base?.notes ?? DEFAULT_NOTES);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');

  const customerOptions = useMemo(
    () => customers.map((c) => ({ id: c.id, name: c.name, hint: c.city })),
    [customers],
  );
  const sellerOptions = useMemo(() => sellers.map((s) => ({ id: s.id, name: s.name, hint: s.region })), [sellers]);
  // Mantém na lista uma forma de pagamento antiga que saiu da configuração.
  const paymentOptions = PAYMENT_TERMS.includes(paymentTerms) ? PAYMENT_TERMS : [paymentTerms, ...PAYMENT_TERMS];

  const customer = customers.find((c) => c.id === customerId) ?? null;
  const seller = sellers.find((s) => s.id === sellerId) ?? null;
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
    const owner = sellers.find((s) => s.name === customers.find((c) => c.id === id)?.seller);
    if (!sellerId && owner) setSellerId(owner.id);
  }

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function chooseProduct(key: number, code: string) {
    const product = catalog.find((p) => p.code === code);
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
    else if (validUntil < today) found.validUntil = 'A validade não pode ser anterior a hoje.';    const lineErrors: Record<number, LineErrors> = {};
    for (const line of lines) {
      const lineError = validateLine(line);
      if (Object.keys(lineError).length > 0) lineErrors[line.key] = lineError;
    }
    if (Object.keys(lineErrors).length > 0) found.lines = lineErrors;
    setErrors(found);
    if (Object.keys(found).length > 0 || !customerContact || !sellerContact) return;

    const draft = {
      customerInfo: customerContact,
      sellerInfo: sellerContact,
      items: lines.map((line) => ({
        code: line.code,
        description:
          catalog.find((p) => p.code === line.code)?.description ??
          base?.items.find((item) => item.code === line.code)?.description ??
          line.code,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      })),
      validUntil,
      paymentTerms,
      notes: notes.trim(),
    };

    setBusy(true);
    setSaveError('');
    try {
      const quote =
        mode === 'edit' && base
          ? await updateQuote(base.id, draft)
          : await createQuote(draft, base ? `Criado a partir do orçamento ${base.number}` : undefined);
      navigate(`/orcamentos/${quote.id}`);
    } catch (error) {
      console.error('Falha ao salvar o orçamento', error);
      setSaveError('Não foi possível salvar o orçamento. Tente novamente.');
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        backTo={backTo}
        backLabel={base ? `Orçamento ${base.number}` : 'Orçamentos'}
        title={text.title}
        sub={text.sub}
      >
        <Link to={backTo} className="btn btn-secondary">
          Cancelar
        </Link>
        <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={busy}>
          <Icon name="save" size={16} />
          {busy ? 'Salvando…' : text.submit}
        </button>
      </PageHead>

      {saveError && (
        <div className={detailStyles.alert} role="alert">
          <span>{saveError}</span>
        </div>
      )}

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
                <select className={formStyles.input} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
                  {paymentOptions.map((terms) => (
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
    </>
  );
}

/** Carrega cadastros, catálogo e, ao editar ou duplicar, o orçamento-base. */
export function QuoteFormPage({ mode }: { mode: QuoteFormMode }) {
  const { id = '' } = useParams();
  const [reloadKey, setReloadKey] = useState(0);
  const customersState = useList(listCustomers, 'Não foi possível carregar os clientes.', reloadKey);
  const sellersState = useList(listSellers, 'Não foi possível carregar os vendedores.', reloadKey);
  const catalogState = useList(listCatalog, 'Não foi possível carregar os produtos.', reloadKey);
  const baseState = useQuote(mode === 'new' ? null : id, reloadKey);

  const activeSellers = useMemo(
    () => (sellersState.data ?? []).filter((s) => s.status === 'Ativo'),
    [sellersState.data],
  );

  const base = baseState.data;
  const text = headText(mode, base?.number ?? `#${id}`);
  const backTo = mode === 'new' ? '/orcamentos' : `/orcamentos/${id}`;
  const backLabel = mode === 'new' ? 'Orçamentos' : `Orçamento #${id}`;

  if (baseState.status === 'not-found') {
    return (
      <section className={`card ${detailStyles.message}`}>
        <h1 className={detailStyles.messageTitle}>Orçamento não encontrado</h1>
        <p className={detailStyles.muted}>O orçamento #{id} não existe ou foi removido.</p>
        <Link to="/orcamentos" className="btn btn-secondary">
          <Icon name="chevLeft" size={16} />
          Voltar para orçamentos
        </Link>
      </section>
    );
  }

  if (mode === 'edit' && base && base.status !== 'Pendente') {
    return (
      <section className={`card ${detailStyles.message}`}>
        <h1 className={detailStyles.messageTitle}>Este orçamento não pode ser editado</h1>
        <p className={detailStyles.muted}>
          O orçamento {base.number} está {base.status.toLowerCase()}. Só pendentes podem ser editados; para mudar
          itens ou condições, crie uma cópia.
        </p>
        <div className={detailStyles.actions}>
          <Link to={backTo} className="btn btn-secondary">
            <Icon name="chevLeft" size={16} />
            Voltar ao orçamento
          </Link>
          <Link to={`/orcamentos/${base.id}/duplicar`} className="btn btn-primary">
            <Icon name="copy" size={16} />
            Duplicar
          </Link>
        </div>
      </section>
    );
  }

  const loadError = [customersState, sellersState, catalogState, baseState].find((s) => s.status === 'error');
  const customers = customersState.data;
  const catalog = catalogState.data;

  if (customers && sellersState.data && catalog && (mode === 'new' || baseState.status === 'success')) {
    return (
      <QuoteForm
        key={`${mode}-${id}`}
        mode={mode}
        base={base}
        customers={customers}
        sellers={activeSellers}
        catalog={catalog}
      />
    );
  }

  return (
    <>
      <PageHead backTo={backTo} backLabel={backLabel} title={text.title} sub={text.sub} />
      {loadError?.status === 'error' ? (
        <div className={detailStyles.alert} role="alert">
          <span>{loadError.message}</span>
          <button type="button" className="btn btn-secondary" onClick={() => setReloadKey((k) => k + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className={`card ${detailStyles.skeleton}`} aria-busy="true">
          <span className="sr-only">Carregando formulário…</span>
        </div>
      )}
    </>
  );
}
