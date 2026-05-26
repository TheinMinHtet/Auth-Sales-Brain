"use client";

import { useState } from "react";
import { ShopChatbot } from "./ShopChatbot";

export interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

export interface PublicShop {
  shopId: string;
  businessName: string;
  description: string | null;
  paymentInfo: string;
  deliveryInfo: string;
  products: PublicProduct[];
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export function ShopStorefront({ shop }: { shop: PublicShop }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function addToCart(p: PublicProduct) {
    if (p.stock < 1) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) return prev;
        return prev.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: p.id, name: p.name, price: p.price, quantity: 1 }];
    });
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: shop.shopId,
          ...form,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      setStatus("done");
      setCart([]);
      setCheckoutOpen(false);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Checkout failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">{shop.businessName}</h1>
          {shop.description && (
            <p className="mt-2 text-slate-600">{shop.description}</p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Products</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {shop.products.map((p) => (
              <article
                key={p.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                )}
                <h3 className="font-semibold">{p.name}</h3>
                {p.description && (
                  <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">
                    ${p.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    disabled={p.stock < 1}
                    onClick={() => addToCart(p)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                  >
                    {p.stock < 1 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm sticky top-4">
            <h2 className="font-semibold mb-3">Cart ({cart.length})</h2>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">Your cart is empty</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {cart.map((i) => (
                  <li key={i.productId} className="flex justify-between">
                    <span>
                      {i.name} × {i.quantity}
                    </span>
                    <span>${(i.price * i.quantity).toFixed(2)}</span>
                  </li>
                ))}
                <li className="border-t pt-2 font-bold flex justify-between">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </li>
              </ul>
            )}
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setCheckoutOpen(true)}
              className="mt-4 w-full rounded-lg bg-indigo-600 py-2 text-white disabled:opacity-40"
            >
              Checkout
            </button>
          </div>

          <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Payment</p>
            <p className="mt-1">{shop.paymentInfo}</p>
            <p className="font-medium text-slate-800 mt-3">Delivery</p>
            <p className="mt-1">{shop.deliveryInfo}</p>
          </div>
        </aside>
      </main>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={checkout}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold">Checkout</h3>
            <div className="mt-4 space-y-3">
              {(["customerName", "customerEmail", "customerPhone", "address"] as const).map(
                (field) => (
                  <input
                    key={field}
                    required={field !== "customerPhone"}
                    placeholder={
                      field === "customerName"
                        ? "Full name"
                        : field === "customerEmail"
                          ? "Email"
                          : field === "customerPhone"
                            ? "Phone (optional)"
                            : "Delivery address"
                    }
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                )
              )}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {status === "done" && (
              <p className="mt-2 text-sm text-green-600">Order placed successfully!</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="flex-1 rounded-lg border py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 rounded-lg bg-indigo-600 py-2 text-white"
              >
                {status === "loading" ? "Placing..." : `Pay $${total.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      )}

      <ShopChatbot shopId={shop.shopId} businessName={shop.businessName} />
    </div>
  );
}
