'use client';

import {useState} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {toast} from 'sonner';
import {useAction} from 'next-safe-action/hooks';
import {verifyOtpAction} from '@/actions/verify-otp.action';
import {ThemeToggle} from '@/components/theme-toggle';
import {BoilText} from '@/components/doodles';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [otpSent, setOtpSent] = useState(false);
	const [token, setToken] = useState('');
	const [isSending, setIsSending] = useState(false);

	const {execute: verifyOtp, isPending: isVerifying} = useAction(verifyOtpAction, {
		onError: ({error}) => {
			toast.error(error.serverError || 'invalid or expired code');
		},
	});

	async function handleSendOtp(e) {
		e.preventDefault();
		if (!email) return;

		setIsSending(true);
		const supabase = createClient();

		const {error} = await supabase.auth.signInWithOtp({
			email,
			options: {shouldCreateUser: true},
		});

		setIsSending(false);

		if (error) {
			toast.error(error.message);
			return;
		}

		setOtpSent(true);
		toast.success('check your email for a login code');
	}

	function handleVerify(e) {
		e.preventDefault();
		verifyOtp({token, email});
	}

	return (
		<div className="space-y-8">
			<header className="flex justify-between items-center">
				<Link href="/" className="font-hand text-3xl text-foreground hover:-rotate-1 transition-transform inline-block">
					bestRead
				</Link>
				<ThemeToggle />
			</header>
			<div className="space-y-1">
				<h1 className="text-4xl">sign in</h1>
			</div>

			{!otpSent ? (
				<form onSubmit={handleSendOtp} className="space-y-8 max-w-sm">
					<div className="space-y-2">
						<Label htmlFor="email">email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<Button type="submit" disabled={isSending}>
						{isSending ? <BoilText text="sending..." /> : 'send login code →'}
					</Button>
				</form>
			) : (
				<form onSubmit={handleVerify} className="space-y-8 max-w-sm">
					<div className="space-y-2">
						<Label htmlFor="token">enter code sent to {email}</Label>
						<Input
							id="token"
							type="text"
							inputMode="numeric"
							autoComplete="one-time-code"
							pattern="[0-9]*"
							placeholder="8-digit code"
							value={token}
							onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
							required
							autoFocus
						/>
					</div>
					<Button type="submit" disabled={isVerifying}>
						{isVerifying ? <BoilText text="verifying..." /> : 'verify code →'}
					</Button>
					<button
						type="button"
						onClick={() => setOtpSent(false)}
						className="doodle-underline block w-fit text-sm text-muted-foreground hover:text-foreground">
						use a different email
					</button>
				</form>
			)}
		</div>
	);
}
