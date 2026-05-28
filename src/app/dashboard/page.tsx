"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
interface Shop {
  shopId: string;
  businessName: string;
  publicUrl: string;
  products: {
    id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
  }[];
  botTone: string;
  faq: string | null;
  policies: string | null;
}

interface Analytics {
  summary: { pageViews: number; chatMessages: number; orders: number; revenue: number };
  recentOrders: { id: string; customerName: string; total: number; status: string }[];
  publicUrl: string;
}

function buildQrCodeUrl(value: string, size = 144) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
}

export default function DashboardPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tab, setTab] = useState<"overview" | "products" | "bot">("overview");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "10" });
  const [botForm, setBotForm] = useState({ botTone: "", faq: "", policies: "" });
  const [dbError, setDbError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setDbError(null);

    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.status === 401) {
        window.location.href = "/login?redirect=/dashboard";
        return;
      }

      const me = meRes.ok ? await meRes.json() : null;
      if (me && me.dbConnected === false) {
        setDbError(
          "Database is not connected. Add your Supabase Postgres URL to DATABASE_URL in .env, then run: npm run db:push"
        );
        setLoading(false);
        return;
      }

      const [shopRes, analyticsRes] = await Promise.all([
        fetch("/api/shops/me"),
        fetch("/api/dashboard/analytics"),
      ]);

      if (shopRes.status >= 500 || analyticsRes.status >= 500) {
        setDbError(
          "Could not load shop data. Check DATABASE_URL in .env (Supabase → Settings → Database → URI)."
        );
      }

      if (shopRes.ok) {
        const shopData = await shopRes.json();
        if (shopData.shop) {
          setShop(shopData.shop);
          setBotForm({
            botTone: shopData.shop.botTone || "friendly",
            faq: shopData.shop.faq || "",
            policies: shopData.shop.policies || "",
          });
        } else {
          setShop(null);
        }
      }

      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      }
    } catch {
      setDbError("Failed to load dashboard. Check your database connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
      }),
    });
    setNewProduct({ name: "", price: "", stock: "10" });
    load();
  }

  async function saveBotSettings(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/shops/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(botForm),
    });
    load();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">
        Loading dashboard…
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">Database setup required</p>
          <p className="mt-2">{dbError}</p>
          <p className="mt-3 text-xs text-amber-800">
            Use Supabase → Settings → Database → URI for{" "}
            <code className="font-mono">DIRECT_URL</code> and pooler for{" "}
            <code className="font-mono">DATABASE_URL</code> (see .env.example).
          </p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">No shop yet.</p>
        <Link
          href="/setup"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
        >
          Create shop & get your public link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{shop.businessName}</h1>
          <p className="text-sm text-slate-500 mt-1">Owner dashboard</p>
        </div>
        <div className="flex max-w-xl gap-4 rounded-xl border bg-white px-4 py-3 text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-700">Public shop link</p>
            <a
              href={shop.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-indigo-600 hover:underline"
            >
              {shop.publicUrl}
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(shop.publicUrl)}
              className="mt-2 block text-xs text-indigo-600 hover:underline"
            >
              Copy link
            </button>
          </div>
          <div className="shrink-0 rounded-lg border bg-white p-2">
            <img
              src={buildQrCodeUrl(shop.publicUrl)}
              alt="Public shop QR code"
              width={144}
              height={144}
              className="h-24 w-24 sm:h-36 sm:w-36"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b">
        {(["overview", "products", "bot"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${
              tab === t
                ? "border-b-2 border-indigo-600 text-indigo-600 font-medium"
                : "text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && analytics && (
        <div className="mt-6 grid sm:grid-cols-4 gap-4">
          {[
            { label: "Page views (30d)", value: analytics.summary.pageViews },
            { label: "Chat messages", value: analytics.summary.chatMessages },
            { label: "Orders", value: analytics.summary.orders },
            { label: "Revenue", value: `$${analytics.summary.revenue.toFixed(2)}` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-white p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
          <div className="sm:col-span-4 rounded-xl border bg-white p-4">
            <h3 className="font-semibold mb-3">Recent orders</h3>
            {analytics.recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No orders yet</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.recentOrders.map((o) => (
                  <li key={o.id} className="flex justify-between border-b pb-2">
                    <span>{o.customerName}</span>
                    <span>
                      ${o.total.toFixed(2)} · {o.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold mb-3">Add product</h3>
            <form onSubmit={addProduct} className="space-y-2">
              <input
                required
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">
                Add
              </button>
            </form>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold mb-3">Your products</h3>
            <ul className="space-y-2 text-sm">
              {shop.products.map((p) => (
                <li key={p.id} className="flex justify-between border-b pb-2">
                  <span>{p.name}</span>
                  <span>
                    ${p.price.toFixed(2)} · {p.stock} in stock
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "bot" && (
        <form
          onSubmit={saveBotSettings}
          className="mt-6 max-w-xl space-y-4 rounded-xl border bg-white p-6"
        >
          <h3 className="font-semibold">AI bot settings</h3>
          <p className="text-sm text-slate-500">
            The bot uses your products, FAQ, and policies as context.
          </p>
          <input
            placeholder="Bot tone (friendly, professional...)"
            value={botForm.botTone}
            onChange={(e) => setBotForm({ ...botForm, botTone: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <textarea
            placeholder="FAQ"
            value={botForm.faq}
            onChange={(e) => setBotForm({ ...botForm, faq: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={4}
          />
          <textarea
            placeholder="Policies"
            value={botForm.policies}
            onChange={(e) => setBotForm({ ...botForm, policies: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={4}
          />
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">
            Save & refresh bot context
          </button>
        </form>
      )}
    </div>
  );
}
