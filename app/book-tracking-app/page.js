import Link from 'next/link';
import {Button} from '@/components/ui/button';

export const metadata = {
	title: 'Book Tracking App | Minimalist Reading Tracker',
	description:
		'A simple book tracking app that helps you manage your reading without distractions. Track books, monitor progress, and build better reading habits.',
};

export default function BookTrackingAppPage() {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold">
					bestRead
				</Link>
				<Link href="/login">
					<Button variant="ghost" size="md">
						login
					</Button>
				</Link>
			</header>

			<main className="flex-1 space-y-12 py-12">
				<section className="space-y-4">
					<h1 className="text-4xl font-extrabold">book tracking app</h1>
					<p className="text-xl text-muted-foreground leading-relaxed">
						a minimal book tracking app for people who want to focus on reading, not managing complex features.
					</p>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">why use a book tracking app?</h2>
					<div className="space-y-3 text-muted-foreground leading-relaxed">
						<p>
							a good book tracking app helps you remember what you have read, track your progress on current books, and
							stay motivated to read more. the problem is, most book tracking apps do too much.
						</p>
						<p>
							they have social feeds, book recommendations, reading challenges, and endless settings. if you just want
							to track your books, these features are distractions, not benefits.
						</p>
					</div>
				</section>

				<section className="space-y-6">
					<h2 className="text-2xl font-semibold">book tracking app vs goodreads</h2>
					<div className="space-y-4">
						<div className="space-y-1">
							<h3 className="font-medium">goodreads is comprehensive</h3>
							<p className="text-muted-foreground text-sm">
								goodreads has reviews, recommendations, social features, and millions of users. if you want to discover
								books and discuss them with others, goodreads is great.
							</p>
						</div>
						<div className="space-y-1">
							<h3 className="font-medium">bestRead is minimal</h3>
							<p className="text-muted-foreground text-sm">
								bestRead focuses on one thing: helping you track your books. no reviews, no recommendations, no social
								features. just a simple way to see what you are reading and what you have finished.
							</p>
						</div>
						<div className="space-y-1">
							<h3 className="font-medium">choose what fits</h3>
							<p className="text-muted-foreground text-sm">
								if you want a comprehensive book platform, use goodreads. if you want a simple book tracking app that
								stays out of your way, try bestRead.
							</p>
						</div>
					</div>
				</section>

				<section className="space-y-4">
					<h2 className="text-2xl font-semibold">how to track books read</h2>
					<div className="space-y-3 text-muted-foreground leading-relaxed">
						<p>
							with bestRead, tracking books is simple. search for a book, add it to your library, and mark it as
							reading, finished, or want-to-read. update your progress as you read.
						</p>
						<p>
							you can filter by status, search by title or author, and sort your library however you want. everything
							you need to manage your reading, nothing you do not.
						</p>
					</div>
				</section>

				<section className="space-y-4 bg-muted/50 p-8 text-center">
					<h2 className="text-xl font-semibold">ready to start tracking your books?</h2>
					<Link href="/login">
						<Button size="lg">start tracking for free</Button>
					</Link>
				</section>
			</main>
		</div>
	);
}
