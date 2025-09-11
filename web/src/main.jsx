import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Splash from "./assets/splash.jsx";
import App from "./App.jsx";           // optional, if you use it as a layout
import Units from "./Units.jsx";       // Tongs
import UnitDetail from "./UnitDetail.jsx";
import "./index.css";

const Placeholder = ({ name }) => (
  <div style={{ padding: 24, fontFamily: "system-ui" }}>
    <h1>{name}</h1>
    <p>This is the {name} module — coming soon.</p>
  </div>
);

const router = createBrowserRouter([
  // Root shows Splash
  { path: "/", element: <Splash /> },

  // Tongs routes
  { path: "/tools/tongs", element: <Units /> },
  { path: "/units/:id", element: <UnitDetail /> }, // detail keeps working

  // Other tools
  {
    path: "/tools",
    children: [
      { path: "forge", element: <Placeholder name="Forge" /> },
      { path: "anvil", element: <Placeholder name="Anvil" /> },
      { path: "hammer", element: <Placeholder name="Hammer" /> },
      { path: "quench", element: <Placeholder name="Quench" /> },
      { path: "ledger", element: <Placeholder name="Ledger" /> },
      { path: "stock",  element: <Placeholder name="Bar Stock" /> },
      { path: "tongs",  element: <Placeholder name="Tongs" /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
