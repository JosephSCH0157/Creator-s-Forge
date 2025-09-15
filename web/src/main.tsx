
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Splash from './routes/Splash'
import Forge from './routes/Forge'
import Anvil from './routes/Anvil'
// ...etc

const router = createBrowserRouter([
  { path: '/', element: <Splash /> },
  { path: '/forge', element: <Forge /> },
  { path: '/anvil', element: <Anvil /> },
  // { path: '*', element: <Splash /> }  // optional catch-all
])

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<RouterProvider router={router} />);
} else {
  throw new Error('Root element not found');
}
