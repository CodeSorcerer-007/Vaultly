"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Code,
  Image as ImageIcon,
  Tag,
  Calendar,
  HardDrive,
  Info,
  Sparkles,
  Check,
  Plus
} from "lucide-react";
import { VFSItem } from "@/lib/vfsStorage";

import { extractDominantColor } from "@/lib/colorExtractor";
import { motion, AnimatePresence } from "framer-motion";

interface FilePreviewModalProps {
  file: VFSItem | null;
  onClose: () => void;
  onUpdateTags: (id: string, tags: string[]) => void;
}

export default function FilePreviewModal({
  file,
  onClose,
  onUpdateTags
}: FilePreviewModalProps) {
  const [newTag, setNewTag] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [dominantColor, setDominantColor] = useState<string | null>(null);

  React.useEffect(() => {
    if (file) {
      extractDominantColor(file).then(setDominantColor);
    } else {
      setDominantColor(null);
    }
  }, [file]);

  if (!file) return null;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const updated = Array.from(new Set([...file.tags, newTag.trim().toLowerCase()]));
    onUpdateTags(file.id, updated);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = file.tags.filter((t) => t !== tagToRemove);
    onUpdateTags(file.id, updated);
  };

  const handleGenerateSummary = async () => {
    if (!file || !file.content) return;
    setIsSummarizing(true);
    setAiSummary(null);
    try {
      const res = await fetch("/api/summarize-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: file.content, fileName: file.name })
      });
      if (!res.ok) throw new Error("Failed to summarize");
      const data = await res.json();
      setAiSummary(data.summary);
    } catch (err) {
      setAiSummary("Could not generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-500"
        style={{
          backgroundColor: dominantColor ? undefined : "rgba(15, 23, 42, 0.6)",
          background: dominantColor ? `radial-gradient(circle at center, ${dominantColor.replace('hsl', 'hsla').replace(')', ', 0.3)')} 0%, rgba(15, 23, 42, 0.8) 100%)` : undefined,
          backdropFilter: "blur(8px)"
        }}
      >
        <motion.div 
          layoutId={file.id}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              {file.category === "code" ? <Code className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{file.path}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Main Content / Code View */}
          {file.content ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  File Preview
                </span>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? "animate-spin" : ""}`} /> 
                  {isSummarizing ? "Generating..." : "Generate AI Summary"}
                </button>
              </div>

              {aiSummary && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs font-medium text-blue-900 dark:text-blue-200 space-y-1 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-blue-500" /> Vaultly AI Summary
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{aiSummary}</p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-64 scrollbar-thin leading-relaxed">
                <pre>{file.content}</pre>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500">
                Binary or media file preview mode. Use default system viewers to open.
              </p>
            </div>
          )}

          {/* EXIF Metadata (If available) */}
          {file.exif && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 space-y-2">
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-600" /> Photo EXIF Metadata
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-purple-800 dark:text-purple-200">
                <div><span className="font-semibold">Camera:</span> {file.exif.camera}</div>
                <div><span className="font-semibold">Resolution:</span> {file.exif.resolution}</div>
                <div><span className="font-semibold">ISO:</span> {file.exif.iso}</div>
                <div><span className="font-semibold">Location:</span> {file.exif.location}</div>
                <div><span className="font-semibold">Date Taken:</span> {file.exif.dateTaken}</div>
              </div>
            </div>
          )}

          {/* Tags Section */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> File Tags
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {file.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 text-slate-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <form onSubmit={handleAddTag} className="inline-flex items-center">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag…"
                  className="px-3 py-1 rounded-xl text-xs bg-transparent border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none w-24"
                />
              </form>
            </div>
          </div>

          {/* Technical File Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Size</span>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Drive</span>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 capitalize">
                {file.storageDrive}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Created</span>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">MIME Type</span>
              <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                {file.mimeType}
              </p>
            </div>
          </div>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
