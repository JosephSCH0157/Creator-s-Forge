import { Outlet } from 'react-router-dom';

import ReturnHome from '@/components/ReturnHome';
import { PATHS } from '@/routes/paths';
import { NavLink, linkClass } from '@/ui/nav';

export default function Layout() {
  return (
    <div className="layout-root">
      <header className="layout-header">
        <NavLink to={PATHS.root} className={linkClass}>
          Splash
        </NavLink>
        <a
          href={PATHS.anvil}
          className={
            typeof linkClass === 'function'
              ? linkClass({ isActive: false, isPending: false, isTransitioning: false })
              : linkClass
          }
        >
          Anvil
        </a>
        <NavLink to={PATHS.tongs} className={linkClass}>
          Tongs
        </NavLink>
        <NavLink to={PATHS.hammer} className={linkClass}>
          Hammer
        </NavLink>
        <NavLink to={PATHS.quench} className={linkClass}>
          Quench
        </NavLink>
        <NavLink to={PATHS.ledger} className={linkClass}>
          Ledger
        </NavLink>
        <NavLink to={PATHS.stock} className={linkClass}>
          Bar Stock
        </NavLink>
        <ReturnHome />
      </header>
      <Outlet />
    </div>
  );
}
