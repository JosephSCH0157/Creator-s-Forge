import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import UnitDetail from "./UnitDetail.jsx";

const Placeholder = ({ name }) => (
  <div style={{ padding: 24, fontFamily: "system-ui" }}>
    <h1>{name}</h1>
    <p>This is the {name} module — content coming soon.</p>
  </div>
);

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/units/:id", element: <UnitDetail /> },
  {
    path: "/tools",
    children: [
      { path: "forge", element: <Placeholder name="Forge" /> },
      { path: "anvil", element: <Placeholder name="Anvil" /> },
      { path: "hammer", element: <Placeholder name="Hammer" /> },
      { path: "tongs", element: <Placeholder name="Tongs" /> },
      { path: "quench", element: <Placeholder name="Quench" /> },
      { path: "ledger", element: <Placeholder name="Ledger" /> },
      { path: "stock", element: <Placeholder name="Bar Stock" /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
