"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  // Reserve space during SSR/before hydration to avoid layout shift
  if (!theme) return <span className="inline-block w-5 h-5" aria-hidden />;

  return (
    <button
      onClick={toggle}
      aria-label={`switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="text-xl text-muted-foreground hover:text-foreground transition-colors leading-none"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
