"use client";

import { createClient } from "@/lib/supabase/client";

type AuthButtonProps = {
  provider?: "google";
  children: React.ReactNode;
  className?: string;
  redirectTo?: string;
};

export function AuthButton({
  provider = "google",
  children,
  className = "",
  redirectTo = "/dashboard",
}: AuthButtonProps) {
  const supabase = createClient();

  async function handleOAuth() {
    const origin = window.location.origin;

    document.cookie = `auth_next=${encodeURIComponent(redirectTo)}; path=/; max-age=600; SameSite=Lax`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  }

  return (
    <button
      type="button"
      onClick={handleOAuth}
      className={
        className ||
        "flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      }
    >
      {children}
    </button>
  );
}
