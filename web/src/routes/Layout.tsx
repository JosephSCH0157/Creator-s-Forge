
import { NavLink, linkClass } from "@/ui/nav";
import { Outlet } from "react-router-dom";

import ReturnHome from '@/components/ReturnHome';

export default function Layout() {


  return (
    <div className="layout-root">
      <header className="layout-header">
        <NavLink to="/" className={linkClass}>Splash</NavLink>
        <NavLink to="/forge" className={linkClass}>Forge</NavLink>
        <NavLink to="/tools/anvil" className={linkClass}>Anvil</NavLink>
        <NavLink to="/tools/tongs" className={linkClass}>Tongs</NavLink>
        <NavLink to="/tools/hammer" className={linkClass}>Hammer</NavLink>
        <NavLink to="/tools/quench" className={linkClass}>Quench</NavLink>
        <NavLink to="/tools/ledger" className={linkClass}>Ledger</NavLink>
        <NavLink to="/tools/stock" className={linkClass}>Bar Stock</NavLink>
        <ReturnHome />
      </header>
      <Outlet />
    </div>
  );
}
