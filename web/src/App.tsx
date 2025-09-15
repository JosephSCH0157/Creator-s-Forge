// web/src/App.jsx

import { Routes, Route, Link } from 'react-router-dom';
import Splash from './routes/Splash';
import Anvil from './routes/Anvil';
import Tongs from './routes/Tongs';

export default function App() {
  return (
    <>
      <nav className="topbar">
        <Link to="/forge">Forge</Link>
        <Link to="/tools/anvil">Anvil</Link>
        <Link to="/tools/tongs">TONGS</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/forge" element={<Splash />} />
        <Route path="/tools/anvil" element={<Anvil />} />
        <Route path="/tools/tongs" element={<Tongs />} />
        {/* Add other tools here */}
      </Routes>
    </>
  );
}
