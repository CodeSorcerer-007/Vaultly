import React, { useMemo, useRef } from "react";
import TopBar, { ViewMode } from "./TopBar";
import FileListGrid from "./FileListGrid";
import { VFSItem, FileCategory, StorageDrive, toggleVFSFavorite, deleteVFSFile, addVFSFile, getVFSFiles } from "@/lib/vfsStorage";
import { NavView } from "./Sidebar";
import { searchVFS } from "@/lib/searchEngine";
import { autoTagDocument } from "@/lib/offlineAiEngine";
import { motion, AnimatePresence } from "framer-motion";

export type PaneState = {
  id: string;
  currentView: NavView;
  selectedCategory?: FileCategory;
  selectedDrive?: StorageDrive;
  searchQuery: string;
  isSemanticSearch?: boolean;
  viewMode: ViewMode;
  selectedIds: string[];
  focusedId?: string;
  currentPath?: string;
};

interface FileBrowserPaneProps {
  pane: PaneState;
  allFiles: VFSItem[];
  isActive: boolean;
  onUpdatePane: (id: string, updates: Partial<PaneState>) => void;
  onSelectPane: (id: string) => void;
  onPreview: (file: VFSItem) => void;
  onOpenAi: () => void;
  onFilesChanged: (files: VFSItem[]) => void;
  onContextMenu?: (e: React.MouseEvent, file: VFSItem) => void;
}

export default function FileBrowserPane({
  pane,
  allFiles,
  isActive,
  onUpdatePane,
  onSelectPane,
  onPreview,
  onOpenAi,
  onFilesChanged,
  onContextMenu
}: FileBrowserPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Logic specific to this pane
  const filteredFiles = useMemo(() => {
    let base = allFiles;

    if (pane.currentView === "trash") {
      base = base.filter((f) => f.isTrash);
    } else {
      base = base.filter((f) => !f.isTrash);
    }

    if (pane.currentView === "private") {
      base = base.filter((f) => f.isPrivate);
    } else {
      base = base.filter((f) => !f.isPrivate);
    }

    if (pane.currentView === "favorites") {
      base = base.filter((f) => f.isFavorite);
    } else if (pane.currentView === "recent") {
      base = [...base].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (pane.currentView === "category" && pane.selectedCategory) {
      base = base.filter((f) => f.category === pane.selectedCategory);
    } else if (pane.currentView === "storage" && pane.selectedDrive) {
      base = base.filter((f) => f.storageDrive === pane.selectedDrive);
    }

    if (pane.searchQuery.trim() && !pane.isSemanticSearch) {
      const searchRes = searchVFS(base, {
        query: pane.searchQuery,
        inTrash: pane.currentView === "trash"
      });
      return searchRes.map((r) => r.item);
    }

    return base;
  }, [allFiles, pane.currentView, pane.selectedCategory, pane.selectedDrive, pane.searchQuery, pane.isSemanticSearch]);

  // Semantic Search Effect
  const [semanticResults, setSemanticResults] = React.useState<VFSItem[]>([]);
  const [isSearchingSemantic, setIsSearchingSemantic] = React.useState(false);

  React.useEffect(() => {
    if (!pane.isSemanticSearch || !pane.searchQuery.trim()) {
      setSemanticResults([]);
      return;
    }

    const runSearch = async () => {
      setIsSearchingSemantic(true);
      try {
        const { semanticSearchVFS } = await import("@/lib/semanticSearch");
        const results = await semanticSearchVFS(filteredFiles, pane.searchQuery);
        setSemanticResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingSemantic(false);
      }
    };

    const timer = setTimeout(runSearch, 500); // debounce
    return () => clearTimeout(timer);
  }, [pane.isSemanticSearch, pane.searchQuery, filteredFiles]);

  const displayedFiles = pane.isSemanticSearch && pane.searchQuery.trim() ? semanticResults : filteredFiles;

  // Keyboard Navigation
  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!displayedFiles.length) return;

      const currentIndex = pane.focusedId ? displayedFiles.findIndex(f => f.id === pane.focusedId) : -1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = currentIndex + 1 < displayedFiles.length ? currentIndex + 1 : 0;
          onUpdatePane(pane.id, { focusedId: displayedFiles[nextIndex].id });
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : displayedFiles.length - 1;
          onUpdatePane(pane.id, { focusedId: displayedFiles[prevIndex].id });
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (pane.focusedId) {
             const file = displayedFiles.find(f => f.id === pane.focusedId);
             if (file) handleToggleSelect(file.id); // Or onPreview(file) depending on desired behavior
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          onUpdatePane(pane.id, { focusedId: undefined, selectedIds: [] });
          break;
        }
        case 'Delete':
        case 'Backspace': {
          e.preventDefault();
          if (pane.focusedId || pane.selectedIds.length > 0) {
             const toDelete = pane.selectedIds.length > 0 ? pane.selectedIds : [pane.focusedId!];
             if (pane.selectedIds.length === 0 && pane.focusedId) {
                const f = displayedFiles.find(f => f.id === pane.focusedId);
                if (f) handleDelete(f);
             } else {
                handleBatchDelete();
             }
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, displayedFiles, pane.focusedId, pane.selectedIds, pane.id]);

  const handleToggleSelect = (id: string) => {
    onUpdatePane(pane.id, {
      selectedIds: pane.selectedIds.includes(id)
        ? pane.selectedIds.filter((i) => i !== id)
        : [...pane.selectedIds, id]
    });
  };

  const handleSelectAll = () => {
    if (pane.selectedIds.length === filteredFiles.length) {
      onUpdatePane(pane.id, { selectedIds: [] });
    } else {
      onUpdatePane(pane.id, { selectedIds: filteredFiles.map((f) => f.id) });
    }
  };

  const handleFavorite = (file: VFSItem) => {
    onFilesChanged(toggleVFSFavorite(file.id));
  };

  const handleDelete = (file: VFSItem) => {
    onFilesChanged(deleteVFSFile(file.id, pane.currentView === "trash"));
  };

  const handleBatchDelete = () => {
    if (!confirm(`Delete ${pane.selectedIds.length} selected file(s)?`)) return;
    let updated = allFiles;
    pane.selectedIds.forEach((id) => {
      updated = deleteVFSFile(id, pane.currentView === "trash");
    });
    onFilesChanged(updated);
    onUpdatePane(pane.id, { selectedIds: [] });
  };

  const handleBatchFavorite = () => {
    let updated = allFiles;
    pane.selectedIds.forEach((id) => {
      updated = toggleVFSFavorite(id);
    });
    onFilesChanged(updated);
    onUpdatePane(pane.id, { selectedIds: [] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const textContent = typeof evt.target?.result === "string" ? evt.target.result : undefined;
        const autoTags = autoTagDocument(file.name, textContent);
        
        addVFSFile({
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          content: textContent,
          storageDrive: pane.selectedDrive || "internal",
          tags: autoTags
        });
        onFilesChanged(getVFSFiles());
      };
      if (file.type.startsWith("text/") || file.name.endsWith(".json") || file.name.endsWith(".md")) {
        reader.readAsText(file);
      } else {
        const autoTags = autoTagDocument(file.name);
        addVFSFile({
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          storageDrive: pane.selectedDrive || "internal",
          tags: autoTags
        });
        onFilesChanged(getVFSFiles());
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter new folder name:", "New Folder");
    if (!name) return;
    addVFSFile({
      name: `${name}.folder`,
      size: 0,
      path: `/${name}`,
      folder: `/${name}`
    });
    onFilesChanged(getVFSFiles());
  };

  const displayPath = useMemo(() => {
    if (pane.currentPath) return pane.currentPath;
    let path = "Home";
    if (pane.currentView === "category" && pane.selectedCategory) {
      path += `/${pane.selectedCategory.charAt(0).toUpperCase() + pane.selectedCategory.slice(1)}`;
    } else if (pane.currentView === "storage" && pane.selectedDrive) {
      path += `/${pane.selectedDrive === 'internal' ? 'Internal Storage' : pane.selectedDrive === 'external' ? 'SD Card' : 'USB Drive'}`;
    } else if (pane.currentView === "trash") {
      path += "/Trash";
    } else if (pane.currentView === "favorites") {
      path += "/Favorites";
    }
    return path;
  }, [pane.currentPath, pane.currentView, pane.selectedCategory, pane.selectedDrive]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelectPane(pane.id)}
      className={`flex-1 flex flex-col min-w-[320px] transition-all duration-200 border-l ${
        isActive ? "border-transparent shadow-[0_0_20px_rgba(0,0,0,0.05)] z-10" : "border-slate-200 dark:border-slate-800 opacity-90 scale-[0.99]"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      <TopBar
        currentPath={displayPath}
        searchQuery={pane.searchQuery}
        onSearchChange={(q) => onUpdatePane(pane.id, { searchQuery: q })}
        viewMode={pane.viewMode}
        onViewModeChange={(m) => onUpdatePane(pane.id, { viewMode: m })}
        selectedCategory={pane.selectedCategory || "all"}
        onCategoryFilterChange={(cat) => {
          if (cat === "all") onUpdatePane(pane.id, { currentView: "home", selectedCategory: undefined });
          else onUpdatePane(pane.id, { currentView: "category", selectedCategory: cat });
        }}
        onUploadClick={() => fileInputRef.current?.click()}
        onCreateFolderClick={handleCreateFolder}
        selectedCount={pane.selectedIds.length}
        onBatchDelete={handleBatchDelete}
        onBatchFavorite={handleBatchFavorite}
        onBatchRename={onOpenAi}
        onClearSelection={() => onUpdatePane(pane.id, { selectedIds: [] })}
        isSemanticSearch={pane.isSemanticSearch || false}
        onSemanticSearchToggle={(val) => onUpdatePane(pane.id, { isSemanticSearch: val })}
      />

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin relative">
        {isSearchingSemantic && (
          <div className="absolute top-4 right-6 flex items-center gap-2 text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> AI Searching...
          </div>
        )}
        
        {displayedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="font-medium text-sm">No files found.</p>
          </div>
        ) : (
          <FileListGrid
            files={displayedFiles}
            viewMode={pane.viewMode}
            selectedIds={pane.selectedIds}
            focusedId={pane.focusedId}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onPreview={onPreview}
            onFavorite={handleFavorite}
            onDelete={handleDelete}
            onSummarize={onPreview}
            onContextMenu={onContextMenu}
          />
        )}
      </div>
    </motion.div>
  );
}
