import type { Product } from '@/types/products';
import type { CatalogProduct, QuoteDetail } from '@/types/quotes';

/**
 * Catálogo do formulário de orçamento: os produtos ativos e, ao editar ou
 * duplicar, também os itens do orçamento-base que saíram do catálogo
 * (inativos ou excluídos), para que continuem nas linhas em vez de ficarem em branco.
 */
export function catalogFor(products: Product[], base: QuoteDetail | null): CatalogProduct[] {
  const catalog: CatalogProduct[] = products.filter((p) => p.status === 'Ativo');
  for (const item of base?.items ?? []) {
    if (catalog.some((p) => p.code === item.code)) continue;
    const product = products.find((p) => p.code === item.code);
    catalog.push(product ?? { code: item.code, description: item.description, unitPrice: item.unitPrice });
  }
  return catalog;
}
