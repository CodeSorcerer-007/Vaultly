"use client";

import React from "react";
import { X, Sun, Moon, Palette, RotateCcw, ShieldCheck, Check } from "lucide-react";

export type AppTheme = "light" | "dark" | "amoled";
export type AccentColor = "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  onThemeChange: (t: AppTheme) => void;
  accent: AccentColor;
  onAccentChange: (a: AccentColor) => void;
  onResetDefaults: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  accent,
  onAccentChange,
  onResetDefaults
}: SettingsModalProps) {
  if (!isOpen) return null;

  const accents: { id: AccentColor; name: string; colorClass: string }[] = [
    { id: "blue", name: "Sapphire Blue", colorClass: "bg-blue-500" },
    { id: "emerald", name: "Emerald Green", colorClass: "bg-emerald-500" },
    { id: "violet", name: "Deep Violet", colorClass: "bg-purple-500" },
    { id: "amber", name: "Golden Amber", colorClass: "bg-amber-500" },
    { id: "rose", name: "Vibrant Rose", colorClass: "bg-rose-500" },
    { id: "cyan", name: "Cyan Teal", colorClass: "bg-cyan-500" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-500" /> Settings & Customization
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Display Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onThemeChange("light")}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/40"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" /> Light
              </button>

              <button
                onClick={() => onThemeChange("dark")}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/40"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" /> Dark
              </button>

              <button
                onClick={() => onThemeChange("amoled")}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  theme === "amoled"
                    ? "border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/40"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-black border border-slate-700" /> AMOLED
              </button>
            </div>
          </div>

          {/* Accent Customization */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Accent Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {accents.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => onAccentChange(acc.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    accent === acc.id
                      ? "border-slate-400 font-bold bg-slate-50 dark:bg-slate-800"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${acc.colorClass}`} />
                  {acc.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Data Reset */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Reset Local Storage</h4>
              <p className="text-[11px] text-slate-400">Restore default demo files & folders</p>
            </div>
            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Privacy Badge */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Privacy Enforced: 100% Offline App
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
