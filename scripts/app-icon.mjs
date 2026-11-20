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

// The same tiny reader as the empty-library doodle, sitting on a shelf line, now with a
// tiny book on the lap. A few slow monoline strokes and lots of paper, nothing more.
// Coordinates are in the empty-shelf doodle's own space (components/doodles/index.jsx),
// centred on CX/CY and scaled up to the 512 canvas.
const CX = 157;
const CY = 70;

const SHELF = ['M92 92 C130 90 180 93 222 91'];
const BRACKETS = ['M110 93 C110 101 114 106 120 108', 'M204 93 C204 101 200 106 194 108'];
const LEGS = [
	'M150 86 C152 96 151 106 149 114',
	'M149 114 C146 116 142 116 141 114',
	'M160 86 C163 95 163 104 162 111',
	'M162 111 C160 114 156 114 154 112',
];
const BODY = 'M141 62 C149 59 163 59 169 63 C171 71 171 81 169 88 C160 91 148 91 141 88 C139 80 139 70 141 62 Z';
const HEAD = 'M155 36 C163 36 168 42 167 49 C166 56 160 60 154 59 C147 58 143 52 144 46 C145 40 149 36 155 36 Z';
const CURL = 'M148 39 C143 35 144 29 149 29 C153 29 153 34 150 35';
// the tiny open book on the lap
const BOOK = 'M139 77 C146 74 151 74 155 77 C159 74 164 74 171 77 C171 80 171 83 171 86 C164 83 159 83 155 86 C151 83 146 83 139 86 C139 83 139 80 139 77 Z';
const SPINE = 'M155 77 C155 80 155 83 155 86';
// the one accent: a few ticks, the little spark of a good page
const TICKS = ['M180 40 L187 35', 'M182 50 L190 50', 'M179 30 L183 24'];

/**
 * @param {'light'|'dark'} theme
 * @param {{small?: boolean, scale?: number, transparent?: boolean, rounded?: boolean}} opts
 *   small: heavier pen and fewer strokes, for favicons (16-48px)
 *   scale: art size on the 512 canvas (the whole drawing stays inside the maskable safe zone up to ~2.9)
 */
export function iconSvg(theme, {small = false, scale = 2.8, transparent = false, rounded = false} = {}) {
	const {paper, ink, accent} = THEMES[theme];
	const w = small ? 6 : 3.4;
	const art = `translate(256 256) scale(${scale.toFixed(3)}) translate(${-CX} ${-CY})`;
	const bg = transparent
		? ''
		: rounded
			? `<rect width="512" height="512" rx="112" fill="${paper}"/>`
			: `<rect width="512" height="512" fill="${paper}"/>`;
	const p = (d, extra = '') => `<path d="${d}"${extra}/>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${bg}
<g transform="${art}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
${SHELF.map((d) => p(d)).join('')}${small ? '' : BRACKETS.map((d) => p(d)).join('')}
${LEGS.map((d) => p(d)).join('')}
${p(BODY, ` fill="${paper}"`)}
${p(HEAD, ` fill="${paper}"`)}${small ? '' : p(CURL)}

${p(BOOK, ` fill="${paper}"`)}${small ? '' : p(SPINE)}
</g>
<g transform="${art}" fill="none" stroke="${accent}" stroke-width="${w * 0.92}" stroke-linecap="round">
${(small ? TICKS.slice(0, 2) : TICKS).map((d) => p(d)).join('')}
</g>
</svg>
`;
}

// favicon.svg follows the browser theme on its own
function adaptiveFaviconSvg() {
	const L = THEMES.light;
	const D = THEMES.dark;
	return iconSvg('light', {small: true, scale: 4, transparent: true})
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
		files[`icon${sfx}.svg`] = [iconSvg(theme, {scale: 3.05}), null];
		files[`icon-192${sfx}.png`] = [iconSvg(theme, {scale: 3.05}), 192];
		files[`icon-512${sfx}.png`] = [iconSvg(theme, {scale: 3.05}), 512];
		// maskable: full bleed, art kept to the inner 80% so any mask shape keeps it whole
		files[`maskable-192${sfx}.png`] = [iconSvg(theme, {scale: 2.5}), 192];
		files[`maskable-512${sfx}.png`] = [iconSvg(theme, {scale: 2.5}), 512];
		// iOS: opaque, square (iOS rounds the corners itself)
		files[`apple-touch-icon${sfx}.png`] = [iconSvg(theme, {scale: 3}), 180];
		// small pen for tabs
		files[`favicon-32${sfx}.png`] = [iconSvg(theme, {small: true, scale: 4, rounded: true}), 32];
		files[`favicon-16${sfx}.png`] = [iconSvg(theme, {small: true, scale: 4, rounded: true}), 16];
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
