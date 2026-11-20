import Link from 'next/link';
import {ThemeToggle} from '@/components/theme-toggle';
import {HeroDoodle} from '@/components/doodles';

export const metadata = {
	title: 'About | Minimalist Reading Tracker',
	description:
		'Track your reading progress without distractions. A minimal book tracking app for people who want to focus on reading, not managing complex features.',
};

export default function AboutPage() {
	return (
		<div className="space-y-16">
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

			<section className="grid gap-8 sm:grid-cols-[1.35fr_1fr] sm:items-end">
				<div className="space-y-6">
					<h1 className="text-[40px] sm:text-[44px] whitespace-nowrap">
						minimalist
						<br />
						reading tracker
					</h1>
					<p className="text-muted-foreground leading-[1.9] max-w-xs">
						track your reading progress without distractions. no reviews, no recommendations, no social features.
						just your books.
					</p>
				</div>
				<HeroDoodle className="w-full max-w-[360px] justify-self-end text-foreground" />
			</section>

			<section className="space-y-3">
				<h2 className="text-3xl">what you get?</h2>
				<ul className="space-y-1 text-sm leading-[1.9]">
					<li>add books from google books search</li>
					<li>track reading progress by page or percentage</li>
					<li>mark books as reading, finished, or want to read</li>
					<li>rate books you have finished</li>
					<li>track your reading streak</li>
					<li>a shareable public library page</li>
				</ul>
			</section>

			<div className="pb-8">
				<Link href="/login" className="doodle-underline is-on accent font-hand text-2xl text-foreground">
					start tracking for free →
				</Link>
			</div>
		</div>
	);
}
