# Aquece Lar — Orçamentos (frontend)

Aplicação React do dashboard Aquece Lar, convertida a partir do mockup HTML em `prototipo/`. Apenas o frontend: os dados vêm de mocks locais, com a mesma assinatura que um serviço HTTP futuro usaria.

## Stack

- React 19 + TypeScript
- Vite
- React Router
- CSS Modules + variáveis CSS do design original (tema claro/escuro)

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Outros scripts:

```bash
npm run typecheck
npm run build
npm run preview
```

## Estrutura

```
src/
  components/     UI compartilhada (ícones, layout)
  config/         navegação
  contexts/       tema claro/escuro
  features/       dashboard (KPIs, gráfico, ranking, tabela)
  lib/            formatação pt-BR
  pages/          rotas
  services/       acesso a dados (hoje: mocks)
  styles/         tokens globais
prototipo/        mockup HTML original (referência visual)
```

## Comportamento atual

- Dashboard com período filtrável, KPIs, gráfico diário (quantidade/valor), ranking e últimos orçamentos
- Sidebar recolhível no desktop e gaveta no mobile
- Tema claro/escuro persistido em `localStorage`
- Orçamentos: lista com período, busca, filtro de status e paginação; detalhe com troca de status e PDF pela impressão do navegador; criação de orçamento com cliente, vendedor, itens do catálogo, desconto (% ou R$, sugerido pela condição de pagamento) e condições; edição de pendentes e cópia de qualquer orçamento
- Vendedores e clientes: listagem com busca e filtros, cadastro, edição e exclusão
- Produtos, linhas, fotos, fluxogramas, conversas, equivalências e configurações ainda são placeholders

Cadastros, edições, mudanças de status e orçamentos novos ficam em memória e se perdem ao recarregar a página.

O backend ainda não faz parte deste projeto. Para ligar uma API, substitua as funções em `src/services/` (mantendo as assinaturas) e remova os mocks em `src/services/mocks/`.
