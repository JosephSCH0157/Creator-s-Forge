
import { NavLink, Outlet, type NavLinkProps } from "react-router-dom";

import ReturnHome from '@/components/ReturnHome';

export default function Layout() {
  const linkStyle: NavLinkProps["style"] = ({ isActive, isPending }) => ({
    padding: "6px 10px",
    borderRadius: 8,
    textDecoration: "none",
    color: isActive ? "white" : "#111",
    background: isActive ? "#111827" : "transparent",
    opacity: isPending ? 0.7 : 1,
  });

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <header style={{ display: "flex", gap: 10, padding: 12, borderBottom: "1px solid #eee" }}>
    <NavLink to="/" style={linkStyle}>Splash</NavLink>
    <NavLink to="/tools/tongs" style={linkStyle}>Tongs</NavLink>
    <ReturnHome />
    <NavLink to="/tools/anvil" style={linkStyle}>Anvil</NavLink>
    <NavLink to="/tools/hammer" style={linkStyle}>Hammer</NavLink>
    <NavLink to="/tools/quench" style={linkStyle}>Quench</NavLink>
    <NavLink to="/tools/ledger" style={linkStyle}>Ledger</NavLink>
    <NavLink to="/tools/stock" style={linkStyle}>Bar Stock</NavLink>
      </header>
      <Outlet />
    </div>
  );
}
