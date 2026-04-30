"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all btn-outline ${className}`}
      style={{ padding: 0 }}
    >
      {theme === "dark"
        ? <Sun size={15} style={{ color: "var(--t2)" }} />
        : <Moon size={15} style={{ color: "var(--t2)" }} />}
    </button>
  );
}
