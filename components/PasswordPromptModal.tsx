"use client";

import React, { useState } from "react";
import { Lock, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasswordPromptModal({ isOpen, onClose, onSuccess }: PasswordPromptModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "12321") {
      setError(false);
      setPassword("");
      onSuccess();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--bg-main)] w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800/60">
            <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" /> Private Vault
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              This folder is securely locked. Enter your password to access your private files.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Enter password..."
                  className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                    error ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                  } text-[var(--text-primary)] rounded-xl px-4 py-3 outline-none focus:border-rose-500 transition-colors`}
                />
                {error && (
                  <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
                    Incorrect password. Try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-4 py-3 font-semibold transition-colors shadow-lg shadow-rose-500/20"
              >
                Unlock Vault <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
