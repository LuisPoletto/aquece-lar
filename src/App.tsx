import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CustomersPage } from '@/pages/CustomersPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { QuotesPage } from '@/pages/QuotesPage';
import { QuoteDetailPage } from '@/pages/QuoteDetailPage';
import { SellersPage } from '@/pages/SellersPage';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orcamentos/novo" element={<PlaceholderPage />} />
            <Route path="orcamentos/:id/pdf" element={<QuoteDetailPage />} />
            <Route path="orcamentos/:id" element={<QuoteDetailPage />} />
            <Route path="orcamentos" element={<QuotesPage />} />
            <Route path="vendedores" element={<SellersPage />} />
            <Route path="clientes" element={<CustomersPage />} />
            <Route path="produtos" element={<PlaceholderPage />} />
            <Route path="linhas" element={<PlaceholderPage />} />
            <Route path="fotos" element={<PlaceholderPage />} />
            <Route path="fluxogramas" element={<PlaceholderPage />} />
            <Route path="conversas" element={<PlaceholderPage />} />
            <Route path="equivalencias" element={<PlaceholderPage />} />
            <Route path="configuracoes" element={<PlaceholderPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
