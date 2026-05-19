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
					<h1 className="text-2xl font-extrabold hover:bg-indigo-200">
						This is a project WIP, check back and discover more
					</h1>
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
