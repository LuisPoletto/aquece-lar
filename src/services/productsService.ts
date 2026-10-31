import type { Product } from '@/types/products';
import { fromMock } from './mockLatency';
import { PRODUCTS_MOCK } from './mocks/productsMock';

/**
 * Cópia em memória do cadastro: valem até a página ser recarregada. Na troca
 * pelo backend, cada função vira uma chamada HTTP com a mesma assinatura.
 */
let products = [...PRODUCTS_MOCK];

export class DuplicateProductCodeError extends Error {
  constructor(code: string) {
    super(`Já existe um produto com o código ${code}.`);
    this.name = 'DuplicateProductCodeError';
  }
}

/** Códigos comparados sem diferenciar maiúsculas e espaços nas pontas. */
export function sameCode(a: string, b: string): boolean {
  return a.trim().toUpperCase() === b.trim().toUpperCase();
}

/** Ativos primeiro, depois os inativos; dentro de cada grupo, a ordem do cadastro. */
export function listProducts(signal?: AbortSignal): Promise<Product[]> {
  return fromMock(
    () => [...products.filter((p) => p.status === 'Ativo'), ...products.filter((p) => p.status !== 'Ativo')],
    signal,
  );
}

/**
 * Cria ou atualiza; o código precisa ser único no cadastro. Produto novo entra
 * no topo; o que acaba de ficar inativo (ou já nasce inativo) vai para o fim.
 */
export function saveProduct(product: Product): Promise<Product> {
  return fromMock(() => {
    if (products.some((p) => p.id !== product.id && sameCode(p.code, product.code))) {
      throw new DuplicateProductCodeError(product.code);
    }
    const current = products.find((p) => p.id === product.id);
    const others = products.filter((p) => p.id !== product.id);
    if (product.status === 'Inativo' && current?.status !== 'Inativo') products = [...others, product];
    else if (current) products = products.map((p) => (p.id === product.id ? product : p));
    else products = [product, ...products];
    return product;
  });
}

export function deleteProduct(id: string): Promise<void> {
  return fromMock(() => {
    products = products.filter((p) => p.id !== id);
  });
}
