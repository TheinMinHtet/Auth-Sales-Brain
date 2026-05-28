"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductRow {
  name: string;
  description: string;
  price: string;
  stock: string;
}

function buildQrCodeUrl(value: string, size = 180) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [publicUrl, setPublicUrl] = useState("");

  const [business, setBusiness] = useState({
    businessName: "",
    description: "",
    paymentInfo: "",
    deliveryInfo: "",
    faq: "",
    policies: "",
    botTone: "friendly",
  });

  const [products, setProducts] = useState<ProductRow[]>([
    { name: "", description: "", price: "", stock: "10" },
  ]);

  function updateProduct(i: number, field: keyof ProductRow, value: string) {
    setProducts((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p))
    );
  }

  async function submit() {
    setLoading(true);
    setError("");
    const payload = {
      ...business,
      products: products
        .filter((p) => p.name.trim())
        .map((p) => ({
          name: p.name,
          description: p.description || undefined,
          price: parseFloat(p.price),
          stock: parseInt(p.stock, 10) || 0,
        })),
    };

    const res = await fetch("/api/shops/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error?.products?.[0] || data.error || "Setup failed");
      return;
    }

    setPublicUrl(data.shop.publicUrl);
    setStep(3);
  }

  if (step === 3) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold">Your shop is live!</h1>
          <p className="mt-2 text-slate-600">Share this link with customers:</p>
          <code className="mt-4 block break-all rounded-lg bg-slate-100 p-3 text-sm text-indigo-700">
            {publicUrl}
          </code>
          <div className="mx-auto mt-5 w-fit rounded-2xl border bg-white p-3 shadow-sm">
            <img
              src={buildQrCodeUrl(publicUrl)}
              alt="Public shop QR code"
              width={180}
              height={180}
              className="h-[180px] w-[180px]"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Customers can scan this QR code to open your shop.
          </p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
            }}
            className="mt-4 text-sm text-indigo-600 underline"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-6 w-full rounded-lg bg-indigo-600 py-2 text-white"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Shop setup</h1>
      <p className="text-slate-600 text-sm mt-1">
        Step {step} of 2 — we&apos;ll generate your unique shop link automatically
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {step === 1 && (
        <div className="mt-8 space-y-4 rounded-2xl border bg-white p-6">
          <input
            required
            placeholder="Business name *"
            value={business.businessName}
            onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
          />
          <textarea
            placeholder="Business description"
            value={business.description}
            onChange={(e) => setBusiness({ ...business, description: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            rows={2}
          />
          <textarea
            required
            placeholder="Payment info (e.g. Bank transfer, Stripe link) *"
            value={business.paymentInfo}
            onChange={(e) => setBusiness({ ...business, paymentInfo: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            rows={2}
          />
          <textarea
            required
            placeholder="Delivery info *"
            value={business.deliveryInfo}
            onChange={(e) => setBusiness({ ...business, deliveryInfo: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            rows={2}
          />
          <textarea
            placeholder="FAQ (used by AI bot)"
            value={business.faq}
            onChange={(e) => setBusiness({ ...business, faq: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
            rows={3}
          />
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-indigo-600 py-2 text-white"
          >
            Next: Products
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 space-y-4 rounded-2xl border bg-white p-6">
          {products.map((p, i) => (
            <div key={i} className="grid gap-2 border-b pb-4 sm:grid-cols-2">
              <input
                required
                placeholder="Product name"
                value={p.name}
                onChange={(e) => updateProduct(i, "name", e.target.value)}
                className="rounded-lg border px-3 py-2 sm:col-span-2"
              />
              <input
                required
                type="number"
                step="0.01"
                placeholder="Price"
                value={p.price}
                onChange={(e) => updateProduct(i, "price", e.target.value)}
                className="rounded-lg border px-3 py-2"
              />
              <input
                type="number"
                placeholder="Stock"
                value={p.stock}
                onChange={(e) => updateProduct(i, "stock", e.target.value)}
                className="rounded-lg border px-3 py-2"
              />
              <input
                placeholder="Description"
                value={p.description}
                onChange={(e) => updateProduct(i, "description", e.target.value)}
                className="rounded-lg border px-3 py-2 sm:col-span-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setProducts([...products, { name: "", description: "", price: "", stock: "10" }])
            }
            className="text-sm text-indigo-600"
          >
            + Add product
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border py-2"
            >
              Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={submit}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Creating shop..." : "Launch shop & get link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
