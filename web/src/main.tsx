
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/routes/Layout';
import Splash from '@/routes/Splash';
import Forge from '@/routes/Forge';
import Anvil from '@/routes/Anvil';
import Hammer from '@/routes/Hammer';
import Quench from '@/routes/Quench';
import Ledger from '@/routes/Ledger';
import Stock from '@/routes/Stock';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Splash />} />
          <Route path="forge" element={<Forge />} />
          <Route path="anvil" element={<Anvil />} />
          <Route path="hammer" element={<Hammer />} />
          <Route path="quench" element={<Quench />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="stock" element={<Stock />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
} else {
  throw new Error('Root element not found');
}
