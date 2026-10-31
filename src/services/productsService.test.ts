import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/products';
import { deleteProduct, DuplicateProductCodeError, listProducts, saveProduct } from './productsService';

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: `t-${Math.random().toString(36).slice(2)}`,
    code: `TST-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    description: 'Produto de teste',
    category: 'Acessórios',
    unitPrice: 100,
    status: 'Ativo',
    ...overrides,
  };
}

describe('productsService', () => {
  it('lista o cadastro com ativos e inativos', async () => {
    const products = await listProducts();
    expect(products.some((p) => p.status === 'Ativo')).toBe(true);
    expect(products.some((p) => p.status === 'Inativo')).toBe(true);
  });

  it('lista os ativos primeiro e os inativos no fim', async () => {
    const statuses = (await listProducts()).map((p) => p.status);
    const firstInactive = statuses.indexOf('Inativo');
    expect(firstInactive).toBeGreaterThan(0);
    expect(statuses.slice(firstInactive).every((s) => s === 'Inativo')).toBe(true);
  });

  it('produto que acaba de ser inativado vai para o fim da lista', async () => {
    const created = await saveProduct(product());
    expect((await listProducts())[0]?.id).toBe(created.id);

    await saveProduct({ ...created, status: 'Inativo' });
    expect((await listProducts()).at(-1)?.id).toBe(created.id);

    // Reativado, volta para o grupo dos ativos (no fim dele).
    await saveProduct({ ...created, status: 'Ativo' });
    const list = await listProducts();
    const index = list.findIndex((p) => p.id === created.id);
    expect(list[index + 1]?.status).toBe('Inativo');
  });

  it('produto que já nasce inativo entra no fim', async () => {
    const created = await saveProduct(product({ status: 'Inativo' }));
    expect((await listProducts()).at(-1)?.id).toBe(created.id);
  });

  it('cria no topo da lista e atualiza pelo id', async () => {
    const created = await saveProduct(product({ description: 'Novo' }));
    expect((await listProducts())[0]).toEqual(created);

    await saveProduct({ ...created, unitPrice: 250 });
    const updated = (await listProducts()).find((p) => p.id === created.id);
    expect(updated?.unitPrice).toBe(250);
  });

  it('recusa código repetido, sem diferenciar maiúsculas', async () => {
    await expect(saveProduct(product({ code: 'aqg-20d' }))).rejects.toBeInstanceOf(DuplicateProductCodeError);
  });

  it('deixa salvar o próprio produto sem acusar o código dele como repetido', async () => {
    const existing = (await listProducts()).find((p) => p.code === 'BLR-200');
    expect(existing).toBeDefined();
    if (existing) await expect(saveProduct({ ...existing, unitPrice: 3890 })).resolves.toMatchObject({ unitPrice: 3890 });
  });

  it('exclui pelo id', async () => {
    const created = await saveProduct(product());
    await deleteProduct(created.id);
    expect((await listProducts()).some((p) => p.id === created.id)).toBe(false);
  });
});
