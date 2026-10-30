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
- Rotas do menu existem; telas além do dashboard são placeholders até a próxima etapa

O backend ainda não faz parte deste projeto. Para ligar uma API, substitua `src/services/dashboardService.ts` e os mocks em `src/services/mocks/`.
