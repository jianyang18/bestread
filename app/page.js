import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {getUser} from '@/lib/supabase/queries/cached-queries';
import {redirect} from 'next/navigation';
import {ThemeToggle} from '@/components/theme-toggle';

export default async function HomePage() {
	const user = await getUser();
	if (user?.data?.username) redirect(`/${user.data.username}`);

	return (
		<div className="space-y-12">
			<header className="flex justify-between items-center">
				<span className="text-2xl font-bold">bestRead</span>
				<div className="flex items-center gap-4">
					<ThemeToggle />
					<Link href="/login">
						<Button variant="ghost" size="lg">
							login
						</Button>
					</Link>
				</div>
			</header>
			<section className="space-y-4">
				<h1 className="text-6xl font-bold">minimalist reading tracker</h1>
				<p className="text-muted-foreground text-lg leading-relaxed">
					track your reading progress without distractions. no reviews, no recommendations, no social features. just
					your books.
				</p>
			</section>
			<section className="space-y-2">
				<h2 className="font-semibold">what you get</h2>
				<ul className="space-y-1 text-muted-foreground text-sm">
					<li>— add books from google books search</li>
					<li>— track reading progress by page or percentage</li>
					<li>— mark books as reading, finished, or want to read</li>
					<li>— rate books you have finished</li>
					<li>— track your reading streak</li>
					<li>— shareable public library page</li>
				</ul>
			</section>
			<div className="flex gap-3">
				<Link href="/login">
					<Button>start tracking for free</Button>
				</Link>
				<Link href="/book-tracking-app">
					<Button variant="outline">learn more</Button>
				</Link>
			</div>
		</div>
	);
}
