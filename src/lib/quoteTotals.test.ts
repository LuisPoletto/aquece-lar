import { describe, expect, it } from 'vitest';
import { quoteTotals } from './quoteTotals';

const items = [
  { quantity: 2, unitPrice: 4590 },
  { quantity: 1, unitPrice: 650 },
];

describe('quoteTotals', () => {
  it('soma os itens quando não há desconto', () => {
    expect(quoteTotals(items, null)).toEqual({ subtotal: 9830, discount: 0, total: 9830 });
  });

  it('aplica desconto percentual arredondando em centavos', () => {
    expect(quoteTotals(items, { type: 'percent', value: 5 })).toEqual({ subtotal: 9830, discount: 491.5, total: 9338.5 });
    expect(quoteTotals([{ quantity: 1, unitPrice: 33.33 }], { type: 'percent', value: 10 })).toEqual({
      subtotal: 33.33,
      discount: 3.33,
      total: 30,
    });
  });

  it('aplica desconto em reais', () => {
    expect(quoteTotals(items, { type: 'amount', value: 830 })).toEqual({ subtotal: 9830, discount: 830, total: 9000 });
  });

  it('não deixa o desconto passar do subtotal nem ficar negativo', () => {
    expect(quoteTotals(items, { type: 'amount', value: 20000 }).total).toBe(0);
    expect(quoteTotals(items, { type: 'percent', value: 150 }).total).toBe(0);
    expect(quoteTotals(items, { type: 'amount', value: -50 }).discount).toBe(0);
  });

  it('evita erros de ponto flutuante na soma', () => {
    expect(quoteTotals([{ quantity: 3, unitPrice: 0.1 }], null).subtotal).toBe(0.3);
  });
});
