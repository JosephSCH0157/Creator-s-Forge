import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./routes/Layout.jsx";
import Splash from "./routes/splash.jsx";
import Units from "./Units.jsx";
import UnitDetail from "./UnitDetail.jsx";
import Forge from "./routes/Forge.jsx";
import Anvil from "./routes/Anvil.jsx";
import Hammer from "./routes/Hammer.jsx";
import Quench from "./routes/Quench.jsx";
import Ledger from "./routes/Ledger.jsx";
import Stock from "./routes/Stock.jsx";
import "./index.css";

const NotFound = () => <div style={{ padding: 24 }}>Not Found</div>;

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Splash /> },
      { path: "/tools/tongs", element: <Units /> },
      { path: "/units/:id", element: <UnitDetail /> },
      { path: "/tools/forge", element: <Forge /> },
      { path: "/tools/anvil", element: <Anvil /> },
      { path: "/tools/hammer", element: <Hammer /> },
      { path: "/tools/quench", element: <Quench /> },
      { path: "/tools/ledger", element: <Ledger /> },
      { path: "/tools/stock", element: <Stock /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
