
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Splash from './routes/Splash.tsx';
import Forge from './routes/Forge.tsx';
import Anvil from './routes/Anvil.tsx';

const router = createBrowserRouter([
  { path: '/', element: <Splash /> },
  { path: '/forge', element: <Forge /> },
  { path: '/anvil', element: <Anvil /> },
  // Optionally redirect unknown paths back to Splash:
  { path: '*', element: <Splash /> },
]);

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
