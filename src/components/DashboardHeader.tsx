"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

interface DashboardHeaderProps {
  userName: string;
  userEmail?: string;
}

/** Dashboard nav — logged-in users only (no sign in / sign up). */
export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
          AI Shop Bot
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/setup" className="text-slate-600 hover:text-indigo-600">
            Shop setup
          </Link>
          <span className="text-slate-500" title={userEmail}>
            {userName}
          </span>
          <LogoutButton className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm hover:bg-slate-200" />
        </nav>
      </div>
    </header>
  );
}
