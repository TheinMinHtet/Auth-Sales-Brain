"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getPostLoginPath(): string {
  const match = document.cookie.match(/(?:^|;\s*)auth_next=([^;]*)/);
  const raw = match ? decodeURIComponent(match[1]) : "/dashboard";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

function clearPostLoginCookie() {
  document.cookie = "auth_next=; path=/; max-age=0";
}

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const supabase = createClient();
    const next = getPostLoginPath();

    async function finish() {
      const code = searchParams.get("code");
      const oauthError = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (oauthError) {
        const msg = errorDescription || oauthError;
        router.replace(`/login?error=${encodeURIComponent(msg)}`);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
        clearPostLoginCookie();
        router.replace(next);
        router.refresh();
        return;
      }

      // PKCE / hash fallback — browser client parses session from URL
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        router.replace(`/login?error=${encodeURIComponent(error.message)}`);
        return;
      }
      if (session) {
        clearPostLoginCookie();
        router.replace(next);
        router.refresh();
        return;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (newSession) {
            subscription.unsubscribe();
            clearPostLoginCookie();
            router.replace(next);
            router.refresh();
          }
        }
      );

      window.setTimeout(async () => {
        const { data: { session: retry } } = await supabase.auth.getSession();
        subscription.unsubscribe();
        if (retry) {
          clearPostLoginCookie();
          router.replace(next);
          router.refresh();
        } else {
          setMessage(
            "Sign-in did not complete. In Supabase → Authentication → URL Configuration, add: http://localhost:3000/auth/callback"
          );
        }
      }, 3000);
    }

    finish();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <p className="max-w-md text-center text-sm text-slate-600">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading…</div>}>
      <AuthCallbackHandler />
    </Suspense>
  );
}
