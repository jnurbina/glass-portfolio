"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Single-user sign-in for /leetdash. The Convex side enforces that only
// the configured OWNER_EMAIL can sign in; any other Google account hits
// a "Forbidden" error in the OAuth callback.
export default function SignInPage() {
  const { signIn } = useAuthActions();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-mono text-xl tracking-tight">
            leet<span className="text-foreground/40">;</span>
          </CardTitle>
          <CardDescription>Sign in to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-11"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError(null);
              try {
                // Send an absolute URL so Convex Auth's redirect callback
                // can validate it against our trusted-origin list. Lands
                // back on whichever origin (prod, preview, localhost) the
                // user signed in from instead of always SITE_URL.
                await signIn("google", {
                  redirectTo: `${window.location.origin}/leetdash`,
                });
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Sign-in failed.",
                );
                setPending(false);
              }
            }}
          >
            <GoogleMark />
            {pending ? "Redirecting…" : "Sign in with Google"}
          </Button>
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
          <p className="text-[11px] text-muted-foreground text-center pt-2">
            Owner-only. Other accounts will be rejected.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}
