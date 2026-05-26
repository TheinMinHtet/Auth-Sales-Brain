"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

interface PlatformStats {
  users: number;
  shopOwners: number;
  shops: number;
  orders: number;
  totalRevenue: number;
}

interface ShopRow {
  shopId: string;
  businessName: string;
  publicUrl: string;
  isActive: boolean;
  owner: { email: string; name: string };
  productCount: number;
  orderCount: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [shops, setShops] = useState<ShopRow[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setUser({ name: d.user.name, role: d.user.role }));
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
    fetch("/api/admin/shops")
      .then((r) => r.json())
      .then((d) => setShops(d.shops || []));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Developer Admin</h1>
        <p className="text-sm text-slate-500">Platform-wide management</p>

        {stats && (
          <div className="mt-6 grid sm:grid-cols-5 gap-4">
            {[
              { label: "Users", value: stats.users },
              { label: "Shop owners", value: stats.shopOwners },
              { label: "Shops", value: stats.shops },
              { label: "Orders", value: stats.orders },
              { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-white p-4">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Business</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Link</th>
                <th className="p-3">Products</th>
                <th className="p-3">Orders</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s) => (
                <tr key={s.shopId} className="border-t">
                  <td className="p-3 font-medium">{s.businessName}</td>
                  <td className="p-3 text-slate-600">{s.owner.email}</td>
                  <td className="p-3">
                    <a
                      href={s.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      /shop/{s.shopId.slice(0, 8)}…
                    </a>
                  </td>
                  <td className="p-3">{s.productCount}</td>
                  <td className="p-3">{s.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
