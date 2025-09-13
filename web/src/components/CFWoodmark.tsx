import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional text for tooltip/ARIA; defaults to “Podcaster’s Forge” */
  title?: string;
};

const CFWoodmark: React.FC<Props> = ({ className, title, ...rest }) => {
  const label = title ?? "Podcaster’s Forge";
  return (
    <div
      className={className}
      title={label}
      aria-label={label}
      role="img"
      {...rest}
    >
      {/* replace with your actual woodmark asset */}
      <img
        src="/creators-forge-logo.png"
        alt={label}
        style={{ height: 40 }}
      />
    </div>
  );
};

export default CFWoodmark;
