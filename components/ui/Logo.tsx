"use client";

interface Props { size?: number; }

export function LogoMark({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--blue)" />
          <stop offset="100%" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lm-g)" />
      {/* P made of clean rectangles — simple, sharp, unambiguous */}
      <rect x="9"    y="9"    width="2.5" height="14"   rx="1.25" fill="white" />
      <rect x="9"    y="9"    width="10"  height="2.5"  rx="1.25" fill="white" />
      <rect x="9"    y="15.75" width="8"  height="2.5"  rx="1.25" fill="white" />
      <rect x="16.5" y="9"    width="2.5" height="9.25" rx="1.25" fill="white" />
    </svg>
  );
}

export function LogoFull({ size = 28 }: Props) {
  return (
    <div className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
      <LogoMark size={size} />
      <span
        className="font-display"
        style={{
          fontSize: `${Math.round(size * 0.58)}px`,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "var(--t1)",
        }}
      >
        Perceiva
      </span>
    </div>
  );
}
