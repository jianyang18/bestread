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

// The reader sitting on a shelf with an open book on the lap, and three amber ticks.
// Drawn as clean line art to sit beside Jian's other home-screen icons: smooth geometric
// curves, one even pen, a solid dark hair shape for weight, eyes closed in a calm face.
// Drawn directly on the 512 canvas.

// pen weights on the 512 canvas
const PEN = {icon: 14, favicon: 26};

const SHELF = 'M72 368 L440 368';
const BRACKETS = ['M122 368 Q122 404 156 410', 'M390 368 Q390 404 356 410'];
const LEGS = ['M234 370 L232 438 Q222 446 208 444', 'M278 370 L280 438 Q290 446 304 444'];
const BODY = 'M192 262 Q256 238 320 262 L332 366 L180 366 Z';
const ARMS = ['M196 272 Q168 312 198 334', 'M316 272 Q344 312 314 334'];
const FACE = 'M256 98 A72 72 0 1 1 255.9 98 Z';
// the hair: a cap over the top of the head and a round bun, both solid
const HAIR = 'M187 150 A72 72 0 0 1 325 150 C300 126 212 126 187 150 Z';
const BUN = 'M256 64 A24 24 0 1 1 255.9 64 Z';
const EYES = ['M222 190 Q232 198 242 190', 'M270 190 Q280 198 290 190'];
const BOOK = 'M196 320 Q226 306 256 320 Q286 306 316 320 L316 360 Q286 346 256 360 Q226 346 196 360 Z';
const PAGES = ['M256 320 L256 360', 'M212 330 Q228 324 242 330', 'M270 330 Q284 324 300 330'];
const TICKS = ['M352 112 L366 92', 'M364 142 L388 130', 'M368 176 L394 174'];

/**
 * @param {'light'|'dark'} theme
 * @param {{small?: boolean, scale?: number, transparent?: boolean, rounded?: boolean}} opts
 *   small: heavier pen and fewer strokes, for favicons (16-48px)
 *   scale: art size around the centre; 0.9 keeps every stroke inside the maskable safe circle
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
${p(BODY, ` fill="${paper}"`)}
${small ? '' : ARMS.map((d) => p(d)).join('')}
${p(FACE, ` fill="${paper}"`)}
${p(HAIR, ` fill="${ink}"`)}${p(BUN, ` fill="${ink}"`)}
${small ? '' : EYES.map((d) => p(d)).join('')}
${p(BOOK, ` fill="${paper}"`)}${(small ? PAGES.slice(0, 1) : PAGES).map((d) => p(d)).join('')}
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
	return iconSvg('light', {small: true, scale: 1.06, transparent: true})
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
		files[`icon${sfx}.svg`] = [iconSvg(theme, {scale: 1}), null];
		files[`icon-192${sfx}.png`] = [iconSvg(theme, {scale: 1}), 192];
		files[`icon-512${sfx}.png`] = [iconSvg(theme, {scale: 1}), 512];
		// maskable: full bleed, art kept to the inner 80% so any mask shape keeps it whole
		files[`maskable-192${sfx}.png`] = [iconSvg(theme, {scale: 0.88}), 192];
		files[`maskable-512${sfx}.png`] = [iconSvg(theme, {scale: 0.88}), 512];
		// iOS: opaque, square (iOS rounds the corners itself)
		files[`apple-touch-icon${sfx}.png`] = [iconSvg(theme, {scale: 0.98}), 180];
		// small pen for tabs
		files[`favicon-32${sfx}.png`] = [iconSvg(theme, {small: true, scale: 1.06, rounded: true}), 32];
		files[`favicon-16${sfx}.png`] = [iconSvg(theme, {small: true, scale: 1.06, rounded: true}), 16];
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
