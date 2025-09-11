import { Link, NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  const link = ({ isActive }) => ({
    padding: "6px 10px",
    borderRadius: 8,
    textDecoration: "none",
    color: isActive ? "white" : "#111",
    background: isActive ? "#111827" : "transparent",
  });

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <header style={{ display: "flex", gap: 10, padding: 12, borderBottom: "1px solid #eee" }}>
        <NavLink to="/" style={link}>Splash</NavLink>
        <NavLink to="/tools/tongs" style={link}>Tongs</NavLink>
        <NavLink to="/tools/forge" style={link}>Forge</NavLink>
        <NavLink to="/tools/anvil" style={link}>Anvil</NavLink>
        <NavLink to="/tools/hammer" style={link}>Hammer</NavLink>
        <NavLink to="/tools/quench" style={link}>Quench</NavLink>
        <NavLink to="/tools/ledger" style={link}>Ledger</NavLink>
        <NavLink to="/tools/stock" style={link}>Bar Stock</NavLink>
      </header>
      <Outlet />
    </div>
  );
}
