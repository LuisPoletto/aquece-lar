import type { Product } from '@/types/products';

/** Cadastro fictício com preço de tabela; os ativos formam o catálogo do orçamento. */
export const PRODUCTS_MOCK: Product[] = [
  { id: 'p1', code: 'AQG-20D', description: 'Aquecedor a gás digital 20 L/min', category: 'Aquecedores a gás', unitPrice: 2890, status: 'Ativo' },
  { id: 'p2', code: 'AQG-33P', description: 'Aquecedor a gás de passagem 33 L/min', category: 'Aquecedores a gás', unitPrice: 4590, status: 'Ativo' },
  { id: 'p3', code: 'BLR-200', description: 'Boiler de acumulação 200 L', category: 'Boilers', unitPrice: 3790, status: 'Ativo' },
  { id: 'p4', code: 'LRL-900', description: 'Lareira a lenha 90 cm com vidro', category: 'Lareiras', unitPrice: 6490, status: 'Ativo' },
  { id: 'p5', code: 'PIS-AQ3', description: 'Aquecedor de piscina 3 kW', category: 'Piscina', unitPrice: 4190, status: 'Ativo' },
  { id: 'p6', code: 'CHM-150', description: 'Chaminé inox 150 mm (kit 3 m)', category: 'Acessórios', unitPrice: 1290, status: 'Ativo' },
  { id: 'p7', code: 'KIT-INS', description: 'Kit de instalação hidráulica', category: 'Acessórios', unitPrice: 480, status: 'Ativo' },
  { id: 'p8', code: 'VLV-GAS', description: 'Válvula de segurança para gás', category: 'Acessórios', unitPrice: 190, status: 'Ativo' },
  { id: 'p9', code: 'SRV-INS', description: 'Serviço de instalação e teste', category: 'Serviços', unitPrice: 650, status: 'Ativo' },
  { id: 'p10', code: 'AQG-15M', description: 'Aquecedor a gás mecânico 15 L/min', category: 'Aquecedores a gás', unitPrice: 1990, status: 'Inativo' },
  { id: 'p11', code: 'LRL-700', description: 'Lareira a lenha 70 cm (linha antiga)', category: 'Lareiras', unitPrice: 4890, status: 'Inativo' },
];
