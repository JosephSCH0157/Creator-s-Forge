
import { NavLink, linkClass } from "@/ui/nav";
import { PATHS } from "@/routes/paths";
import { Outlet } from "react-router-dom";

import ReturnHome from '@/components/ReturnHome';

export default function Layout() {


  return (
    <div className="layout-root">
      <header className="layout-header">
  <NavLink to={PATHS.root} className={linkClass}>Splash</NavLink>
  <NavLink to={PATHS.forge} className={linkClass}>Forge</NavLink>
  <NavLink to={PATHS.anvil} className={linkClass}>Anvil</NavLink>
  <NavLink to={PATHS.tongs} className={linkClass}>Tongs</NavLink>
  <NavLink to={PATHS.hammer} className={linkClass}>Hammer</NavLink>
  <NavLink to={PATHS.quench} className={linkClass}>Quench</NavLink>
  <NavLink to={PATHS.ledger} className={linkClass}>Ledger</NavLink>
  <NavLink to={PATHS.stock} className={linkClass}>Bar Stock</NavLink>
        <ReturnHome />
      </header>
      <Outlet />
    </div>
  );
}
