"use client";

import React, { useState, useEffect } from "react";
// Recompile
import { Command } from "cmdk";
import { 
  Search, FileText, FileImage, FileAudio, FileVideo, FileArchive, Folder,
  Settings, Moon, Sun, Monitor, HardDrive, Share2, FolderPlus, Download
} from "lucide-react";
import { VFSItem, FileCategory, StorageDrive } from "@/lib/vfsStorage";
import { NavView } from "./Sidebar";

interface CommandPaletteProps {
  files: VFSItem[];
  onNavigate: (view: NavView, category?: FileCategory, drive?: StorageDrive) => void;
  onPreview: (file: VFSItem) => void;
  onThemeChange: (theme: "light" | "dark" | "amoled") => void;
  onCreateFolder: () => void;
  onUploadFile: () => void;
  onOpenVaultDrop: () => void;
  isPrivateUnlocked: boolean;
}

export default function CommandPalette({
  files,
  onNavigate,
  onPreview,
  onThemeChange,
  onCreateFolder,
  onUploadFile,
  onOpenVaultDrop,
  isPrivateUnlocked
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const getFileIcon = (file: VFSItem) => {
    if (file.name.endsWith(".folder")) return <Folder className="w-4 h-4" />;
    if (file.mimeType.startsWith("image/")) return <FileImage className="w-4 h-4" />;
    if (file.mimeType.startsWith("video/")) return <FileVideo className="w-4 h-4" />;
    if (file.mimeType.startsWith("audio/")) return <FileAudio className="w-4 h-4" />;
    if (file.mimeType.includes("pdf") || file.mimeType.startsWith("text/")) return <FileText className="w-4 h-4" />;
    if (file.mimeType.includes("zip") || file.mimeType.includes("rar")) return <FileArchive className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
      label="Global Command Menu"
    >
      <div className="w-full max-w-2xl bg-[var(--bg-main)] text-[var(--text-primary)] rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
        <div className="flex items-center px-4 py-3 border-b border-slate-700/50">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <Command.Input 
            value={query}
            onValueChange={setQuery}
            placeholder="Type a command or search files..." 
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-slate-500"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 text-xs font-mono text-slate-400 bg-slate-800/50 rounded-md">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-slate-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Actions" className="px-2 text-xs font-semibold text-slate-500 mb-2 mt-2">
            <Command.Item 
              onSelect={() => { onUploadFile(); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <Download className="w-4 h-4" /> Upload File
            </Command.Item>
            <Command.Item 
              onSelect={() => { onCreateFolder(); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <FolderPlus className="w-4 h-4" /> Create Folder
            </Command.Item>
            <Command.Item 
              onSelect={() => { onOpenVaultDrop(); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <Share2 className="w-4 h-4" /> VaultDrop (P2P Share)
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Navigation" className="px-2 text-xs font-semibold text-slate-500 mb-2 mt-4">
            <Command.Item 
              onSelect={() => { onNavigate("home"); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <HardDrive className="w-4 h-4" /> All Files
            </Command.Item>
            <Command.Item 
              onSelect={() => { onNavigate("category", "documents"); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <FileText className="w-4 h-4" /> Documents
            </Command.Item>
            <Command.Item 
              onSelect={() => { onNavigate("category", "images"); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <FileImage className="w-4 h-4" /> Images
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Theme" className="px-2 text-xs font-semibold text-slate-500 mb-2 mt-4">
            <Command.Item 
              onSelect={() => { onThemeChange("light"); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <Sun className="w-4 h-4" /> Light Mode
            </Command.Item>
            <Command.Item 
              onSelect={() => { onThemeChange("dark"); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <Moon className="w-4 h-4" /> Dark Mode
            </Command.Item>
            <Command.Item 
              onSelect={() => { onThemeChange("amoled"); setOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
            >
              <Monitor className="w-4 h-4" /> AMOLED Mode
            </Command.Item>
          </Command.Group>

          {query.trim().length > 0 && (
            <Command.Group heading="Files" className="px-2 text-xs font-semibold text-slate-500 mb-2 mt-4">
              {files
                .filter(f => (!f.isPrivate || isPrivateUnlocked) && f.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 10)
                .map((file) => (
                  <Command.Item 
                    key={file.id} 
                    onSelect={() => { onPreview(file); setOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer aria-selected:bg-indigo-500/10 aria-selected:text-indigo-400"
                  >
                    {getFileIcon(file)}
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-xs text-slate-500">{file.category}</span>
                  </Command.Item>
                ))}
            </Command.Group>
          )}

        </Command.List>
      </div>
    </Command.Dialog>
  );
}
