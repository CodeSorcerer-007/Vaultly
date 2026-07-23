export type FileCategory = 
  | "images"
  | "videos"
  | "audio"
  | "documents"
  | "archives"
  | "apks"
  | "code"
  | "other";

export type StorageDrive = "internal" | "external" | "usb";

export interface VFSItem {
  id: string;
  name: string;
  path: string;
  folder: string;
  category: FileCategory;
  size: number;
  mimeType: string;
  extension: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isTrash: boolean;
  tags: string[];
  content?: string;
  exif?: {
    camera?: string;
    resolution?: string;
    dateTaken?: string;
    location?: string;
    iso?: number;
  };
  storageDrive: StorageDrive;
}

const STORAGE_KEY = "vaultly_vfs_items_v2";

const SAMPLE_FILES: VFSItem[] = [
  {
    id: "sample-1",
    name: "Q4_Financial_Invoice_2025.pdf",
    path: "/Documents/Financials",
    folder: "/Documents/Financials",
    category: "documents",
    size: 2450000,
    mimeType: "application/pdf",
    extension: "pdf",
    createdAt: "2025-12-15T10:30:00Z",
    updatedAt: "2025-12-15T10:30:00Z",
    isFavorite: true,
    isTrash: false,
    tags: ["invoice", "finance", "q4", "tax"],
    content: "Invoice #INV-2025-9941 for Consulting Services & Cloud Architecture Audit. Total Amount Due: $14,500.00 USD. Vendor: Vaultly Corp.",
    storageDrive: "internal"
  },
  {
    id: "sample-2",
    name: "HomeScreen.kt",
    path: "/Code/AndroidApp",
    folder: "/Code/AndroidApp",
    category: "code",
    size: 4800,
    mimeType: "text/x-kotlin",
    extension: "kt",
    createdAt: "2026-01-10T14:22:00Z",
    updatedAt: "2026-01-12T09:15:00Z",
    isFavorite: true,
    isTrash: false,
    tags: ["kotlin", "android", "jetpack-compose", "ui"],
    content: "package com.example.aura.ui.screens\n\n@Composable\nfun HomeScreen(viewModel: HomeViewModel = hiltViewModel()) {\n    // Main UI container with modern glassmorphism design\n}",
    storageDrive: "internal"
  },
  {
    id: "sample-3",
    name: "sunset_beach_hdr.jpg",
    path: "/Pictures/Vacation2025",
    folder: "/Pictures/Vacation2025",
    category: "images",
    size: 5800000,
    mimeType: "image/jpeg",
    extension: "jpg",
    createdAt: "2025-08-20T18:45:00Z",
    updatedAt: "2025-08-20T18:45:00Z",
    isFavorite: true,
    isTrash: false,
    tags: ["vacation", "sunset", "beach", "photo", "4k"],
    exif: {
      camera: "Sony A7IV",
      resolution: "3840x2160",
      dateTaken: "2025-08-20 18:42",
      location: "Malibu, California",
      iso: 100
    },
    storageDrive: "internal"
  },
  {
    id: "sample-4",
    name: "System_Audit_Log_2026.log",
    path: "/Downloads/Logs",
    folder: "/Downloads/Logs",
    category: "other",
    size: 154000,
    mimeType: "text/plain",
    extension: "log",
    createdAt: "2026-02-01T04:00:00Z",
    updatedAt: "2026-02-01T04:00:00Z",
    isFavorite: false,
    isTrash: false,
    tags: ["log", "system", "audit", "junk-candidate"],
    content: "[INFO] 2026-02-01 04:00:01 - Universal local indexer initialized.\n[DEBUG] 2026-02-01 04:00:02 - Cleaned up 0 temp files.",
    storageDrive: "internal"
  },
  {
    id: "sample-5",
    name: "Project_Backup_v1.2.zip",
    path: "/Archives",
    folder: "/Archives",
    category: "archives",
    size: 45000000,
    mimeType: "application/zip",
    extension: "zip",
    createdAt: "2026-01-05T12:00:00Z",
    updatedAt: "2026-01-05T12:00:00Z",
    isFavorite: false,
    isTrash: false,
    tags: ["backup", "zip", "archive", "large-file"],
    content: "Contains: src/, assets/, config.json, database.sqlite, invoice_summary.txt",
    storageDrive: "external"
  },
  {
    id: "sample-6",
    name: "vaultly_mobile_beta.apk",
    path: "/Downloads/APKs",
    folder: "/Downloads/APKs",
    category: "apks",
    size: 28500000,
    mimeType: "application/vnd.android.package-archive",
    extension: "apk",
    createdAt: "2026-02-14T09:30:00Z",
    updatedAt: "2026-02-14T09:30:00Z",
    isFavorite: false,
    isTrash: false,
    tags: ["apk", "android", "build"],
    storageDrive: "internal"
  },
  {
    id: "sample-7",
    name: "interstellar_theme.mp3",
    path: "/Audio/Music",
    folder: "/Audio/Music",
    category: "audio",
    size: 8900000,
    mimeType: "audio/mpeg",
    extension: "mp3",
    createdAt: "2025-11-11T20:10:00Z",
    updatedAt: "2025-11-11T20:10:00Z",
    isFavorite: true,
    isTrash: false,
    tags: ["music", "soundtrack", "hans-zimmer"],
    storageDrive: "usb"
  },
  {
    id: "sample-8",
    name: "old_draft_notes.tmp",
    path: "/Downloads",
    folder: "/Downloads",
    category: "documents",
    size: 4200,
    mimeType: "text/plain",
    extension: "tmp",
    createdAt: "2025-05-10T11:00:00Z",
    updatedAt: "2025-05-10T11:00:00Z",
    isFavorite: false,
    isTrash: true,
    tags: ["temporary", "draft"],
    content: "Temporary scratchpad notes from old build session.",
    storageDrive: "internal"
  },
  {
    id: "sample-9",
    name: "Client_Meeting_Notes.md",
    path: "/Documents/Work",
    folder: "/Documents/Work",
    category: "documents",
    size: 15600,
    mimeType: "text/markdown",
    extension: "md",
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-15T10:30:00Z",
    isFavorite: true,
    isTrash: false,
    tags: ["work", "meeting", "notes"],
    content: "# Client Meeting - Acme Corp\n\n## Agenda\n1. Review Q3 goals\n2. Discuss new feature requests\n3. Finalize budget\n\n## Notes\n- Client wants the new dashboard by August.\n- Budget approved for $50k.\n- Need to schedule follow-up next week.",
    storageDrive: "internal"
  },
  {
    id: "sample-10",
    name: "profile_pic_new.png",
    path: "/Pictures/Profile",
    folder: "/Pictures/Profile",
    category: "images",
    size: 1200500,
    mimeType: "image/png",
    extension: "png",
    createdAt: "2026-07-01T15:20:00Z",
    updatedAt: "2026-07-01T15:20:00Z",
    isFavorite: false,
    isTrash: false,
    tags: ["profile", "avatar", "image"],
    storageDrive: "internal"
  },
  {
    id: "sample-11",
    name: "utils.ts",
    path: "/Code/WebProject/src",
    folder: "/Code/WebProject/src",
    category: "code",
    size: 3200,
    mimeType: "text/typescript",
    extension: "ts",
    createdAt: "2026-07-20T11:11:00Z",
    updatedAt: "2026-07-21T14:05:00Z",
    isFavorite: false,
    isTrash: false,
    tags: ["typescript", "code", "utils"],
    content: "export const formatDate = (date: Date) => {\n  return new Intl.DateTimeFormat('en-US').format(date);\n};\n\nexport const generateId = () => {\n  return Math.random().toString(36).substring(2, 9);\n};",
    storageDrive: "internal"
  }
];

export function getVFSFiles(): VFSItem[] {
  if (typeof window === "undefined") return SAMPLE_FILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_FILES));
      return SAMPLE_FILES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("VFS storage read error", e);
    return SAMPLE_FILES;
  }
}

export function saveVFSFiles(files: VFSItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (e) {
    console.error("VFS storage write error", e);
  }
}

export function addVFSFile(file: Partial<VFSItem> & { name: string }): VFSItem {
  const files = getVFSFiles();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  
  let category: FileCategory = "other";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) category = "images";
  else if (["mp4", "mkv", "avi", "webm", "mov"].includes(ext)) category = "videos";
  else if (["mp3", "flac", "wav", "aac", "ogg"].includes(ext)) category = "audio";
  else if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md"].includes(ext)) category = "documents";
  else if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) category = "archives";
  else if (["apk"].includes(ext)) category = "apks";
  else if (["js", "ts", "jsx", "tsx", "kt", "java", "py", "c", "cpp", "h", "json", "html", "css", "sql"].includes(ext)) category = "code";

  const newItem: VFSItem = {
    id: `vfs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    path: file.path || "/Documents",
    folder: file.folder || "/Documents",
    category,
    size: file.size || 1024,
    mimeType: file.mimeType || "application/octet-stream",
    extension: ext,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    isTrash: false,
    tags: file.tags || [ext],
    content: file.content || "",
    storageDrive: file.storageDrive || "internal"
  };

  files.unshift(newItem);
  saveVFSFiles(files);
  return newItem;
}

export function updateVFSFile(id: string, updates: Partial<VFSItem>): VFSItem[] {
  const files = getVFSFiles().map((f) => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f));
  saveVFSFiles(files);
  return files;
}

export function deleteVFSFile(id: string, permanent: boolean = false): VFSItem[] {
  let files = getVFSFiles();
  if (permanent) {
    files = files.filter((f) => f.id !== id);
  } else {
    files = files.map((f) => (f.id === id ? { ...f, isTrash: true } : f));
  }
  saveVFSFiles(files);
  return files;
}

export function restoreVFSFile(id: string): VFSItem[] {
  const files = getVFSFiles().map((f) => (f.id === id ? { ...f, isTrash: false } : f));
  saveVFSFiles(files);
  return files;
}

export function toggleVFSFavorite(id: string): VFSItem[] {
  const files = getVFSFiles().map((f) => (f.id === id ? { ...f, isFavorite: !f.isFavorite } : f));
  saveVFSFiles(files);
  return files;
}

export function resetVFSToDefaults(): VFSItem[] {
  saveVFSFiles(SAMPLE_FILES);
  return SAMPLE_FILES;
}

export function calculateStorageStats(files: VFSItem[]) {
  const activeFiles = files.filter((f) => !f.isTrash);
  const totalSize = activeFiles.reduce((acc, f) => acc + f.size, 0);

  const categories = activeFiles.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + f.size;
    return acc;
  }, {} as Record<FileCategory, number>);

  const largeFiles = activeFiles.filter((f) => f.size > 10 * 1024 * 1024); // > 10MB
  const junkFiles = activeFiles.filter((f) => f.extension === "tmp" || f.extension === "log" || f.name.includes("backup"));

  // Duplicate detection by name + size
  const nameMap = new Map<string, VFSItem[]>();
  activeFiles.forEach((f) => {
    const key = `${f.name.toLowerCase()}-${f.size}`;
    const list = nameMap.get(key) || [];
    list.push(f);
    nameMap.set(key, list);
  });

  const duplicates: VFSItem[] = [];
  nameMap.forEach((list) => {
    if (list.length > 1) {
      duplicates.push(...list.slice(1));
    }
  });

  return {
    totalSize,
    totalFiles: activeFiles.length,
    categories,
    largeFiles,
    junkFiles,
    duplicates,
    trashCount: files.filter((f) => f.isTrash).length
  };
}
