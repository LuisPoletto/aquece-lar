import type { CatalogProduct } from '@/types/quotes';

/** Catálogo fictício com preço de tabela; a tela de produtos vai substituí-lo. */
export const CATALOG_MOCK: CatalogProduct[] = [
  { code: 'AQG-20D', description: 'Aquecedor a gás digital 20 L/min', unitPrice: 2890 },
  { code: 'AQG-33P', description: 'Aquecedor a gás de passagem 33 L/min', unitPrice: 4590 },
  { code: 'BLR-200', description: 'Boiler de acumulação 200 L', unitPrice: 3790 },
  { code: 'LRL-900', description: 'Lareira a lenha 90 cm com vidro', unitPrice: 6490 },
  { code: 'PIS-AQ3', description: 'Aquecedor de piscina 3 kW', unitPrice: 4190 },
  { code: 'CHM-150', description: 'Chaminé inox 150 mm (kit 3 m)', unitPrice: 1290 },
  { code: 'KIT-INS', description: 'Kit de instalação hidráulica', unitPrice: 480 },
  { code: 'VLV-GAS', description: 'Válvula de segurança para gás', unitPrice: 190 },
  { code: 'SRV-INS', description: 'Serviço de instalação e teste', unitPrice: 650 },
];
