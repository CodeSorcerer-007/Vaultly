import { VFSItem, FileCategory } from "./vfsStorage";

export interface SearchFilter {
  query: string;
  category?: FileCategory | "all";
  extension?: string;
  minSize?: number; // bytes
  maxSize?: number; // bytes
  startDate?: string;
  endDate?: string;
  tags?: string[];
  inTrash?: boolean;
}

export interface SearchResult {
  item: VFSItem;
  score: number;
  matchType: "filename" | "content" | "tag" | "exif" | "folder";
  snippet?: string;
}

export function searchVFS(files: VFSItem[], filter: SearchFilter): SearchResult[] {
  const query = filter.query.trim().toLowerCase();

  return files
    .filter((file) => {
      // Trash filter
      if (filter.inTrash ? !file.isTrash : file.isTrash) return false;

      // Category filter
      if (filter.category && filter.category !== "all" && file.category !== filter.category) {
        return false;
      }

      // Extension filter
      if (filter.extension && file.extension.toLowerCase() !== filter.extension.toLowerCase()) {
        return false;
      }

      // Size filters
      if (filter.minSize && file.size < filter.minSize) return false;
      if (filter.maxSize && file.size > filter.maxSize) return false;

      // Date filters
      if (filter.startDate && new Date(file.createdAt) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(file.createdAt) > new Date(filter.endDate)) return false;

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some((t) => file.tags.includes(t.toLowerCase()));
        if (!hasTag) return false;
      }

      return true;
    })
    .map((file) => calculateRelevance(file, query))
    .filter((res): res is SearchResult => res !== null)
    .sort((a, b) => b.score - a.score);
}

function calculateRelevance(file: VFSItem, query: string): SearchResult | null {
  if (!query) {
    return { item: file, score: 1, matchType: "filename" };
  }

  const name = file.name.toLowerCase();
  const folder = file.folder.toLowerCase();
  const content = (file.content || "").toLowerCase();
  const tagsStr = file.tags.join(" ").toLowerCase();
  const exifStr = file.exif ? JSON.stringify(file.exif).toLowerCase() : "";

  let score = 0;
  let matchType: SearchResult["matchType"] = "filename";
  let snippet: string | undefined;

  // Exact filename match
  if (name === query) {
    score += 100;
    matchType = "filename";
  } else if (name.startsWith(query)) {
    score += 80;
    matchType = "filename";
  } else if (name.includes(query)) {
    score += 60;
    matchType = "filename";
  }

  // Tags match
  if (tagsStr.includes(query)) {
    score += 50;
    if (score < 50) matchType = "tag";
  }

  // EXIF metadata match
  if (exifStr.includes(query)) {
    score += 40;
    if (score < 40) matchType = "exif";
  }

  // Folder name match
  if (folder.includes(query)) {
    score += 30;
    if (score < 30) matchType = "folder";
  }

  // Content full-text match
  if (content.includes(query)) {
    score += 45;
    if (score < 45) matchType = "content";

    // Extract snippet
    const idx = content.indexOf(query);
    const start = Math.max(0, idx - 25);
    const end = Math.min(content.length, idx + query.length + 25);
    snippet = `...${content.substring(start, end)}...`;
  }

  if (score === 0) return null;

  return {
    item: file,
    score,
    matchType,
    snippet
  };
}
