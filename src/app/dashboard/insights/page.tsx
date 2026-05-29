'use client';

import React from "react";
import { useDashboard } from "../DashboardContext";
import { CustomChart } from "@/components/dashboard/CustomChart";
import { Download, Sparkles, RefreshCw } from "lucide-react";

export default function InsightsPage() {
  const { storeState, t } = useDashboard();

  if (!storeState) return null;

  const totalSalesRevenue = 0; // Mock

  const weekdaysChartData = [
    { label: "Mon", value: 45000 },
    { label: "Tue", value: 32000 },
    { label: "Wed", value: 68000 },
    { label: "Thu", value: 50000 },
    { label: "Fri", value: 47000 },
    { label: "Sat", value: 88000 },
    { label: "Sun", value: 120000 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 flex flex-col justify-between">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex-1">
            <h3 className="text-xs font-bold font-mono text-slate-600 uppercase tracking-wider mb-2">
              {t("weeklyStoreVolume")}
            </h3>
            <CustomChart data={weekdaysChartData} color="#4f46e5" title="Revenue Matrix" unit="MMK" />
          </div>
        </div>

        <div className="md:col-span-4 bg-white border border-slate-200/60 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-extrabold font-mono text-slate-700 uppercase tracking-wider mb-2">
              {t("leanAccountingStatsSummary")}
            </h3>
            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">{t("grossSalesValue")}</span>
                <strong className="text-slate-800">{totalSalesRevenue.toLocaleString()} MMK</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">{t("ordersCompiled")}</span>
                <strong className="text-slate-600">{storeState.orders.length} orders</strong>
              </div>
            </div>
          </div>
          <button className="w-full bg-black hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold tracking-wider cursor-pointer text-xs flex items-center justify-center gap-2 mt-4">
            <Download size={14} /> {t("downloadLedgerCsv")}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <h4 className="text-xs font-extrabold tracking-wider font-mono text-slate-800">
              ✨ {t("salesBrainAdvisorDesk")}
            </h4>
          </div>
          <button className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <RefreshCw size={11} /> {t("reEvaluateStrategy")}
          </button>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed text-xs text-slate-700 font-sans whitespace-pre-line">
           AI Analysis will appear here.
        </div>
      </div>
    </div>
  );
}
