"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeCtxType {
  theme: Theme;
  toggle: (e: React.MouseEvent) => void;
}

const ThemeCtx = createContext<ThemeCtxType>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with dark — the inline script in layout.tsx sets data-theme immediately
  // so there's no visible flash even before this state updates
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("perceiva-theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(stored ?? preferred);
  }, []);

  function toggle(e: React.MouseEvent) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const x = e.clientX;
    const y = e.clientY;

    const apply = () => {
      setTheme(next);
      localStorage.setItem("perceiva-theme", next);
      document.documentElement.setAttribute("data-theme", next);
    };

    const vt = (document as any).startViewTransition;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!vt || reduced) {
      apply();
      return;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      apply();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 480,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
