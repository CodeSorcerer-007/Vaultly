"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Sidebar, { NavView } from "./Sidebar";
import FilePreviewModal from "./FilePreviewModal";
import AiAssistantPanel from "./AiAssistantPanel";
import SettingsModal, { AppTheme, AccentColor } from "./SettingsModal";
import CommandPalette from "./CommandPalette";
import ContextMenu, { ContextMenuAction } from "./ContextMenu";
import VaultDropModal from "./VaultDropModal";
import PasswordPromptModal from "./PasswordPromptModal";
import FileBrowserPane, { PaneState } from "./FileBrowserPane";
import {
  VFSItem,
  FileCategory,
  StorageDrive,
  getVFSFiles,
  resetVFSToDefaults,
  calculateStorageStats,
  updateVFSFile,
  addVFSFile
} from "@/lib/vfsStorage";
import { AnimatePresence } from "framer-motion";
import { Eye, Sparkles, Share2, Star, Trash2, Lock, Unlock, Edit2, Download } from "lucide-react";

export default function DashboardClient({
  userEmail,
  userId
}: {
  userEmail?: string;
  userId?: string;
}) {
  // VFS State
  const [files, setFiles] = useState<VFSItem[]>([]);

  // Panes State
  const [panes, setPanes] = useState<PaneState[]>([
    {
      id: "pane1",
      currentView: "home",
      searchQuery: "",
      viewMode: "grid",
      selectedIds: []
    }
  ]);
  const [activePaneId, setActivePaneId] = useState<string>("pane1");

  // Selection & Modals
  const [previewFile, setPreviewFile] = useState<VFSItem | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVaultDropOpen, setIsVaultDropOpen] = useState(false);
  const [contextMenuData, setContextMenuData] = useState<{ x: number, y: number, file: VFSItem } | null>(null);
  
  // Private Vault State
  const [isPrivateUnlocked, setIsPrivateUnlocked] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Customization
  const [theme, setTheme] = useState<AppTheme>("light");
  const [accent, setAccent] = useState<AccentColor>("blue");

  // Load VFS Files
  useEffect(() => {
    setFiles(getVFSFiles());
  }, []);

  // Theme & Accent Effect
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-accent", accent);
  }, [theme, accent]);

  // Quick Look Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        const activePane = panes.find(p => p.id === activePaneId);
        if (activePane && (activePane.focusedId || activePane.selectedIds.length === 1)) {
          e.preventDefault();
          const targetId = activePane.focusedId || activePane.selectedIds[0];
          const fileToPreview = files.find(f => f.id === targetId);
          if (fileToPreview) setPreviewFile(fileToPreview);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panes, activePaneId, files]);

  // Storage Stats Calculation
  const stats = useMemo(() => calculateStorageStats(files), [files]);
  const formattedStorage = useMemo(() => {
    return `${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`;
  }, [stats.totalSize]);

  // Pane Handlers
  const handleUpdatePane = (id: string, updates: Partial<PaneState>) => {
    setPanes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const activePane = panes.find(p => p.id === activePaneId) || panes[0];

  const handleNavigate = (view: NavView, category?: FileCategory, drive?: StorageDrive) => {
    if (view === "private" && !isPrivateUnlocked) {
      setShowPasswordPrompt(true);
      return;
    }
    handleUpdatePane(activePaneId, {
      currentView: view,
      selectedCategory: category,
      selectedDrive: drive,
      searchQuery: "",
      selectedIds: [],
      focusedId: undefined
    });
  };

  const handleContextMenu = (e: React.MouseEvent, file: VFSItem) => {
    e.preventDefault();
    setContextMenuData({ x: e.clientX, y: e.clientY, file });
  };

  const handleUpdateTags = (id: string, tags: string[]) => {
    const updated = updateVFSFile(id, { tags });
    setFiles(updated);
    if (previewFile && previewFile.id === id) {
      setPreviewFile({ ...previewFile, tags });
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset local storage to original sample files?")) {
      setFiles(resetVFSToDefaults());
      setIsSettingsOpen(false);
    }
  };

  const toggleSplitPane = () => {
    if (panes.length > 1) {
      setPanes([panes[0]]);
      setActivePaneId(panes[0].id);
    } else {
      setPanes([
        panes[0],
        {
          id: "pane2",
          currentView: "home",
          searchQuery: "",
          viewMode: "grid",
          selectedIds: []
        }
      ]);
    }
  };

  // Command Palette Handlers
  const handleCommandUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: any) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;
      Array.from(fileList).forEach((file: any) => {
        addVFSFile({
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          storageDrive: "internal"
        });
      });
      setFiles(getVFSFiles());
    };
    input.click();
  };

  const handleCommandCreateFolder = () => {
    const name = prompt("Enter new folder name:", "New Folder");
    if (!name) return;
    addVFSFile({
      name: `${name}.folder`,
      size: 0,
      path: `/${name}`,
      folder: `/${name}`
    });
    setFiles(getVFSFiles());
  };

  const handleRename = (id: string, newName: string) => {
    setFiles(updateVFSFile(id, { name: newName }));
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200 overflow-hidden">
      
      <CommandPalette 
        files={files}
        onNavigate={handleNavigate}
        onPreview={(file) => setPreviewFile(file)}
        onThemeChange={setTheme}
        onUploadFile={handleCommandUpload}
        onCreateFolder={handleCommandCreateFolder}
        onOpenVaultDrop={() => setIsVaultDropOpen(true)}
        isPrivateUnlocked={isPrivateUnlocked}
      />

      {/* Navigation Sidebar */}
      <Sidebar
        files={files}
        currentView={activePane.currentView}
        selectedCategory={activePane.selectedCategory}
        selectedDrive={activePane.selectedDrive}
        onNavigate={handleNavigate}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        usedStorageFormatted={formattedStorage}
      />

      {/* Main Content Area - Split Pane Support */}
      <main className="flex-1 flex flex-row min-w-0 overflow-hidden">
        <AnimatePresence>
          {panes.map(pane => (
            <FileBrowserPane
              key={pane.id}
              pane={pane}
              allFiles={files}
              isActive={pane.id === activePaneId}
              onUpdatePane={handleUpdatePane}
              onSelectPane={setActivePaneId}
              onPreview={(file) => setPreviewFile(file)}
              onOpenAi={() => setIsAiOpen(true)}
              onFilesChanged={setFiles}
              onContextMenu={handleContextMenu}
              onRename={handleRename}
            />
          ))}
        </AnimatePresence>
        
        {/* Toggle Split Pane Button */}
        <button 
          onClick={toggleSplitPane}
          className="absolute bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-slate-800 dark:bg-slate-700 text-white shadow-lg flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          title={panes.length > 1 ? "Close Split View" : "Split View"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h2m8-16h2a2 2 0 012 2v12a2 2 0 01-2 2h-2M15 5v14m-6-14v14" />
          </svg>
        </button>
      </main>

      {/* Modals & Slide-out Drawers */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onUpdateTags={handleUpdateTags}
      />

      <AiAssistantPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        files={files}
        onBatchActionSuccess={() => setFiles(getVFSFiles())}
        onSelectFiles={(matched) => handleUpdatePane(activePaneId, { selectedIds: matched.map((m) => m.id) })}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        accent={accent}
        onAccentChange={setAccent}
        onResetDefaults={handleResetDefaults}
      />

      <VaultDropModal
        isOpen={isVaultDropOpen}
        onClose={() => setIsVaultDropOpen(false)}
        filesToShare={files.filter(f => activePane.selectedIds.includes(f.id))}
        onFilesReceived={() => setFiles(getVFSFiles())}
      />

      {contextMenuData && (
        <ContextMenu
          x={contextMenuData.x}
          y={contextMenuData.y}
          file={contextMenuData.file}
          onClose={() => setContextMenuData(null)}
          actions={[
            { label: "Preview", icon: <Eye />, onClick: (f) => setPreviewFile(f) },
            { label: "Rename", icon: <Edit2 />, onClick: (f) => { const newName = prompt("Enter new name:", f.name); if (newName) handleRename(f.id, newName); } },
            { label: "Download", icon: <Download />, onClick: (f) => require("@/lib/vfsStorage").downloadVFSFile(f) },
            { label: "AI Summarize", icon: <Sparkles />, onClick: (f) => setPreviewFile(f) },
            { label: "Share (VaultDrop)", icon: <Share2 />, onClick: (f) => { handleUpdatePane(activePaneId, { selectedIds: [f.id] }); setIsVaultDropOpen(true); } },
            { label: contextMenuData.file.isPrivate ? "Remove from Private" : "Move to Private Vault", icon: contextMenuData.file.isPrivate ? <Unlock /> : <Lock />, onClick: (f) => setFiles(require("@/lib/vfsStorage").toggleVFSPrivate(f.id)) },
            { label: contextMenuData.file.isFavorite ? "Unfavorite" : "Favorite", icon: <Star />, onClick: (f) => setFiles(require("@/lib/vfsStorage").toggleVFSFavorite(f.id)) },
            { label: "Delete", icon: <Trash2 />, danger: true, onClick: (f) => setFiles(require("@/lib/vfsStorage").deleteVFSFile(f.id, activePane.currentView === "trash")) }
          ]}
        />
      )}

      <PasswordPromptModal
        isOpen={showPasswordPrompt}
        onClose={() => setShowPasswordPrompt(false)}
        onSuccess={() => {
          setShowPasswordPrompt(false);
          setIsPrivateUnlocked(true);
          handleUpdatePane(activePaneId, { currentView: "private", selectedCategory: undefined, selectedDrive: undefined });
        }}
      />
    </div>
  );
}
