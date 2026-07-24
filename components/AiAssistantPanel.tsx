"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Search,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Zap,
  Trash2
} from "lucide-react";
import { VFSItem, calculateStorageStats } from "@/lib/vfsStorage";
import { generateSmartBatchNames, processNaturalLanguageQuery } from "@/lib/offlineAiEngine";

interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  files: VFSItem[];
  onBatchActionSuccess: () => void;
  onSelectFiles: (files: VFSItem[]) => void;
}

export default function AiAssistantPanel({
  isOpen,
  onClose,
  files,
  onBatchActionSuccess,
  onSelectFiles
}: AiAssistantPanelProps) {
  const [nlQuery, setNlQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "cleanup" | "rename">("search");
  const [batchPrefix, setBatchPrefix] = useState("Project_File");
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const stats = calculateStorageStats(files);

  const handleNlSearch = async (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const queryToUse = promptOverride || nlQuery;
    if (!queryToUse.trim()) return;

    setIsThinking(true);
    setAiResponse(null);

    try {
      // Map files to lightweight metadata for the API
      const filesMetadata = files.map(f => ({
        id: f.id,
        name: f.name,
        category: f.category,
        tags: f.tags,
        size: f.size
      }));

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToUse, filesMetadata })
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      setAiResponse(data.answer);

      if (data.matchedFileIds && data.matchedFileIds.length > 0) {
        const matched = files.filter(f => data.matchedFileIds.includes(f.id));
        onSelectFiles(matched);
      }
    } catch {
      // Fall back to local offline AI engine
      try {
        const localResult = processNaturalLanguageQuery(queryToUse, files);
        setAiResponse(localResult.answer);
        if (localResult.matchedFiles.length > 0) {
          onSelectFiles(localResult.matchedFiles);
        }
      } catch {
        setAiResponse("Sorry, I encountered an error. Please try again.");
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleBatchRenamePreview = () => {
    const renamed = generateSmartBatchNames(files.slice(0, 5), batchPrefix);
    setAiResponse(
      `Batch Rename Preview (${files.length} items):\n` +
        renamed.map((r) => `• ${r.oldName} ➔ ${r.newName}`).join("\n")
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-right">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-none">Vaultly AI Assistant</h3>
            <span className="text-[11px] opacity-90 font-medium">Powered by Groq</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === "search"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          NL Search
        </button>
        <button
          onClick={() => setActiveTab("cleanup")}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === "cleanup"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Storage Clean
        </button>
        <button
          onClick={() => setActiveTab("rename")}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === "rename"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Batch Rename
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
        {/* Tab 1: Natural Language Search */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <form onSubmit={handleNlSearch} className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ask anything in natural language
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  placeholder='e.g., "find invoices from last month" or "show duplicate files"'
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg accent-bg text-white"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Suggested Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Find invoices",
                  "Show duplicate files",
                  "Find temporary logs",
                  "Show Kotlin code"
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setNlQuery(prompt);
                      handleNlSearch(undefined, prompt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 text-[11px] transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Storage Cleanup Wizard */}
        {activeTab === "cleanup" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Smart Storage Health Check
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Duplicates Detected
                </span>
                <p className="text-lg font-bold mt-0.5">{stats.duplicates.length} Files</p>
                <button
                  onClick={() => onSelectFiles(stats.duplicates)}
                  className="mt-2 text-[11px] font-semibold text-amber-700 underline"
                >
                  Inspect Duplicates
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200">
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  Junk & Log Files
                </span>
                <p className="text-lg font-bold mt-0.5">{stats.junkFiles.length} Files</p>
                <button
                  onClick={() => onSelectFiles(stats.junkFiles)}
                  className="mt-2 text-[11px] font-semibold text-rose-700 underline"
                >
                  Inspect Junk
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Batch Rename */}
        {activeTab === "rename" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Batch Rename Prefix
              </label>
              <input
                type="text"
                value={batchPrefix}
                onChange={(e) => setBatchPrefix(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
            <button
              onClick={handleBatchRenamePreview}
              className="w-full py-2 px-4 rounded-xl accent-bg text-white text-xs font-semibold shadow-sm hover:opacity-95"
            >
              Generate Rename Preview
            </button>
          </div>
        )}

        {/* AI Output Result Box */}
        {isThinking ? (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 font-mono text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin" /> Thinking...
          </div>
        ) : aiResponse && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5 font-sans font-bold text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" /> AI Result
            </div>
            <pre className="whitespace-pre-line font-sans text-xs">{aiResponse}</pre>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5">
          <Zap className="w-4 h-4" /> Lightning Fast AI Search
        </span>
      </div>
    </div>
  );
}
