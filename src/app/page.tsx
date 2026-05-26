import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { ensurePrismaUser } from "@/lib/supabase/app-user";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let user: { name: string; role: string; email?: string } | null = null;
  if (supabaseUser) {
    const dbUser = await ensurePrismaUser(supabaseUser);
    user = {
      name:
        supabaseUser.user_metadata?.full_name ??
        dbUser?.name ??
        supabaseUser.email?.split("@")[0] ??
        "User",
      role: dbUser?.role ?? "SHOP_OWNER",
      email: supabaseUser.email,
    };
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm text-indigo-700">
            SaaS · Single platform · Unlimited shops
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
            AI Shop Bot Platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Shop owners sign up, complete one setup form, and instantly get a unique
            customer link with an AI assistant trained on their products, payment, and
            delivery info.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white hover:bg-indigo-700"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-300 px-8 py-3 font-medium hover:bg-white"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="border-t bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Shop Owner",
                desc: "Sign up with email or Google, complete setup, get your /shop/{shopId} link.",
              },
              {
                title: "Customer",
                desc: "Visit public shop link — browse, chat with AI, checkout. No login.",
              },
              {
                title: "Developer",
                desc: "Platform admin — monitor all shops, users, and platform analytics.",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border p-6">
                <h3 className="font-semibold text-indigo-600">{card.title}</h3>
                <p className="mt-2 text-slate-600 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
