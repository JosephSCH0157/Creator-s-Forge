

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
import { PATHS } from '@/routes/paths';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
  <Route index element={<Splash />} />
  <Route path={PATHS.forge}  element={<Forge />} />
  <Route path={PATHS.anvil}  element={<Anvil />} />
  <Route path={PATHS.hammer} element={<Hammer />} />
  <Route path={PATHS.quench} element={<Quench />} />
  <Route path={PATHS.ledger} element={<Ledger />} />
  <Route path={PATHS.stock}  element={<Stock />} />
  <Route path="*" element={<Navigate to={PATHS.root} replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
