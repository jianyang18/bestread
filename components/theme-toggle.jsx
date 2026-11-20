"use client";

import { useEffect, useState } from "react";
import { doodlePaths } from "@/components/doodles/paths";

// Hand-drawn sun / moon. The wobble is baked into the paths (scripts/doodle-paths.mjs),
// the icon draws itself in when it appears, and hover gives it a small nudge.
export function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setDrawn(true);
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    document.documentElement.classList.toggle("dark", next === "dark");
    // keep the phone's status bar (installed app) the same colour as the page
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.setAttribute("content", next === "dark" ? "#151513" : "#ffffff"));
  }

  // Reserve space during SSR/before hydration to avoid layout shift
  if (!theme) return <span className="inline-block w-8 h-8" aria-hidden />;

  const label = `switch to ${theme === "dark" ? "light" : "dark"} mode`;
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="doodle-toggle group relative inline-flex h-8 w-8 items-center justify-center text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-full"
    >
      <svg
        key={theme}
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={drawn ? "is-drawing" : undefined}
      >
        {isDark ? (
          // in dark mode, offer the sun
          <g className="doodle-sun">
            {doodlePaths.sun.map((d, i) => (
              <path
                key={i}
                d={d}
                pathLength="1"
                className={i === 0 ? "doodle-sun-body" : "doodle-sun-tick"}
                style={{ "--i": i }}
              />
            ))}
          </g>
        ) : (
          // in light mode, offer the moon (with a small twinkle)
          <g className="doodle-moon">
            {doodlePaths.moon.map((d, i) => (
              <path key={i} d={d} pathLength="1" className="doodle-moon-body" style={{ "--i": 0 }} />
            ))}
            <g className="doodle-twinkle">
              {doodlePaths.twinkle.map((d, i) => (
                <path key={i} d={d} pathLength="1" style={{ "--i": 3 + i }} />
              ))}
            </g>
          </g>
        )}
      </svg>
    </button>
  );
}
