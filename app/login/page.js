"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { verifyOtpAction } from "@/actions/verify-otp.action";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { execute: verifyOtp, isPending: isVerifying } = useAction(verifyOtpAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || "invalid or expired code");
    },
  });

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setIsSending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setOtpSent(true);
    toast.success("check your email for a login code");
  }

  function handleVerify(e) {
    e.preventDefault();
    verifyOtp({ token, email });
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
          bestRead
        </Link>
        <ThemeToggle />
      </header>
      <div className="space-y-1">
        <h1 className="text-xl font-bold">sign in</h1>
        <p className="text-muted-foreground text-sm">sign in to track your reading</p>
      </div>

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
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
          <Button type="submit" disabled={isSending} className="w-full">
            {isSending ? "sending..." : "send login code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">enter code sent to {email}</Label>
            <Input
              id="token"
              type="text"
              placeholder="6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isVerifying} className="w-full">
            {isVerifying ? "verifying..." : "verify code"}
          </Button>
          <button
            type="button"
            onClick={() => setOtpSent(false)}
            className="text-sm text-muted-foreground hover:underline w-full text-center"
          >
            use a different email
          </button>
        </form>
      )}
    </div>
  );
}
