"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

interface NavbarProps {
  user?: { name: string; role: string; email?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          AI Shop Bot
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              {user.role === "DEVELOPER" && (
                <Link href="/admin" className="text-slate-600 hover:text-indigo-600">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="text-slate-600 hover:text-indigo-600">
                Dashboard
              </Link>
              <span className="text-slate-500">{user.name}</span>
              <LogoutButton className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm hover:bg-slate-200" />
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-indigo-600">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
