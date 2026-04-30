interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 28 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6b8fd4" />
          <stop offset="100%" stopColor="#9b7fe8" />
        </linearGradient>
        <linearGradient id="logo-mark" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="100%" stopColor="#c4d8ff" stopOpacity={0.88} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-bg)" />
      <rect width="32" height="32" rx="9" fill="white" fillOpacity={0.08} />
      <path
        d="M10 8h7.2c2.65 0 4.3 1.55 4.3 3.9 0 2.38-1.65 3.95-4.3 3.95H13v6.15H10V8z"
        fill="url(#logo-mark)"
      />
      <path
        d="M13 10.5v4.85h4c1.2 0 1.95-.82 1.95-2.42 0-1.58-.75-2.43-1.95-2.43H13z"
        fill="url(#logo-bg)"
        fillOpacity={0.45}
      />
    </svg>
  );
}

export function LogoFull({ size = 28 }: LogoMarkProps) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className="font-display font-700 tracking-tight"
        style={{
          fontSize: `${Math.round(size * 0.62)}px`,
          color: "var(--text-primary)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Perceiva
      </span>
    </div>
  );
}
