import { describe, expect, it } from 'vitest';
import { PAYMENT_TERMS, termDiscount } from './quotes';

describe('termDiscount', () => {
  it('lê o percentual prometido na condição', () => {
    expect(termDiscount('À vista com 5% de desconto')).toBe(5);
    expect(termDiscount('Pix com 7,5 % de desconto')).toBe(7.5);
  });

  it('devolve null quando a condição não promete desconto', () => {
    expect(termDiscount('3x sem juros no cartão')).toBeNull();
    expect(termDiscount('Entrada + 2x no boleto')).toBeNull();
  });

  it('reconhece o desconto da condição padrão', () => {
    expect(termDiscount(PAYMENT_TERMS[0] ?? '')).toBe(5);
  });
});
