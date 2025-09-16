import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Anvil from '@/routes/Anvil';
import Forge from '@/routes/Forge';
import Hammer from '@/routes/Hammer';
import Layout from '@/routes/Layout';
import Ledger from '@/routes/Ledger';
import { PATHS } from '@/routes/paths';
import Quench from '@/routes/Quench';
import Splash from '@/routes/Splash';
import Stock from '@/routes/Stock';
import Tongs from '@/routes/Tongs';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Splash />} />
        <Route path={PATHS.forge} element={<Forge />} />
        <Route path={PATHS.anvil} element={<Anvil />} />
        <Route path={PATHS.hammer} element={<Hammer />} />
        <Route path={PATHS.quench} element={<Quench />} />
        <Route path={PATHS.ledger} element={<Ledger />} />
        <Route path={PATHS.stock} element={<Stock />} />
        <Route path={PATHS.tongs} element={<Tongs />} />
        <Route path={`${PATHS.tongs}/:projectId`} element={<Tongs />} />
        <Route path="*" element={<Navigate to={PATHS.root} replace />} />
      </Route>
    </Routes>
  </BrowserRouter>,
);
