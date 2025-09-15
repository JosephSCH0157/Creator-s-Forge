
import { PATHS } from '@/routes/paths';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Splash />} />
        <Route path={PATHS.forge.slice(1)} element={<Forge />} />
        <Route path={PATHS.anvil.slice(1)} element={<Anvil />} />
        <Route path={PATHS.hammer.slice(1)} element={<Hammer />} />
        <Route path={PATHS.quench.slice(1)} element={<Quench />} />
        <Route path={PATHS.ledger.slice(1)} element={<Ledger />} />
        <Route path={PATHS.stock.slice(1)} element={<Stock />} />
        <Route path="*" element={<Navigate to={PATHS.root} replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
