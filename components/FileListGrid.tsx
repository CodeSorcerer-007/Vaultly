"use client";

import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Code,
  Smartphone,
  File,
  Star,
  Trash2,
  Eye,
  Download,
  Sparkles,
  MoreVertical,
  Check
} from "lucide-react";
import { VFSItem, downloadVFSFile } from "@/lib/vfsStorage";
import { ViewMode } from "./TopBar";
import { motion, AnimatePresence, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

interface FileListGridProps {
  files: VFSItem[];
  viewMode: ViewMode;
  selectedIds: string[];
  focusedId?: string;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onPreview: (file: VFSItem) => void;
  onFavorite: (file: VFSItem) => void;
  onDelete: (file: VFSItem) => void;
  onSummarize: (file: VFSItem) => void;
  onContextMenu?: (e: React.MouseEvent, file: VFSItem) => void;
  onRename?: (id: string, newName: string) => void;
}

export default function FileListGrid({
  files,
  viewMode,
  selectedIds,
  focusedId,
  onToggleSelect,
  onSelectAll,
  onPreview,
  onFavorite,
  onDelete,
  onSummarize,
  onContextMenu,
  onRename
}: FileListGridProps) {
  const [editingFileId, setEditingFileId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  const startEditing = (file: VFSItem) => {
    setEditingFileId(file.id);
    setEditValue(file.name);
  };

  const handleRenameSubmit = (fileId: string) => {
    if (onRename && editValue.trim() !== "") {
      onRename(fileId, editValue.trim());
    }
    setEditingFileId(null);
  };

  const handleDownload = (file: VFSItem, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadVFSFile(file);
  };
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <File className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No files found</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Try adjusting your search filters or upload local files to get started.
        </p>
      </div>
    );
  }

  const getFileIcon = (file: VFSItem) => {
    switch (file.category) {
      case "images":
        return <ImageIcon className="w-6 h-6 text-purple-500" />;
      case "videos":
        return <Film className="w-6 h-6 text-pink-500" />;
      case "audio":
        return <Music className="w-6 h-6 text-amber-500" />;
      case "documents":
        return <FileText className="w-6 h-6 text-blue-500" />;
      case "code":
        return <Code className="w-6 h-6 text-emerald-500" />;
      case "archives":
        return <Archive className="w-6 h-6 text-orange-500" />;
      case "apks":
        return <Smartphone className="w-6 h-6 text-teal-500" />;
      default:
        return <File className="w-6 h-6 text-slate-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return iso;
    }
  };

  /* 1. GRID VIEW */
  if (viewMode === "grid") {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <AnimatePresence>
        {files.map((file) => {
          const isSelected = selectedIds.includes(file.id);
          const isFocused = focusedId === file.id;
          return (
            <motion.div
              layout
              variants={itemVariants}
              exit={{ opacity: 0, scale: 0.9 }}
              key={file.id}
              className={`group relative custom-card rounded-2xl p-4 transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 accent-border accent-bg/5" : ""
              } ${
                isFocused ? "ring-2 ring-indigo-400 dark:ring-indigo-500" : "hover:border-slate-300 dark:hover:border-slate-700"
              }`}
              onContextMenu={(e) => onContextMenu?.(e, file)}
            >
              {/* Top Select & Favorite */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => onToggleSelect(file.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "accent-bg text-white border-transparent"
                      : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onFavorite(file)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        file.isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Icon & File Info */}
              <div
                onClick={() => onPreview(file)}
                className="cursor-pointer flex flex-col items-center text-center py-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                  {getFileIcon(file)}
                </div>
                {editingFileId === file.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(file.id);
                      if (e.key === "Escape") setEditingFileId(null);
                    }}
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 w-full px-1 bg-transparent border-b border-blue-500 focus:outline-none text-center"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h4 
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 w-full px-1"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditing(file);
                    }}
                  >
                    {file.name}
                  </h4>
                )}
                <span className="text-[11px] font-medium text-slate-400 mt-1">
                  {formatSize(file.size)} • {formatDate(file.createdAt)}
                </span>
              </div>

              {/* Hover Actions Bar */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onPreview(file)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Preview File"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onSummarize(file)}
                    className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    title="AI Summarize"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                <button
                  onClick={(e) => handleDownload(file, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(file)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>
    );
  }

  /* 2. TABLE VIEW */
  if (viewMode === "table") {
    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 custom-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === files.length && files.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-slate-300"
                />
              </th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Size</th>
              <th className="p-3">Path</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {files.map((file) => {
              const isSelected = selectedIds.includes(file.id);
              const isFocused = focusedId === file.id;
              return (
                <tr
                  key={file.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    isSelected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  } ${isFocused ? "ring-2 ring-inset ring-indigo-400 dark:ring-indigo-500" : ""}`}
                  onContextMenu={(e) => onContextMenu?.(e, file)}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(file.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td
                    onClick={() => onPreview(file)}
                    className="p-3 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-2.5"
                  >
                    {getFileIcon(file)}
                    {editingFileId === file.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleRenameSubmit(file.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit(file.id);
                          if (e.key === "Escape") setEditingFileId(null);
                        }}
                        className="bg-transparent border-b border-blue-500 focus:outline-none flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span 
                        className="hover:underline line-clamp-1 flex-1"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startEditing(file);
                        }}
                      >
                        {file.name}
                      </span>
                    )}
                  </td>
                  <td className="p-3 capitalize text-slate-500">{file.category}</td>
                  <td className="p-3 text-slate-500">{formatSize(file.size)}</td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">{file.path}</td>
                  <td className="p-3 text-slate-500">{formatDate(file.createdAt)}</td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => onFavorite(file)}
                      className="p-1 rounded text-slate-400 hover:text-amber-500"
                    >
                      <Star className={`w-3.5 h-3.5 ${file.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                    <button
                      onClick={() => onPreview(file)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSummarize(file)}
                      className="p-1 rounded text-blue-500 hover:text-blue-700"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(file)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  /* 3. COMPACT LIST VIEW */
  return (
    <div className="space-y-1.5">
      {files.map((file) => {
        const isSelected = selectedIds.includes(file.id);
        const isFocused = focusedId === file.id;
        return (
          <div
            key={file.id}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 ${
              isSelected
                ? "accent-border accent-bg/5 border"
                : "border-slate-200/80 dark:border-slate-800 custom-card hover:border-slate-300"
            } ${isFocused ? "ring-2 ring-inset ring-indigo-400 dark:ring-indigo-500" : ""}`}
            onContextMenu={(e) => onContextMenu?.(e, file)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(file.id)}
                className="rounded border-slate-300"
              />
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {getFileIcon(file)}
              </div>
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onPreview(file)}>
                {editingFileId === file.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(file.id);
                      if (e.key === "Escape") setEditingFileId(null);
                    }}
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 w-full bg-transparent border-b border-blue-500 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h4 
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditing(file);
                    }}
                  >
                    {file.name}
                  </h4>
                )}
                <span className="text-[11px] text-slate-400">
                  {formatSize(file.size)} • {file.path}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onFavorite(file)}
                className="p-1.5 text-slate-400 hover:text-amber-500"
              >
                <Star className={`w-3.5 h-3.5 ${file.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
              </button>
              <button
                onClick={() => onPreview(file)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleDownload(file, e)}
                className="p-1.5 text-slate-400 hover:text-indigo-600"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(file)}
                className="p-1.5 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
