'use client';

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";

export default function DeliveryPage() {
  const { storeState, t } = useDashboard();
  const [newZone, setNewZone] = useState({
    township: "",
    rate: 2000,
    deliveryTime: "1-2 Days"
  });

  if (!storeState) return null;

  const handleAddZone = () => {
    alert("Adding zone (mock)");
  };

  const handleDeleteZone = (idx: number, name: string) => {
    alert(`Deleting zone ${name} (mock)`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
        <h3 className="text-xs font-extrabold font-mono text-slate-900 uppercase">
          {t("townshipDeliveryRateMatrix")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 items-end text-xs text-slate-700">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[9px] text-[#475569] block font-mono font-bold uppercase">{t("townshipNameLabel")}</label>
            <input
              type="text"
              value={newZone.township}
              onChange={(e) => setNewZone({ ...newZone, township: e.target.value })}
              placeholder="e.g., Yankin, Tamwe, North Dagon"
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-[#475569] block font-mono font-bold uppercase">{t("rateLabel")}</label>
            <input
              type="number"
              value={newZone.rate}
              onChange={(e) => setNewZone({ ...newZone, rate: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-[#0b1429] font-mono"
            />
          </div>
          <button
            onClick={handleAddZone}
            className="bg-black hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs cursor-pointer h-9 transition-all uppercase"
          >
            {t("addRateRule")}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden text-xs shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-500">
              <th className="p-3">{t("matchedTownship")}</th>
              <th className="p-3">{t("rateLabel")}</th>
              <th className="p-3">{t("estimatedTransit")}</th>
              <th className="p-3 text-center">{t("settingsActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-600 font-mono">
            {storeState.deliveryZones.map((zone, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                <td className="p-3 font-bold text-slate-800">{zone.township}</td>
                <td className="p-3 text-emerald-600 font-bold">{zone.rate.toLocaleString()} MMK</td>
                <td className="p-3 text-slate-500">{zone.deliveryTime}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDeleteZone(idx, zone.township)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[9px] px-2.5 py-1 rounded-md border border-rose-150 cursor-pointer"
                  >
                    {t("removeRule")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
