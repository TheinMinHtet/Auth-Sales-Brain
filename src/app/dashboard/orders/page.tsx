'use client';

import React, { useState } from "react";
import {
  Download,
  Bell,
  Check
} from "lucide-react";
import { useDashboard } from "../DashboardContext";
import { Order } from "@/types/dashboard";

export default function OrdersPage() {
  const { storeState, t, lang } = useDashboard();
  const [activeVerificationReceipt, setActiveVerificationReceipt] = useState<Order | null>(null);

  if (!storeState) return null;

  const verifiedOrders = storeState.orders.filter(o => o.status === "confirmed" || o.status === "completed");
  const unverifiedPrepaysCount = storeState.orders.filter(o => o.status === "verifying" && o.paymentMethod === "prepay").length;

  const exportExcelReport = () => {
    // Mock export
    alert("Exporting CSV...");
  };

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    // Mock update
    alert(`Order ${orderId} status updated to ${status}`);
    setActiveVerificationReceipt(null);
  };

  return (
    <div className="space-y-6">
      {unverifiedPrepaysCount > 0 && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border hover:border-amber-400 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-950/10 rounded-lg">
              <Bell className="text-slate-950 animate-bounce" size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wide uppercase">
                {t("webhookAlertTitle").replace("{count}", String(unverifiedPrepaysCount))}
              </h4>
              <p className="text-[10px] text-slate-900 font-medium leading-relaxed mt-0.5">
                {t("webhookAlertBody")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const verifyingOrder = storeState.orders.find(o => o.status === "verifying" && o.paymentMethod === "prepay");
              if (verifyingOrder) {
                setActiveVerificationReceipt(verifyingOrder);
              }
            }}
            className="bg-slate-950 hover:bg-slate-900 text-white text-[9px] font-bold px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap"
          >
            {t("reviewReceipts")} →
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xs font-extrabold tracking-wider font-mono text-slate-900">
              {t("pendingTransactionsLedger")}
            </h3>
          </div>
          <button
            onClick={exportExcelReport}
            className="bg-black hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download size={12} /> {t("exportLedgerCsv")}
          </button>
        </div>

        <div className="overflow-x-auto text-[11px] text-slate-600">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-500">
                <th className="p-3">{t("orderInvoice")}</th>
                <th className="p-3">{t("clientCustomer")}</th>
                <th className="p-3">{t("addressLocation")}</th>
                <th className="p-3">{t("paymentMethod")}</th>
                <th className="p-3 text-right">{t("invoiceSum")}</th>
                <th className="p-3 text-center">{t("receiptVerification")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {storeState.orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">No business orders submitted yet.</td>
                </tr>
              ) : (
                storeState.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-all font-mono">
                    <td className="p-3 font-bold text-slate-900 text-[10px]">{o.invoiceId}</td>
                    <td className="p-3 whitespace-nowrap font-sans text-xs">
                      <span className="font-semibold text-slate-800 block">{o.customerName}</span>
                      <span className="text-[10px] text-slate-400 block">{o.customerPhone}</span>
                    </td>
                    <td className="p-3 font-sans text-[10px] text-slate-500 leading-tight">
                      <span className="font-medium text-slate-700 block">{o.township}</span>
                      <span className="text-[9px] text-slate-400 line-clamp-1">{o.shippingAddress}</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        o.paymentMethod === "prepay" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-teal-50 text-teal-700 border border-teal-100"
                      }`}>
                        {o.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">{o.totalAmount.toLocaleString()} MMK</td>
                    <td className="p-3 text-center">
                      {o.status === "verifying" ? (
                        <button
                          onClick={() => setActiveVerificationReceipt(o)}
                          className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded text-[10px] font-bold shadow hover:bg-amber-400 transition-all cursor-pointer"
                        >
                          {t("evaluateReceipt")}
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-400 italic">{t("noAuditNeeded")}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeVerificationReceipt && (
        <div className="bg-white border border-amber-500/30 rounded-2xl p-6 shadow-lg animate-fadeIn grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-4">
            <span className="text-[9px] font-bold font-mono text-amber-600 select-none block bg-amber-50 p-2 rounded-lg border border-amber-100">
              {t("evaluateReceiptHeader")}
            </span>
            {/* ... simplified evaluation details ... */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => handleUpdateOrderStatus(activeVerificationReceipt.id, "confirmed")}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs transition-all cursor-pointer text-center"
              >
                {t("confirmGenerateInvoice")}
              </button>
              <button
                onClick={() => setActiveVerificationReceipt(null)}
                className="w-full sm:flex-1 bg-slate-200 text-slate-600 font-bold py-2.5 rounded-lg text-xs transition-all cursor-pointer text-center"
              >
                {t("closeEvalPane")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
