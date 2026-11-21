import {createServerClient} from '@supabase/ssr';
import {NextResponse} from 'next/server';

export async function updateSession(request) {
	let supabaseResponse = NextResponse.next({request});

	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
				supabaseResponse = NextResponse.next({request});
				cookiesToSet.forEach(({name, value, options}) => supabaseResponse.cookies.set(name, value, options));
			},
		},
	});

	const {
		data: {user},
	} = await supabase.auth.getUser();

	// Protect routes
	const pathname = request.nextUrl.pathname;
	const isAuthRoute = pathname.startsWith('/login');
	const isOnboardingRoute = pathname.startsWith('/onboarding');
	const isPublicRoute = pathname === '/' || pathname.startsWith('/book-tracking-app');

	// Let /onboarding open without signing in on `npm run dev` and Vercel preview
	// deployments, so the page can be designed and checked. Production still
	// requires a login, and the form itself still needs one to save a username.
	const isNonProduction =
		process.env.NODE_ENV !== 'production' ||
		process.env.VERCEL_ENV === 'preview' ||
		process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
	const isOnboardingPreview = isOnboardingRoute && isNonProduction;

	if (!user && !isAuthRoute && !isPublicRoute && !isOnboardingPreview) {
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		return NextResponse.redirect(url);
	}

	if (user && !user.user_metadata?.username && !isOnboardingRoute && !isAuthRoute) {
		const url = request.nextUrl.clone();
		url.pathname = '/onboarding';
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
