import Link from 'next/link';
import {ThemeToggle} from '@/components/theme-toggle';
import {EmptyShelfDoodle} from '@/components/doodles';

export const metadata = {
	title: 'Book Tracking App | Minimalist Reading Tracker',
	description:
		'A simple book tracking app that helps you manage your reading without distractions. Track books, monitor progress, and build better reading habits.',
};

export default function BookTrackingAppPage() {
	return (
		<div className="flex flex-col min-h-[80vh] space-y-16">
			<header className="flex justify-between items-center">
				<Link href="/" className="font-hand text-3xl text-foreground hover:-rotate-1 transition-transform inline-block">
					bestRead
				</Link>
				<nav className="flex items-center gap-5 text-[13px] tracking-[0.13em]">
					<Link href="/login" className="doodle-underline text-foreground">
						login
					</Link>
					<ThemeToggle />
				</nav>
			</header>

			<section className="space-y-4">
				<h1 className="text-5xl">book tracking app</h1>
				<p className="text-muted-foreground leading-[1.9] max-w-md">
					a minimal book tracking app for people who want to focus on reading, not managing complex features.
				</p>
			</section>

			<section className="flex flex-col items-start gap-2">
				<EmptyShelfDoodle className="w-52 text-foreground" />
				<p className="font-hand text-2xl text-foreground">still building this shelf.</p>
				<p className="text-sm text-muted-foreground">this page is a work in progress, check back soon.</p>
			</section>

			<section className="space-y-4 pb-8">
				<h2 className="text-3xl">ready to start tracking your books?</h2>
				<Link href="/login" className="doodle-underline is-on accent font-hand text-2xl text-foreground">
					start tracking for free →
				</Link>
			</section>
		</div>
	);
}
