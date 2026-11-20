// The bestRead app icon: the tiny reader peeking out of the gutter of a big open book,
// hands on the page tops, with the tea-amber bookmark ribbon hanging from the spine.
//
// Run: node scripts/app-icon.mjs
//   -> writes public/icons/*.svg, and the PNG sizes when playwright is installed
//      (npx -y playwright@1 is enough; it is not a project dependency).
//
// Like the hero doodle, the wobble lives in hand-authored uneven beziers, no filter.
// Everything sits inside the maskable safe zone (a circle of radius 40% around the centre),
// so one drawing serves the "any" icon, the maskable icon and the apple-touch-icon.
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

// the same paper / ink / accent as app/globals.css
export const THEMES = {
	light: {paper: '#ffffff', ink: '#000000', accent: '#e8a33d'},
	dark: {paper: '#151513', ink: '#eeede8', accent: '#ebaa48'},
};

// drawn on a 512 canvas; the art's own centre is around (256, 300), so it is lifted by 44
const PAGES =
	'M256 262 C222 236 158 228 104 244 C106 284 107 320 110 362 C164 344 222 348 256 372 C290 348 346 343 401 360 C404 322 406 282 408 242 C356 230 292 236 256 262 Z';
const HEAD = 'M256 269 C230 268 212 250 213 224 C214 200 232 181 258 180 C284 180 302 200 301 226 C300 252 282 270 256 269 Z';
const CURL = 'M232 186 C220 176 220 160 233 158 C244 157 245 170 236 172';
const HANDS = [
	'M168 246 C164 230 176 221 188 224 C199 227 203 237 200 244',
	'M314 242 C312 227 323 220 335 223 C346 226 349 236 346 246',
];
const BOOK = [
	'M256 262 C222 236 158 228 104 244',
	'M104 244 C106 284 107 320 110 362',
	'M110 362 C164 344 222 348 256 372',
	'M256 262 C292 236 356 230 408 242',
	'M408 242 C406 282 404 322 401 360',
	'M401 360 C346 343 290 348 256 372',
	'M256 266 C257 300 255 336 256 370',
	// page edges underneath
	'M114 380 C167 363 222 366 256 391 C290 366 346 361 398 378',
];
const TEXT_LINES = [
	'M136 276 C162 268 196 267 228 271',
	'M139 302 C160 296 184 296 206 298',
	'M286 272 C314 266 344 265 374 269',
];
const RIBBON = 'M259 392 C268 412 250 424 263 452';


// ---- roughing: turns the tidy beziers above into a slow, childlike pen line ----
// Each stroke is sampled, pushed sideways by smooth low-frequency noise (the hand drifting)
// plus a little high-frequency tremor, open ends overshoot past where they should stop,
// and closed shapes leave a gap or overlap where the pen lifts. Seeded, so re-runs match.
// Tune ROUGH to make the whole icon calmer or wilder.
const ROUGH = {seed: 7, drift: 7, tremor: 0.25, overshoot: 14, step: 9};

function rng(seed) {
	let x = seed >>> 0;
	return () => {
		x = (x + 0x6d2b79f5) >>> 0;
		let t = x;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function sampleCubics(d) {
	const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
	const pts = [[nums[0], nums[1]]];
	for (let i = 2; i + 5 < nums.length; i += 6) {
		const p0 = pts[pts.length - 1];
		const [x1, y1, x2, y2, x3, y3] = nums.slice(i, i + 6);
		for (let k = 1; k <= 24; k++) {
			const t = k / 24;
			const u = 1 - t;
			pts.push([
				u * u * u * p0[0] + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
				u * u * u * p0[1] + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
			]);
		}
	}
	return pts;
}

function resample(pts, step) {
	const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
	const total = seg.reduce((a, b) => a + b, 0);
	const n = Math.max(4, Math.round(total / step));
	const out = [];
	let j = 0;
	let acc = 0;
	for (let k = 0; k <= n; k++) {
		const want = (total * k) / n;
		while (j < seg.length - 1 && acc + seg[j] < want) acc += seg[j++];
		const t = Math.min(1, (want - acc) / (seg[j] || 1));
		out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t]);
	}
	return {pts: out, total};
}

function noise(rand, knots) {
	const v = Array.from({length: knots + 2}, () => rand() * 2 - 1);
	return (t) => {
		const x = t * knots;
		const i = Math.min(knots, Math.floor(x));
		const f = x - i;
		const u = f * f * (3 - 2 * f);
		return v[i] * (1 - u) + v[i + 1] * u;
	};
}

const smooth = (p) => {
	// Catmull-Rom through the points, written as cubic beziers
	let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
	for (let i = 0; i < p.length - 1; i++) {
		const a = p[Math.max(0, i - 1)];
		const b = p[i];
		const c = p[i + 1];
		const e = p[Math.min(p.length - 1, i + 2)];
		const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
		const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
		d += ` C${c1.map((n) => n.toFixed(1)).join(' ')} ${c2.map((n) => n.toFixed(1)).join(' ')} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
	}
	return d;
};

let strokeNo = 0;
function rough(d, {closed = /Z\s*$/.test(d), scale = 1} = {}) {
	const rand = rng(ROUGH.seed * 1000 + strokeNo++);
	const {pts, total} = resample(sampleCubics(d), ROUGH.step);
	const drift = noise(rand, Math.max(2, Math.round(total / 110)));
	const amp = ROUGH.drift * scale;
	let p = pts.map((pt, i) => {
		const a = pts[Math.max(0, i - 1)];
		const b = pts[Math.min(pts.length - 1, i + 1)];
		const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const off = drift(i / (pts.length - 1)) * amp + (rand() * 2 - 1) * ROUGH.tremor * scale;
		return [pt[0] + (-(b[1] - a[1]) / l) * off, pt[1] + ((b[0] - a[0]) / l) * off];
	});
	const ext = (from, to, len) => {
		const l = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
		return [to[0] + ((to[0] - from[0]) / l) * len, to[1] + ((to[1] - from[1]) / l) * len];
	};
	if (closed) {
		// the pen comes round, misses the start a little and keeps going
		const over = Math.max(2, Math.round(p.length * 0.06));
		p = [...p, ...p.slice(1, over).map(([x, y]) => [x + 4 * scale, y + 3 * scale])];
	} else {
		const os = ROUGH.overshoot * scale * (0.4 + rand() * 0.9);
		const oe = ROUGH.overshoot * scale * (0.4 + rand() * 0.9);
		p = [ext(p[1], p[0], os), ...p, ext(p[p.length - 2], p[p.length - 1], oe)];
	}
	return smooth(p);
}

/**
 * @param {'light'|'dark'} theme
 * @param {{small?: boolean, scale?: number, transparent?: boolean, rounded?: boolean}} opts
 *   small: heavier pen and fewer strokes, for favicons (16-48px)
 *   scale: art size inside the square (1 = fits the maskable safe zone)
 */
export function iconSvg(theme, {small = false, scale = 1, transparent = false, rounded = false} = {}) {
	const {paper, ink, accent} = THEMES[theme];
	const w = small ? 28 : 11;
	const s = scale.toFixed(3);
	const art = `translate(256 256) scale(${s}) translate(-256 -300)`;
	const bg = transparent
		? ''
		: rounded
			? `<rect width="512" height="512" rx="112" fill="${paper}"/>`
			: `<rect width="512" height="512" fill="${paper}"/>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${bg}
<g transform="${art}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
${(strokeNo = 0, '')}<path d="${small ? HEAD : rough(HEAD)}" fill="${paper}"/>
${small ? '' : `<path d="${rough(CURL)}" stroke-width="${w * 0.9}"/>`}
<path d="${PAGES}" fill="${paper}" stroke="none"/>
${BOOK.slice(0, small ? 7 : 8)
	.map((d, i) => `<path d="${small ? d : rough(d)}"${small ? '' : ` stroke-width="${(w * [1, 0.92, 1.06, 0.96, 1.08, 0.94, 1.02, 0.9][i]).toFixed(1)}"`}/>`)
	.join('\n')}
${small ? '' : HANDS.map((d) => `<path d="${rough(d)}" fill="${paper}"/>`).join('\n')}
${small ? '' : TEXT_LINES.map((d) => `<path d="${rough(d, {scale: 0.7})}" stroke-width="${w * 0.66}"/>`).join('\n')}
<path d="${small ? RIBBON : rough(RIBBON)}" stroke="${accent}"/>
</g>
</svg>
`;
}

// favicon.svg follows the browser theme on its own
function adaptiveFaviconSvg() {
	const L = THEMES.light;
	const D = THEMES.dark;
	return iconSvg('light', {small: true, scale: 1.3, transparent: true})
		.replace(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">',
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<style>
.ink{stroke:${L.ink}}.paper{fill:${L.paper}}
@media (prefers-color-scheme: dark){.ink{stroke:${D.ink}}.paper{fill:${D.paper}}}
</style>`,
		)
		.replace(`stroke="${L.ink}"`, 'class="ink"')
		.replaceAll(`fill="${L.paper}"`, 'class="paper"');
}

// file name -> [svg, png size or null]
export function iconSet() {
	const files = {};
	for (const theme of ['light', 'dark']) {
		const sfx = theme === 'light' ? '' : '-dark';
		files[`icon${sfx}.svg`] = [iconSvg(theme, {scale: 1.12}), null];
		files[`icon-192${sfx}.png`] = [iconSvg(theme, {scale: 1.12}), 192];
		files[`icon-512${sfx}.png`] = [iconSvg(theme, {scale: 1.12}), 512];
		// maskable: full bleed, art kept to the inner 80% so any mask shape keeps it whole
		files[`maskable-192${sfx}.png`] = [iconSvg(theme, {scale: 0.96}), 192];
		files[`maskable-512${sfx}.png`] = [iconSvg(theme, {scale: 0.96}), 512];
		// iOS: opaque, square (iOS rounds the corners itself)
		files[`apple-touch-icon${sfx}.png`] = [iconSvg(theme, {scale: 1.08}), 180];
		// small pen for tabs
		files[`favicon-32${sfx}.png`] = [iconSvg(theme, {small: true, scale: 1.3, rounded: true}), 32];
		files[`favicon-16${sfx}.png`] = [iconSvg(theme, {small: true, scale: 1.3, rounded: true}), 16];
	}
	files['favicon.svg'] = [adaptiveFaviconSvg(), null];
	return files;
}

async function main() {
	mkdirSync(OUT, {recursive: true});
	const files = iconSet();
	for (const [name, [svg, size]] of Object.entries(files)) {
		if (!size) writeFileSync(join(OUT, name), svg);
	}
	let chromium;
	try {
		({chromium} = await import('playwright'));
	} catch {
		try {
			({chromium} = createRequire(import.meta.url)('playwright'));
		} catch {}
	}
	if (!chromium) {
		console.log('playwright not found: wrote the SVGs only');
		return;
	}
	const browser = await chromium.launch();
	const page = await browser.newPage();
	for (const [name, [svg, size]] of Object.entries(files)) {
		if (!size) continue;
		await page.setViewportSize({width: size, height: size});
		const sized = svg.replace('width="512" height="512">', `width="${size}" height="${size}">`);
		await page.setContent(`<html><body style="margin:0;background:transparent">${sized}</body></html>`);
		await page.locator('svg').screenshot({path: join(OUT, name), omitBackground: true});
	}
	await browser.close();
	console.log(`wrote ${Object.keys(files).length} files to public/icons`);
}

main();
