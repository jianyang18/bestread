"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { onboardingAction } from "@/actions/onboarding.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function OnboardingPage() {
  const [username, setUsername] = useState("");

  const { execute, isPending } = useAction(onboardingAction, {
    onError: ({ error }) => {
      toast.error(error.serverError || "something went wrong");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    execute({ username });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">welcome to bestRead</h1>
        <p className="text-muted-foreground text-sm">choose a username to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">username</Label>
          <Input
            id="username"
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            pattern="^[a-z0-9_]+$"
            minLength={2}
            maxLength={30}
            required
          />
          <p className="text-xs text-muted-foreground">
            lowercase letters, numbers, and underscores only
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "setting up..." : "continue"}
        </Button>
      </form>
    </div>
  );
}
