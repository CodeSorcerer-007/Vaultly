"use client";

import React from "react";
import {
  Search,
  LayoutGrid,
  List,
  Table as TableIcon,
  Plus,
  Upload,
  Filter,
  Trash2,
  Star,
  Edit3,
  Moon,
  Sun,
  X,
  FolderPlus,
  ArrowDownAZ,
  ArrowUpAZ,
  SortDesc,
  Lock
} from "lucide-react";
import { FileCategory } from "@/lib/vfsStorage";
import { Sparkles } from "lucide-react";

export type ViewMode = "grid" | "table" | "list";

interface TopBarProps {
  currentPath?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSemanticSearch: boolean;
  onSemanticSearchToggle: (val: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedCategory: FileCategory | "all";
  onCategoryFilterChange: (cat: FileCategory | "all") => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  selectedCount: number;
  onBatchDelete: () => void;
  onBatchFavorite: () => void;
  onBatchRename: () => void;
  onClearSelection: () => void;
  sortBy?: "name" | "date" | "size" | "type";
  sortOrder?: "asc" | "desc";
  onSortChange?: (by: "name" | "date" | "size" | "type", order: "asc" | "desc") => void;
  onLockPrivateVault?: () => void;
}

export default function TopBar({
  currentPath = "Home",
  searchQuery,
  onSearchChange,
  isSemanticSearch,
  onSemanticSearchToggle,
  viewMode,
  onViewModeChange,
  selectedCategory,
  onCategoryFilterChange,
  onUploadClick,
  onCreateFolderClick,
  selectedCount,
  onBatchDelete,
  onBatchFavorite,
  onBatchRename,
  onClearSelection,
  sortBy,
  sortOrder,
  onSortChange,
  onLockPrivateVault
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 glass-panel border-b px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
        {currentPath.split("/").filter(Boolean).map((part, index, arr) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="mx-2 text-slate-400">/</span>}
            <span className={index === arr.length - 1 ? "text-indigo-600 dark:text-indigo-400" : "hover:text-indigo-500 cursor-pointer"}>
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative flex-1 min-w-[280px] max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search filenames, EXIF, code, tags, or file contents…"
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-sm transition-all duration-200 outline-none placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onSemanticSearchToggle(!isSemanticSearch)}
          className={`absolute right-${searchQuery ? '10' : '3'} top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
            isSemanticSearch ? "bg-indigo-500/20 text-indigo-500" : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
          title="Toggle AI Semantic Search"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Batch Actions Bar (when items selected) */}
      {selectedCount > 0 ? (
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-3 py-1.5 rounded-xl animate-fade-in">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mr-1">
            {selectedCount} Selected
          </span>
          <button
            onClick={onBatchFavorite}
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            title="Favorite Selected"
          >
            <Star className="w-4 h-4 fill-amber-500" />
          </button>
          <button
            onClick={onBatchRename}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Batch Rename"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onBatchDelete}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            title="Delete Selected"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-blue-200 dark:bg-blue-800 mx-1" />
          <button
            onClick={onClearSelection}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* Category Quick Filter */}
          <div className="relative hidden md:block">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryFilterChange(e.target.value as any)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer outline-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <option value="all">All File Types</option>
              <option value="documents">Documents</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="audio">Audio</option>
              <option value="code">Source Code</option>
              <option value="archives">Archives</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Filter */}
          <div className="relative hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1">
            <SortDesc className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy || "date"}
              onChange={(e) => onSortChange?.(e.target.value as any, sortOrder || "desc")}
              className="appearance-none bg-transparent border-none text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer outline-none w-20"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={() => onSortChange?.(sortBy || "date", sortOrder === "asc" ? "desc" : "asc")}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title="Toggle Sort Order"
            >
              {sortOrder === "asc" ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Detailed Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* New Folder Button */}
          <button
            onClick={onCreateFolderClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FolderPlus className="w-4 h-4" /> Folder
          </button>

          {/* Lock Private Vault Button */}
          {currentPath.includes("Private") && onLockPrivateVault && (
            <button
              onClick={onLockPrivateVault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" /> Lock Vault
            </button>
          )}

          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl accent-bg text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>
      )}
    </header>
  );
}
