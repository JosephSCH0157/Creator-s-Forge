
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import Splash from "./routes/Splash";        // Splash.tsx
import Units from "./Units.jsx";             // ok as .jsx
import UnitDetail from "./UnitDetail.jsx";   // ok as .jsx

import Forge from "./routes/Forge";
import Anvil from "./routes/Anvil";
import Hammer from "./routes/Hammer";
import Quench from "./routes/Quench";
import Ledger from "./routes/Ledger";
import Stock from "./routes/Stock";

import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <Splash /> },          // HOME = Splash
  { path: "/tools/tongs", element: <Units /> },
  { path: "/units/:id", element: <UnitDetail /> },
  { path: "/tools/forge", element: <Forge /> },
  { path: "/tools/anvil", element: <Anvil /> },
  { path: "/tools/hammer", element: <Hammer /> },
  { path: "/tools/quench", element: <Quench /> },
  { path: "/tools/ledger", element: <Ledger /> },
  { path: "/tools/stock", element: <Stock /> },
  { path: "/teleprompter", element: <Navigate to="/teleprompter_pro.html" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
