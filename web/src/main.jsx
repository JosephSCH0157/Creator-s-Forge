import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import UnitDetail from "./UnitDetail.jsx";
import Splash from "./routes/Splash";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <Splash /> },
  { path: "/units", element: <App /> },
  { path: "/units/:id", element: <UnitDetail /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
