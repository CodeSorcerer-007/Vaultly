"use client";

import React from "react";
import {
  Home,
  Clock,
  Star,
  Download,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Archive,
  Smartphone,
  HardDrive,
  Usb,
  Trash2,
  Settings,
  Sparkles,
  ShieldCheck,
  Code, 
  Folder,
  Lock
} from "lucide-react";
import { FileCategory, StorageDrive, VFSItem, getFolderTree, FolderNode, calculateStorageStats } from "@/lib/vfsStorage";
import { motion, Variants } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";

const sidebarVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring" } }
};

export type NavView =
  | "home"
  | "recent"
  | "favorites"
  | "trash"
  | "category"
  | "storage"
  | "private";

interface SidebarProps {
  currentView: NavView;
  selectedCategory?: FileCategory;
  selectedDrive?: StorageDrive;
  onNavigate: (view: NavView, category?: FileCategory, drive?: StorageDrive) => void;
  onOpenAi: () => void;
  onOpenSettings: () => void;
  usedStorageFormatted: string;
  files: VFSItem[];
}

export default function Sidebar({
  currentView,
  selectedCategory,
  selectedDrive,
  onNavigate,
  onOpenAi,
  onOpenSettings,
  usedStorageFormatted,
  files
}: SidebarProps) {
  const isSelected = (view: NavView, category?: FileCategory, drive?: StorageDrive) => {
    if (view !== currentView) return false;
    if (category && selectedCategory !== category) return false;
    if (drive && selectedDrive !== drive) return false;
    return true;
  };

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
      active
        ? "accent-bg text-white shadow-sm font-semibold"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
    }`;

  const folderTree = React.useMemo(() => getFolderTree(files), [files]);
  const stats = React.useMemo(() => calculateStorageStats(files), [files]);
  // Assume 1GB (1024 * 1024 * 1024 bytes) max storage for demo purposes
  const storagePercentage = Math.min((stats.totalSize / (1024 * 1024 * 1024)) * 100, 100);

  const renderFolderNode = (node: FolderNode, level: number = 0): React.ReactNode => {
    if (node.name === "Root") {
      return node.children.map(child => renderFolderNode(child, level));
    }
    return (
      <div key={node.path}>
        <div 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60`}
          style={{ paddingLeft: `${(level + 1) * 0.75}rem` }}
        >
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="truncate flex-1">{node.name}</span>
          {node.fileCount > 0 && <span className="text-[10px] text-slate-400 font-mono">{node.fileCount}</span>}
        </div>
        {node.children.length > 0 && (
          <div>
            {node.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    // Recompile
    <motion.aside 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="w-64 shrink-0 glass-panel border-r flex flex-col h-screen sticky top-0 select-none z-10"
    >
      {/* Brand Header */}
      <motion.div variants={itemVariants} className="p-5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl accent-bg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Folder className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Vaultly OS</h1>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 100% Offline AI
            </span>
          </div>
        </div>
      </motion.div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Quick Access */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Access
          </div>
          <div className="space-y-1">
            <div
              onClick={() => onNavigate("home")}
              className={navItemClass(isSelected("home"))}
            >
              <Home className="w-4.5 h-4.5" /> Home
            </div>
            <div
              onClick={() => onNavigate("recent")}
              className={navItemClass(isSelected("recent"))}
            >
              <Clock className="w-4.5 h-4.5" /> Recent Files
            </div>
            <div
              onClick={() => onNavigate("favorites")}
              className={navItemClass(isSelected("favorites"))}
            >
              <Star className="w-4.5 h-4.5" /> Favorites
            </div>
            <div
              onClick={() => onNavigate("trash")}
              className={navItemClass(isSelected("trash"))}
            >
              <Trash2 className="w-4.5 h-4.5" /> Trash
            </div>
            <div
              onClick={() => onNavigate("private")}
              className={navItemClass(isSelected("private"))}
            >
              <Lock className="w-4.5 h-4.5 text-rose-500" /> Private Vault
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Categories
          </div>
          <div className="space-y-1">
            <div
              onClick={() => onNavigate("category", "images")}
              className={navItemClass(isSelected("category", "images"))}
            >
              <ImageIcon className="w-4.5 h-4.5 text-purple-500" /> Images
            </div>
            <div
              onClick={() => onNavigate("category", "videos")}
              className={navItemClass(isSelected("category", "videos"))}
            >
              <Film className="w-4.5 h-4.5 text-pink-500" /> Videos
            </div>
            <div
              onClick={() => onNavigate("category", "audio")}
              className={navItemClass(isSelected("category", "audio"))}
            >
              <Music className="w-4.5 h-4.5 text-amber-500" /> Audio
            </div>
            <div
              onClick={() => onNavigate("category", "documents")}
              className={navItemClass(isSelected("category", "documents"))}
            >
              <FileText className="w-4.5 h-4.5 text-blue-500" /> Documents
            </div>
            <div
              onClick={() => onNavigate("category", "spreadsheets")}
              className={navItemClass(isSelected("category", "spreadsheets"))}
            >
              <FileText className="w-4.5 h-4.5 text-green-500" /> Spreadsheets
            </div>
            <div
              onClick={() => onNavigate("category", "presentations")}
              className={navItemClass(isSelected("category", "presentations"))}
            >
              <FileText className="w-4.5 h-4.5 text-orange-400" /> Presentations
            </div>
            <div
              onClick={() => onNavigate("category", "ebooks")}
              className={navItemClass(isSelected("category", "ebooks"))}
            >
              <FileText className="w-4.5 h-4.5 text-indigo-400" /> E-Books
            </div>
            <div
              onClick={() => onNavigate("category", "fonts")}
              className={navItemClass(isSelected("category", "fonts"))}
            >
              <FileText className="w-4.5 h-4.5 text-slate-500" /> Fonts
            </div>
            <div
              onClick={() => onNavigate("category", "3d")}
              className={navItemClass(isSelected("category", "3d"))}
            >
              <FileText className="w-4.5 h-4.5 text-cyan-500" /> 3D Models
            </div>
            <div
              onClick={() => onNavigate("category", "executables")}
              className={navItemClass(isSelected("category", "executables"))}
            >
              <FileText className="w-4.5 h-4.5 text-red-500" /> Executables
            </div>
            <div
              onClick={() => onNavigate("category", "code")}
              className={navItemClass(isSelected("category", "code"))}
            >
              <Code className="w-4.5 h-4.5 text-emerald-500" /> Source Code
            </div>
            <div
              onClick={() => onNavigate("category", "archives")}
              className={navItemClass(isSelected("category", "archives"))}
            >
              <Archive className="w-4.5 h-4.5 text-orange-500" /> Archives
            </div>
          </div>
        </div>

        {/* Folder Tree */}
        {folderTree.children.length > 0 && (
          <div>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 flex justify-between items-center">
              Folders
            </div>
            <div className="space-y-0.5">
              {renderFolderNode(folderTree)}
            </div>
          </div>
        )}

        {/* Storage Drives */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Storage Drives
          </div>
          <div className="space-y-1">
            <div
              onClick={() => onNavigate("storage", undefined, "internal")}
              className={navItemClass(isSelected("storage", undefined, "internal"))}
            >
              <Smartphone className="w-4.5 h-4.5" /> Internal Storage
            </div>
            <div
              onClick={() => onNavigate("storage", undefined, "external")}
              className={navItemClass(isSelected("storage", undefined, "external"))}
            >
              <HardDrive className="w-4.5 h-4.5" /> SD Card / External
            </div>
            <div
              onClick={() => onNavigate("storage", undefined, "usb")}
              className={navItemClass(isSelected("storage", undefined, "usb"))}
            >
              <Usb className="w-4.5 h-4.5" /> USB Storage
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner & Footer */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
        <button
          onClick={onOpenAi}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 animate-pulse" /> Offline AI Assistant
        </button>

        {/* Local Storage Indicator */}
        <div className="px-1 py-1">
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
            <span>Local VFS Used</span>
            <span>{usedStorageFormatted} / 1.0 GB</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="accent-bg h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(storagePercentage, 2)}%` }} />
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <Settings className="w-4.5 h-4.5 text-slate-400" /> Settings & Themes
        </button>
      </div>
    </motion.aside>
  );
}
