import './globals.css';
import {Toaster} from 'sonner';
import {Analytics} from '@vercel/analytics/next';

export const metadata = {
	title: {default: 'bestRead | minimalist reading tracker', template: '%s | bestRead'},
	description:
		'Track your reading progress without distractions. A minimal book tracking app for people who want to focus on reading, not managing complex features.',
	robots: {index: true, follow: true},
};

export const viewport = {width: 'device-width', initialScale: 1, maximumScale: 1};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({children}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{__html: themeScript}} />
			</head>
			<body>
				<div className="flex flex-col min-h-screen p-6 md:pt-12">
					<main className="max-w-2xl mx-auto w-full space-y-8">{children}</main>
				</div>
				<Toaster theme="system" />
				<Analytics />
			</body>
		</html>
	);
}
