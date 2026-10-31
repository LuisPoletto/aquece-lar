import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/products';
import type { QuoteDetail } from '@/types/quotes';
import { catalogFor } from './catalog';

const PRODUCTS: Product[] = [
  { id: '1', code: 'ATV-1', description: 'Ativo', category: 'Boilers', unitPrice: 100, status: 'Ativo' },
  { id: '2', code: 'INA-1', description: 'Inativo', category: 'Boilers', unitPrice: 200, status: 'Inativo' },
];

function baseWith(codes: Array<[code: string, description: string, unitPrice: number]>): QuoteDetail {
  return {
    items: codes.map(([code, description, unitPrice]) => ({ code, description, quantity: 1, unitPrice })),
  } as QuoteDetail;
}

describe('catalogFor', () => {
  it('num orçamento novo, oferece só os ativos', () => {
    expect(catalogFor(PRODUCTS, null).map((p) => p.code)).toEqual(['ATV-1']);
  });

  it('mantém um produto inativo que já estava no orçamento-base', () => {
    const catalog = catalogFor(PRODUCTS, baseWith([['INA-1', 'Inativo', 180]]));
    expect(catalog.map((p) => p.code)).toEqual(['ATV-1', 'INA-1']);
    expect(catalog[1]?.unitPrice).toBe(200); // preço de tabela atual do cadastro
  });

  it('recria a partir do item um produto que foi excluído do cadastro', () => {
    const catalog = catalogFor(PRODUCTS, baseWith([['OLD-9', 'Produto antigo', 999]]));
    expect(catalog[1]).toEqual({ code: 'OLD-9', description: 'Produto antigo', unitPrice: 999 });
  });
});
