import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VFSItem } from "@/lib/vfsStorage";

export interface ContextMenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: (file: VFSItem) => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  file: VFSItem;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, file, actions, onClose }: ContextMenuProps) {
  // Prevent menu from going off-screen
  const menuWidth = 220;
  const menuHeight = actions.length * 40 + 40; // approximate
  const safeX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
  const safeY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y;

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      onClose();
    };
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // use a tiny delay so the click that opened it doesn't immediately close it
    const timer = setTimeout(() => {
      window.addEventListener("click", handleGlobalClick);
      window.addEventListener("contextmenu", handleGlobalClick);
      window.addEventListener("keydown", handleGlobalKeyDown);
    }, 10);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("contextmenu", handleGlobalClick);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed z-50 overflow-hidden rounded-xl border border-white/20 dark:border-slate-700/50 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 min-w-[200px]"
        style={{ left: safeX, top: safeY }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50 mb-1">
           <span className="text-xs font-semibold text-slate-500 truncate block w-[180px]">{file.name}</span>
        </div>
        <div className="flex flex-col p-1">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(file);
                onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                action.danger
                  ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center opacity-80">{action.icon}</div>
              {action.label}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
