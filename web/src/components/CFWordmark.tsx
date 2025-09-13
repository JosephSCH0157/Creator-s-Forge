// src/components/CFWordmark.tsx
import React from "react";

type Props = { className?: string };

export default function CFWordmark({ className }: Props) {
  return (
    <a
      href="/"
      aria-label="Podscaster’s Forge — Home"
      className={className}
      style={{ textDecoration: "none" }}
    >
      <svg
        width="220" height="48" viewBox="0 0 220 48" role="img"
        aria-labelledby="cfTitle"
      >
  <title id="cfTitle">Podcaster’s Forge</title>
        <defs>
          <linearGradient id="cfFire" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopOpacity="1" stopColor="#ffb561" />
            <stop offset="50%" stopOpacity="1" stopColor="#ff7a2a" />
            <stop offset="100%" stopOpacity="1" stopColor="#ff3d00" />
          </linearGradient>
          <filter id="cfGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Anvil/ember mark */}
        <g transform="translate(4,6)" filter="url(#cfGlow)">
          <path
            d="M14 22 h20 l2 4 h-8 l-2 4 h-12 l2-4 h-8 z"
            fill="url(#cfFire)"
          />
          <circle cx="34" cy="6" r="3" fill="url(#cfFire)" />
        </g>

        {/* Wordmark */}
        <g transform="translate(56,12)">
          <text x="0" y="14"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
            fontWeight={800}
            fontSize="18"
            fill="#ffffff"
            style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.45)", strokeWidth: 1 }}
          >
              Podcaster’s
          </text>
          <text x="96" y="14"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
            fontWeight={800}
            fontSize="18"
            fill="url(#cfFire)"
            style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.45)", strokeWidth: 1 }}
          >
            Forge
          </text>
          <text x="0" y="34"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
            fontWeight={500}
            fontSize="11"
            fill="rgba(255,255,255,.9)"
            style={{ letterSpacing: ".06em" }}
          >
            make · refine · publish
          </text>
        </g>
      </svg>
    </a>
  );
}
