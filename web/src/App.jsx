// web/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Splash from "./routes/Splash";
import Anvil from "./routes/Anvil";
import Tongs from "./routes/tongs";
import { useForgeBus } from "./forgeBus";

export default function App() {
  useForgeBus();
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
  <Route path="/tools/anvil" element={<Anvil />} />
  <Route path="/tools/tongs" element={<Tongs />} />
  <Route path="/tools/Tongs" element={<Navigate to="/tools/tongs" replace />} />
  <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
