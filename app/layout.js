import './globals.css';
import {Toaster} from 'sonner';
import {Analytics} from '@vercel/analytics/next';
import localFont from 'next/font/local';
import {Jost} from 'next/font/google';
import {PwaRegister} from '@/components/pwa-register';

// handwritten voice: the Inspiration Hand font (latin only; other glyphs fall back)
const inspirationHand = localFont({
	src: '../public/fonts/InspirationHand-Regular.woff2',
	variable: '--font-inspiration',
	display: 'swap',
});

// quiet voice: light sans for body, captions and nav
const jost = Jost({subsets: ['latin'], weight: ['300', '400'], variable: '--font-jost', display: 'swap'});

export const metadata = {
	title: {default: 'bestRead | minimalist reading tracker', template: '%s | bestRead'},
	description:
		'Track your reading progress without distractions. A minimal book tracking app for people who want to focus on reading, not managing complex features.',
	robots: {index: true, follow: true},
	applicationName: 'bestRead',
	// app/manifest.js is linked automatically; these cover browsers that read <link> tags
	icons: {
		icon: [
			{url: '/icons/favicon.svg', type: 'image/svg+xml'},
			{url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png'},
		],
		apple: [{url: '/icons/apple-touch-icon.png', sizes: '180x180'}],
	},
	// iPhone "Add to Home Screen": open full screen with the page colour behind the status bar
	appleWebApp: {capable: true, title: 'bestRead', statusBarStyle: 'default'},
	formatDetection: {telephone: false},
};

export const viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	themeColor: [
		{media: '(prefers-color-scheme: light)', color: '#ffffff'},
		{media: '(prefers-color-scheme: dark)', color: '#151513'},
	],
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('meta[name=theme-color]').forEach(function(m){m.setAttribute('content',t==='dark'?'#151513':'#ffffff');});});}catch(e){}})();`;

export default function RootLayout({children}) {
	return (
		<html lang="en" suppressHydrationWarning className={`${inspirationHand.variable} ${jost.variable}`}>
			<head>
				<script dangerouslySetInnerHTML={{__html: themeScript}} />
			</head>
			<body>
				<div className="flex flex-col min-h-screen px-4 py-6 sm:px-6 md:pt-14">
					<main className="max-w-2xl mx-auto w-full space-y-8">{children}</main>
				</div>
				<Toaster
					theme="system"
					toastOptions={{
						style: {
							fontFamily: 'var(--font-sans)',
							fontWeight: 300,
							letterSpacing: '0.06em',
							border: '1.5px solid hsl(var(--foreground))',
							borderRadius: '3px 14px 5px 12px / 12px 4px 14px 5px',
							boxShadow: 'none',
						},
					}}
				/>
				<Analytics />
				<PwaRegister />
			</body>
		</html>
	);
}
