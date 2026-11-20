// Bakes a hand-drawn wobble into the small doodle icons (theme toggle, close, streak flame).
// Run: node scripts/doodle-paths.mjs  ->  writes components/doodles/paths.js
//
// Each stroke is resampled every ~5% of the icon size, pushed sideways by smooth
// low-frequency noise (~1.5% of the size), open ends overshoot a little, and closed
// shapes leave a small gap where the pen lifts. The seed is fixed so the set stays
// consistent; tune SEED / AMP / STEP here and re-run.
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SEED = 18;
const SIZE = 32; // icon viewBox
const STEP = SIZE * 0.05;
const AMP = SIZE * 0.022;

function rng(seed) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
const rand = rng(SEED);

// smooth 1D value noise along the stroke
function noise1d(knots) {
	const v = Array.from({length: knots + 2}, () => rand() * 2 - 1);
	return (t) => {
		const x = t * knots;
		const i = Math.floor(x);
		const f = x - i;
		const u = f * f * (3 - 2 * f);
		return v[i] * (1 - u) + v[i + 1] * u;
	};
}

const len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

function resample(pts) {
	const total = pts.slice(1).reduce((s, p, i) => s + len(pts[i], p), 0);
	const n = Math.max(3, Math.round(total / STEP));
	const out = [];
	let seg = 0;
	let acc = 0;
	for (let k = 0; k <= n; k++) {
		const d = (total * k) / n;
		while (seg < pts.length - 2 && acc + len(pts[seg], pts[seg + 1]) < d) {
			acc += len(pts[seg], pts[seg + 1]);
			seg++;
		}
		const a = pts[seg];
		const b = pts[seg + 1];
		const l = len(a, b) || 1;
		const t = Math.min(1, (d - acc) / l);
		out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
	}
	return out;
}

function wobble(pts, {amp = AMP, knots = 3, overshoot = 0, closed = false} = {}) {
	let p = resample(pts);
	if (closed) {
		// stop short of the start so the pen leaves a tiny gap, and drift slightly past it
		p = p.slice(0, -1);
	}
	const nz = noise1d(knots);
	const res = p.map((pt, i) => {
		const a = p[Math.max(0, i - 1)];
		const b = p[Math.min(p.length - 1, i + 1)];
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const l = Math.hypot(dx, dy) || 1;
		const off = nz(i / (p.length - 1)) * amp;
		return [pt[0] + (-dy / l) * off, pt[1] + (dx / l) * off];
	});
	if (overshoot) {
		const ext = (from, to) => {
			const l = len(from, to) || 1;
			return [to[0] + ((to[0] - from[0]) / l) * overshoot, to[1] + ((to[1] - from[1]) / l) * overshoot];
		};
		res.push(ext(res[res.length - 2], res[res.length - 1]));
		res.unshift(ext(res[1], res[0]));
	}
	return toPath(res);
}

// Catmull-Rom through the points -> cubic beziers
function toPath(p) {
	const f = (n) => +n.toFixed(2);
	let d = `M${f(p[0][0])} ${f(p[0][1])}`;
	for (let i = 0; i < p.length - 1; i++) {
		const p0 = p[Math.max(0, i - 1)];
		const p1 = p[i];
		const p2 = p[i + 1];
		const p3 = p[Math.min(p.length - 1, i + 2)];
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
	}
	return d;
}

const arc = (cx, cy, r, a0, a1, n = 40) =>
	Array.from({length: n + 1}, (_, i) => {
		const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
		return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
	});

// ---- sun: a lumpy circle plus eight ticks
const sunBody = wobble(arc(16, 16, 6.2, -100, 248), {knots: 3, closed: true, amp: AMP * 1.1});
const sunTicks = Array.from({length: 8}, (_, i) => {
	const a = (i * 45 - 90 + (rand() * 10 - 5)) * (Math.PI / 180);
	const r0 = 9.6 + rand() * 0.6;
	const r1 = 12.6 + rand() * 1.2;
	return wobble(
		[
			[16 + r0 * Math.cos(a), 16 + r0 * Math.sin(a)],
			[16 + r1 * Math.cos(a), 16 + r1 * Math.sin(a)],
		],
		{knots: 1, amp: AMP * 0.4},
	);
});

// ---- moon: a crescent (outer arc of one circle, back along the inner arc of another)
// outer circle C1 (15,17) r 10, bite circle C2 (21,12) r 8.5
function circleIntersections(c1, r1, c2, r2) {
	const d = len(c1, c2);
	const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
	const h = Math.sqrt(r1 * r1 - a * a);
	const mx = c1[0] + (a * (c2[0] - c1[0])) / d;
	const my = c1[1] + (a * (c2[1] - c1[1])) / d;
	return [
		[mx + (h * (c2[1] - c1[1])) / d, my - (h * (c2[0] - c1[0])) / d],
		[mx - (h * (c2[1] - c1[1])) / d, my + (h * (c2[0] - c1[0])) / d],
	];
}
const C1 = [15, 17];
const R1 = 10;
const C2 = [21.5, 11.5];
const R2 = 8.2;
const [i1, i2] = circleIntersections(C1, R1, C2, R2);
const ang = (c, p) => (Math.atan2(p[1] - c[1], p[0] - c[0]) * 180) / Math.PI;
// pick the arc between two angles whose midpoint passes the test (inside/outside the other circle)
function pickArc(c, r, from, to, keep) {
	let a0 = ang(c, from);
	let a1 = ang(c, to);
	if (a1 < a0) a1 += 360;
	const mid = ((a0 + a1) / 2) * (Math.PI / 180);
	const m = [c[0] + r * Math.cos(mid), c[1] + r * Math.sin(mid)];
	return keep(m) ? arc(c[0], c[1], r, a0, a1, 50) : arc(c[0], c[1], r, a0, a1 - 360, 50);
}
const outerArc = pickArc(C1, R1, i1, i2, (m) => len(m, C2) > R2);
const tail = outerArc[outerArc.length - 1];
const [ia, ib] = len(tail, i1) < len(tail, i2) ? [i1, i2] : [i2, i1];
const inner = pickArc(C2, R2, ia, ib, (m) => len(m, C1) < R1);
const moonBody = wobble([...outerArc, ...inner.slice(1)], {knots: 4, amp: AMP, closed: false, overshoot: 0.6});
// a small twinkle: two short crossing ticks
const twinkle = [
	wobble([[28.4, 21.8], [28.7, 26.4]], {knots: 1, amp: AMP * 0.3}),
	wobble([[26.3, 24.2], [30.8, 23.9]], {knots: 1, amp: AMP * 0.3}),
];

// ---- close: two loose crossing strokes
const close = [
	wobble([[9, 9.5], [23, 22.5]], {knots: 2, amp: AMP * 0.6, overshoot: 0.8}),
	wobble([[22.5, 9], [9.5, 23]], {knots: 2, amp: AMP * 0.6, overshoot: 0.8}),
];

// ---- flame (streak): one teardrop stroke with a small inner lick
const flameOuter = wobble(
	[
		[15.5, 4.5],
		[18.5, 9.5],
		[22.5, 14.5],
		[23.2, 20],
		[20.6, 25.4],
		[15.8, 27.4],
		[11.2, 25.4],
		[8.8, 20.4],
		[10.4, 15],
		[13.6, 10.4],
		[15.5, 4.5],
	],
	{knots: 3, amp: AMP * 0.45, closed: true},
);
const flameInner = wobble(
	[
		[16, 16.5],
		[18.2, 21.2],
		[16, 24.2],
		[13.8, 21.4],
		[16, 16.5],
	],
	{knots: 2, amp: AMP * 0.25, closed: true},
);

// ---- star (ratings): five points, drawn in one go, the pen stops just short of closing
const starPts = Array.from({length: 11}, (_, i) => {
	const r = i % 2 === 0 ? 12 : 5.4;
	const a = ((i * 36 - 90) * Math.PI) / 180;
	return [16 + r * Math.cos(a), 16.8 + r * Math.sin(a)];
});
const star = wobble(starPts, {knots: 4, amp: AMP * 0.35, closed: false, overshoot: 0.6});

const out = {
	sun: [sunBody, ...sunTicks],
	moon: [moonBody],
	twinkle,
	close,
	flame: [flameOuter, flameInner],
	star: [star],
};

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'components', 'doodles', 'paths.js');
mkdirSync(dirname(file), {recursive: true});
writeFileSync(
	file,
	`// Generated by scripts/doodle-paths.mjs (seed ${SEED}). Do not edit by hand; re-run the script.\nexport const doodlePaths = ${JSON.stringify(out, null, '\t')};\n`,
);
console.log('wrote', file);
