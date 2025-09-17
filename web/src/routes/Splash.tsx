import { Link } from 'react-router-dom';

import CFWordmark from '../components/CFWordmark';

import SplashWithEmbers from './SplashWithEmbers';

import { PATHS } from '@/routes/paths';
import './splash.css';

type Spot = {
  to: string;
  top: number; // 0–100 (%)
  left: number; // 0–100 (%)
  label: string; // forge term
  hover: string; // real tool name
  icon?: string; // optional emoji/icon
};

const SPOTS: Spot[] = [
  { to: PATHS.forge, top: 55, left: 70, label: 'Forge', hover: 'Home', icon: '🔥' },
  { to: PATHS.anvil, top: 80, left: 50, label: 'Anvil', hover: 'Teleprompter', icon: '⚒️' },
  { to: PATHS.tongs, top: 45, left: 25, label: 'Tongs', hover: 'File System', icon: '🗄️' },
  { to: PATHS.hammer, top: 15, left: 35, label: 'Hammer', hover: 'Video Editor', icon: '🔨' },
  { to: PATHS.quench, top: 70, left: 80, label: 'Quench', hover: 'Uploader', icon: '💧' },
  { to: PATHS.ledger, top: 80, left: 65, label: 'Ledger', hover: 'Analytics', icon: '📒' },
  { to: PATHS.stock, top: 85, left: 30, label: 'Bar Stock', hover: 'Ideas', icon: '🧱' },
];

function Hotspot({ s }: { s: Spot }) {
  const style = {
    '--hotspot-top': `${s.top}%`,
    '--hotspot-left': `${s.left}%`,
  } as React.CSSProperties;
  const isExternal = s.to.endsWith('.html');
  if (isExternal) {
    return (
      <a href={s.to} className="hotspot" style={style} aria-label={s.hover} data-hover={s.hover}>
        {s.label}
      </a>
    );
  }
  return (
    <Link to={s.to} className="hotspot" style={style} aria-label={s.hover} data-hover={s.hover}>
      {s.label}
    </Link>
  );
}

export default function SplashRoute() {
  return (
    <div className="splash-root">
      <div className="splash-stage">
        <SplashWithEmbers
          src="/forge.png"
          hearth={{ x: 1010, y: 525, w: 215, h: 120 }}
          spawnRate={100}
          maxEmbers={600}
        />
      </div>

      <CFWordmark className="splash-wordmark brand-glow" />

      {SPOTS.map((s) => (
        <Hotspot key={`${s.left}-${s.top}-${s.to}`} s={s} />
      ))}
    </div>
  );
}
