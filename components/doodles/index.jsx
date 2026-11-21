"use client";

import { useEffect, useState } from "react";
import { doodlePaths } from "@/components/doodles/paths";

// All illustrations are drawn with currentColor so they follow the theme,
// and overlap shapes are filled with the page colour so one sits in front of another.
const PAPER = "hsl(var(--background))";
const ACCENT = "hsl(var(--doodle))";

// The large drawings are hand-authored uneven beziers. A turbulence filter was tried and
// tore the thin strokes at 1x, so the wobble lives in the paths themselves.

// The bestRead reader: round blank head with a single curl of hair, boxy one-piece body,
// tube limbs with rounded cuffs. Always tiny next to the books.

// Hero: a tiny reader lying on top of a giant open book, reading a tiny book.
export function HeroDoodle({ className }) {
  return (
    <svg
      viewBox="40 70 320 250"
      className={className}
      role="img"
      aria-label="a tiny reader lying on top of a giant open book, reading a tiny book"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
       
      >
        {/* the giant open book */}
        <path d="M200 168 C176 150 118 146 58 166" />
        <path d="M58 166 C60 196 61 226 63 258" />
        <path d="M63 258 C118 240 170 242 200 262" />
        <path d="M200 168 C226 150 284 145 342 165" />
        <path d="M342 165 C341 196 339 228 337 257" />
        <path d="M337 257 C284 239 230 242 200 262" />
        <path d="M200 170 C201 200 199 232 200 260" />
        {/* page edges underneath */}
        <path d="M61 266 C116 249 170 251 200 271 C230 251 286 248 339 265" />
        {/* a few lines of text, left page only */}
        <path d="M84 188 C108 181 140 180 176 184" strokeWidth="2.2" />
        <path d="M86 204 C112 198 142 197 170 200" strokeWidth="2.2" />
        <path d="M87 220 C106 215 124 215 144 216" strokeWidth="2.2" />

        {/* the tiny reader, lying on the right page, knee up, reading a tiny book */}
        <g className="doodle-bob">
          <g transform="translate(236 151) rotate(6)">
            {/* legs: one knee up with the foot planted, one stretched out */}
            <path d="M62 -16 C68 -27 73 -36 78 -40 C83 -38 87 -18 91 -4" />
            <path d="M89 -3 C93 -2 98 -2 101 -3" />
            <path d="M63 -6 C78 -5 94 -6 110 -7" />
            <path d="M110 -11 C114 -10 115 -5 111 -3" />
            {/* body */}
            <path
              d="M27 -24 C38 -28 54 -28 64 -24 C68 -17 68 -7 64 -1 C52 2 38 2 27 0 C24 -8 24 -17 27 -24 Z"
              fill={PAPER}
            />
            {/* head, with a single curl of hair */}
            <path
              d="M13 -26 C21 -27 27 -21 27 -13 C27 -5 21 1 13 0 C5 -1 0 -7 1 -14 C2 -21 7 -26 13 -26 Z"
              fill={PAPER}
            />
            <path d="M4 -22 C-2 -25 -3 -32 2 -33 C7 -34 8 -28 4 -27" />
            {/* arms up, holding the book over the face */}
            <path d="M31 -22 C27 -32 22 -41 16 -49" />
            <path d="M42 -24 C40 -34 37 -42 33 -49" />
            {/* the tiny book: the same open book, a hundred times smaller */}
            <path
              d="M8 -61 C14 -65 20 -65 24 -62 C28 -65 34 -65 40 -61 C40 -57 40 -53 40 -50 C34 -53 28 -53 24 -50 C20 -53 14 -53 8 -50 C8 -54 8 -57 8 -61 Z"
              fill={PAPER}
            />
            <path d="M24 -62 C24 -58 24 -54 24 -50" />
          </g>
        </g>
      </g>
      {/* the one accent: a bookmark ribbon slipping out of the spine */}
      <g fill="none" stroke={ACCENT} strokeWidth="3.2" strokeLinecap="round">
        <path d="M204 266 C210 282 198 292 207 310" />
      </g>
    </svg>
  );
}

// The reader sitting on a shelf, legs dangling, one hand shading the eyes. Shared by the
// empty library drawing and the default book cover, so both stay the same figure.
function ShelfReader() {
  return (
    <>
      {/* legs dangling over the edge */}
      <path d="M150 86 C152 96 151 106 149 114" />
      <path d="M149 114 C146 116 142 116 141 114" />
      <path d="M160 86 C163 95 163 104 162 111" />
      <path d="M162 111 C160 114 156 114 154 112" />
      {/* body */}
      <path
        d="M141 62 C149 59 163 59 169 63 C171 71 171 81 169 88 C160 91 148 91 141 88 C139 80 139 70 141 62 Z"
        fill={PAPER}
      />
      {/* head + curl */}
      <path
        d="M155 36 C163 36 168 42 167 49 C166 56 160 60 154 59 C147 58 143 52 144 46 C145 40 149 36 155 36 Z"
        fill={PAPER}
      />
      <path d="M148 39 C143 35 144 29 149 29 C153 29 153 34 150 35" />
      {/* arms: one on the knee, one shading the eyes, looking for books */}
      <path d="M143 68 C138 74 140 82 146 86" />
      <path d="M167 66 C176 60 178 52 170 47" />
    </>
  );
}

// the accent: a few ticks of searching
function SearchTicks({ strokeWidth }) {
  return (
    <g fill="none" stroke={ACCENT} strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M184 40 L191 36" />
      <path d="M186 50 L194 50" />
      <path d="M183 31 L187 25" />
    </g>
  );
}

// Empty library: an empty shelf with the reader sitting on it, legs dangling, waiting.
export function EmptyShelfDoodle({ className }) {
  return (
    <svg viewBox="0 0 260 140" className={className} role="img" aria-label="the tiny reader sitting on an empty shelf">
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* the shelf and its brackets */}
        <path d="M18 92 C80 90 170 93 242 91" />
        <path d="M46 93 C46 104 52 110 60 112" />
        <path d="M212 93 C212 104 206 110 198 112" />
        <ShelfReader />
      </g>
      <SearchTicks strokeWidth="2.2" />
    </svg>
  );
}

// Default cover for a book with no cover image: a hand-drawn cover outline with the shelf
// reader sitting inside it. Size it with className like the cover <Image> it stands in for.
export function BookCoverPlaceholder({ className = "" }) {
  return (
    <div className={`doodle-box border-muted-foreground/60 flex-shrink-0 flex items-center justify-center overflow-hidden ${className}`}>
      <svg viewBox="118 16 88 108" className="w-[86%] h-[86%]" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {/* a short stretch of shelf to sit on */}
          <path d="M122 92 C146 90 178 93 202 91" />
          <ShelfReader />
        </g>
        <SearchTicks strokeWidth="2.8" />
      </svg>
    </div>
  );
}

// Streak flame: baked wobble, the accent colour, sized to sit in a line of text.
export function FlameDoodle({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke={ACCENT}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {doodlePaths.flame.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

// Loading text that "boils" like hand-drawn animation: each letter re-jitters every
// ~120ms and the trailing dots step 0 to 3. Holds still under prefers-reduced-motion.
export function BoilText({ text, className }) {
  const base = text.replace(/\.+$/, "");
  const [tick, setTick] = useState(0);
  // only ever shown after a user action, so reading the media query on first render is safe
  const [still] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setTick((n) => n + 1), 120);
    return () => clearInterval(t);
  }, [still]);

  const jitter = (i) => {
    // cheap deterministic noise per letter and frame
    const r = (k) => {
      const x = Math.sin((i + 1) * 12.9898 + tick * 78.233 + k * 37.719) * 43758.5453;
      return x - Math.floor(x);
    };
    return {
      display: "inline-block",
      transform: `translate(${(r(1) * 2 - 1).toFixed(2)}px, ${(r(2) * 2 - 1).toFixed(2)}px) rotate(${(r(3) * 6 - 3).toFixed(1)}deg) scale(${(0.96 + r(4) * 0.08).toFixed(3)})`,
    };
  };

  const dots = still ? 3 : Math.floor(tick / 3) % 4;

  return (
    <span className={className} aria-live="polite">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {[...base].map((ch, i) => (
          <span key={i} style={still ? undefined : jitter(i)}>
            {ch === " " ? " " : ch}
          </span>
        ))}
        <span className="inline-block w-[1.2em] text-left">{".".repeat(dots)}</span>
      </span>
    </span>
  );
}
