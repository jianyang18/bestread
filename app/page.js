import Link from 'next/link';
import {getUser} from '@/lib/supabase/queries/cached-queries';
import {redirect} from 'next/navigation';
import {ThemeToggle} from '@/components/theme-toggle';
import {EmptyShelfDoodle} from '@/components/doodles';

export default async function HomePage() {
	const user = await getUser();
	if (user?.data?.username) redirect(`/${user.data.username}`);

	return (
		<div className="flex flex-col min-h-[80vh] space-y-16">
			<header className="flex justify-between items-center">
				<span className="font-hand text-3xl">bestRead</span>
				<nav className="flex items-center gap-5 text-[13px] tracking-[0.13em]">
					<Link href="/book-tracking-app" className="doodle-underline text-muted-foreground hover:text-foreground">
						about
					</Link>
					<Link href="/login" className="doodle-underline text-foreground">
						login
					</Link>
					<ThemeToggle />
				</nav>
			</header>

			<section className="space-y-4">
				<h1 className="text-5xl">book tracking app</h1>
				<p className="text-muted-foreground leading-[1.9] max-w-md">No registration required, just your email</p>
			</section>

			<EmptyShelfDoodle className="w-52 text-foreground" />

			<section className="space-y-4 pb-8">
				<h2 className="text-3xl">ready to start tracking your books?</h2>
				<Link href="/login" className="doodle-underline is-on accent font-hand text-2xl text-foreground">
					start tracking →
				</Link>
			</section>
		</div>
	);
}
