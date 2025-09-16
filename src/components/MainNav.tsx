// src/components/MainNav.tsx
import { NavLink } from 'react-router-dom';
import { PATHS } from 'web/src/routes/paths';

export default function MainNav() {
  return (
    <nav>
      <NavLink to={PATHS.forge}>Forge</NavLink>
      <NavLink to={PATHS.anvil}>Anvil</NavLink>
      <NavLink to={PATHS.hammer}>Hammer</NavLink>
      <NavLink to={PATHS.quench}>Quench</NavLink>
      <NavLink to={PATHS.ledger}>Ledger</NavLink>
      <NavLink to={PATHS.stock}>Stock</NavLink>
    </nav>
  );
}
