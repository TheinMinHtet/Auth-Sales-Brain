'use client';

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useDashboard } from "../DashboardContext";
import { Product } from "@/types/dashboard";

export default function ProductsPage() {
  const { storeState, t, lang } = useDashboard();
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [prodForm, setProdForm] = useState({
    name: "",
    category: "Desserts",
    price: 4500,
    description: "",
    stock: 25,
    image: ""
  });

  if (!storeState) return null;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    alert("Saving product...");
    setShowProductModal(false);
  };

  const handleDeleteProduct = (prod: Product) => {
    if (confirm(`Delete ${prod.name}?`)) {
      alert("Product deleted (mock)");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <h3 className="text-xs font-extrabold font-mono text-slate-900 uppercase">
            {t("premiumStoreCatalog")}
          </h3>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setProdForm({ name: "", category: "Desserts", price: 4500, description: "", stock: 25, image: "" });
            setShowProductModal(true);
          }}
          className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus size={14} /> {t("addNewProduct")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {storeState.products.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="h-40 bg-slate-100 relative overflow-hidden">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                   <ImageIcon size={40} />
                </div>
              )}
              {p.stock <= 5 && (
                <span className="absolute left-2.5 top-2.5 text-[8px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {t("lowStockTag")} ({p.stock})
                </span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-[8px] font-bold tracking-wider font-mono text-indigo-600 uppercase">
                  {t("categories")[p.category as "Desserts" | "Beverages" | "Lifestyle" | "Snacks"] || p.category}
                </div>
                <h4 className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{p.name}</h4>
              </div>
              <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 block">{t("unitPriceMmk")}:</span>
                  <span className="font-mono font-bold text-emerald-600">{p.price.toLocaleString()} MMK</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block text-right">{t("stockLevel")}:</span>
                  <span className="font-mono font-semibold text-slate-600 block text-right">{p.stock} units</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingProduct(p);
                    setProdForm({ ...p });
                    setShowProductModal(true);
                  }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Edit2 size={10} /> {t("editInfo")}
                </button>
                <button
                  onClick={() => handleDeleteProduct(p)}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Trash size={10} /> {t("delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg text-slate-700 relative z-10 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-xs font-extrabold tracking-wider font-mono text-black">
                {editingProduct ? t("editProductHeader") : t("addNewProductHeader")}
              </h4>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs text-slate-600">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-slate-400 uppercase block">{t("brandNameLabel")}</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2.5 rounded-xl font-bold uppercase tracking-wider">
                {editingProduct ? t("confirmProductRevisions") : t("addItemCatalog")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
