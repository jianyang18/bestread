// The bestRead app icon: the tiny reader sitting on a shelf with a tiny book on the lap,
// and a few tea-amber ticks.
//
// Run: node scripts/app-icon.mjs
//   -> writes public/icons/*.svg, and the PNG sizes when playwright is installed
//      (npx -y playwright@1 is enough; it is not a project dependency).
//
// The wobble lives in hand-authored uneven beziers, no filter.
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

// The tiny reader from the empty-library doodle, sitting on a shelf with a book on the lap,
// and three tea-amber ticks. Redrawn bold for the home screen: an app icon is seen at ~60px,
// so it uses a thick pen (about 7% of the canvas) and only a handful of big shapes,
// to sit well next to Jian's other doodle icons. Drawn directly on the 512 canvas.

// pen weights as a share of the 512 canvas
const PEN = {icon: 26, favicon: 40};

const SHELF = 'M84 352 C180 347 300 353 428 348';
const BRACKETS = ['M128 356 C128 382 140 396 160 400', 'M386 354 C386 380 374 394 354 398'];
const LEGS = ['M206 346 C208 370 207 394 204 416 C198 422 186 423 178 419', 'M264 346 C267 368 267 390 265 412 C270 418 282 419 290 415'];
const BODY = 'M178 240 C210 232 260 232 292 240 C298 272 299 306 294 342 C258 350 212 350 176 342 C170 306 171 272 178 240 Z';
const HEAD = 'M238 102 C272 102 296 128 295 161 C294 194 268 218 235 217 C202 216 178 190 179 158 C180 126 205 102 238 102 Z';
const CURL = 'M190 120 C168 108 170 76 194 76 C214 76 218 98 204 104';
// solid body (it reads at any size) with the open book as a paper shape on the lap
const BOOK = 'M190 282 C210 273 224 274 235 284 C246 274 260 273 280 282 C280 294 280 306 279 318 C260 310 246 311 235 320 C224 311 210 310 191 318 C191 306 190 294 190 282 Z';
const SPINE = 'M235 288 L235 314';
// the one accent: three chunky ticks, the little spark of a good page
const TICKS = ['M330 128 L348 98', 'M346 170 L380 150', 'M354 214 L392 212'];

/**
 * @param {'light'|'dark'} theme
 * @param {{small?: boolean, scale?: number, transparent?: boolean, rounded?: boolean}} opts
 *   small: heavier pen and fewer strokes, for favicons (16-48px)
 *   scale: art size around the centre; 1 keeps every stroke inside the maskable safe circle
 */
export function iconSvg(theme, {small = false, scale = 1, transparent = false, rounded = false} = {}) {
	const {paper, ink, accent} = THEMES[theme];
	const w = small ? PEN.favicon : PEN.icon;
	const art = `translate(256 256) scale(${scale.toFixed(3)}) translate(-256 -256)`;
	const bg = transparent
		? ''
		: rounded
			? `<rect width="512" height="512" rx="112" fill="${paper}"/>`
			: `<rect width="512" height="512" fill="${paper}"/>`;
	const p = (d, extra = '') => `<path d="${d}"${extra}/>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${bg}
<g transform="${art}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
${p(SHELF)}${small ? '' : BRACKETS.map((d) => p(d)).join('')}
${LEGS.map((d) => p(d)).join('')}
${p(BODY, ` fill="${ink}"`)}
${p(HEAD, ` fill="${paper}"`)}${small ? '' : p(CURL)}
${p(BOOK, ` fill="${paper}" stroke="none"`)}${p(SPINE, ` stroke-width="${w * 0.4}"`)}
</g>
<g transform="${art}" fill="none" stroke="${accent}" stroke-width="${w}" stroke-linecap="round">
${(small ? TICKS.slice(1) : TICKS).map((d) => p(d)).join('')}
</g>
</svg>
`;
}

// favicon.svg follows the browser theme on its own
function adaptiveFaviconSvg() {
	const L = THEMES.light;
	const D = THEMES.dark;
	return iconSvg('light', {small: true, scale: 1.1, transparent: true})
		.replace(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">',
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<style>
.ink{stroke:${L.ink}}.paper{fill:${L.paper}}.inkfill{fill:${L.ink}}.paperline{stroke:${L.paper}}
@media (prefers-color-scheme: dark){.ink{stroke:${D.ink}}.paper{fill:${D.paper}}.inkfill{fill:${D.ink}}.paperline{stroke:${D.paper}}}
</style>`,
		)
		.replace(`stroke="${L.ink}"`, 'class="ink"')
		.replaceAll(`fill="${L.paper}"`, 'class="paper"')
		.replaceAll(`fill="${L.ink}"`, 'class="inkfill"')
		.replaceAll(`stroke="${L.paper}"`, 'class="paperline"');
}

// file name -> [svg, png size or null]
export function iconSet() {
	const files = {};
	for (const theme of ['light', 'dark']) {
		const sfx = theme === 'light' ? '' : '-dark';
		files[`icon${sfx}.svg`] = [iconSvg(theme, {scale: 1.06}), null];
		files[`icon-192${sfx}.png`] = [iconSvg(theme, {scale: 1.06}), 192];
		files[`icon-512${sfx}.png`] = [iconSvg(theme, {scale: 1.06}), 512];
		// maskable: full bleed, art kept to the inner 80% so any mask shape keeps it whole
		files[`maskable-192${sfx}.png`] = [iconSvg(theme, {scale: 0.92}), 192];
		files[`maskable-512${sfx}.png`] = [iconSvg(theme, {scale: 0.92}), 512];
		// iOS: opaque, square (iOS rounds the corners itself)
		files[`apple-touch-icon${sfx}.png`] = [iconSvg(theme, {scale: 1.04}), 180];
		// small pen for tabs
		files[`favicon-32${sfx}.png`] = [iconSvg(theme, {small: true, scale: 1.1, rounded: true}), 32];
		files[`favicon-16${sfx}.png`] = [iconSvg(theme, {small: true, scale: 1.1, rounded: true}), 16];
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
