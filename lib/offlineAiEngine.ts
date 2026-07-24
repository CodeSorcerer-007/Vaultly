import { VFSItem, calculateStorageStats } from "./vfsStorage";
import { searchVFS } from "./searchEngine";

export interface AiQueryResult {
  answer: string;
  matchedFiles: VFSItem[];
  actionSuggested?: "cleanup" | "organize" | "rename" | "summarize";
}

export function processNaturalLanguageQuery(query: string, files: VFSItem[]): AiQueryResult {
  const q = query.toLowerCase().trim();

  // 1. Natural Language Intent Detection
  if (q.includes("invoice") || q.includes("bill") || q.includes("receipt") || q.includes("financial")) {
    const matched = searchVFS(files, { query: "invoice" }).map((r) => r.item);
    return {
      answer: `Found ${matched.length} financial and invoice document(s) in local storage.`,
      matchedFiles: matched
    };
  }

  if (q.includes("duplicate") || q.includes("copy") || q.includes("copies")) {
    const stats = calculateStorageStats(files);
    return {
      answer: `Detected ${stats.duplicates.length} duplicate file(s) occupying storage space. Would you like to review and clean them up?`,
      matchedFiles: stats.duplicates,
      actionSuggested: "cleanup"
    };
  }

  if (q.includes("junk") || q.includes("temp") || q.includes("clean") || q.includes("log")) {
    const stats = calculateStorageStats(files);
    return {
      answer: `Found ${stats.junkFiles.length} temporary or log file(s) that can be safely purged.`,
      matchedFiles: stats.junkFiles,
      actionSuggested: "cleanup"
    };
  }

  if (q.includes("rename") || q.includes("organize") || q.includes("sort")) {
    // Return all files or a subset for renaming
    const matched = files.filter(f => !f.isTrash).slice(0, 5); // Just 5 as an example
    return {
      answer: `I can help you rename your files. Here are some files you might want to rename.`,
      matchedFiles: matched,
      actionSuggested: "rename"
    };
  }

  if (q.includes("large") || q.includes("big") || q.includes("heavy")) {
    const stats = calculateStorageStats(files);
    return {
      answer: `Located ${stats.largeFiles.length} large file(s) exceeding 10MB.`,
      matchedFiles: stats.largeFiles
    };
  }

  if (q.includes("code") || q.includes("kotlin") || q.includes("script") || q.includes("source")) {
    const matched = files.filter((f) => !f.isTrash && f.category === "code");
    return {
      answer: `Found ${matched.length} source code file(s) across your projects.`,
      matchedFiles: matched
    };
  }

  // Fallback to universal local search
  const searchRes = searchVFS(files, { query: q }).map((r) => r.item);
  return {
    answer: `Local AI Search matched ${searchRes.length} item(s) for "${query}".`,
    matchedFiles: searchRes
  };
}

export function generateLocalSummary(file: VFSItem): string {
  if (!file.content) {
    return "This file does not contain readable text content for summarization.";
  }

  const content = file.content.toLowerCase();
  
  if (file.category === "code") {
    return "This is a source code file. It appears to define structures, variables, or UI components for a software project.";
  }

  if (file.category === "images") {
    return `This is an image file (${file.mimeType}). Judging by its tags (${file.tags.join(', ')}), it likely depicts visual content related to those topics.`;
  }

  if (file.category === "videos") {
    return `This is a video file. It is a media format that may contain motion picture and audio.`;
  }

  if (file.category === "audio") {
    return `This is an audio track (${file.mimeType}). It could be music, a podcast, or a recording.`;
  }

  if (file.category === "archives") {
    return `This is a compressed archive. It is used to bundle multiple files into a single, smaller package.`;
  }

  if (content.includes("invoice") || content.includes("total amount due")) {
    return "This document appears to be a financial invoice or billing record.";
  }

  if (content.includes("meeting") || content.includes("agenda") || content.includes("minutes")) {
    return "This document looks like meeting minutes or an agenda, containing discussion points and action items.";
  }

  if (file.content.length > 500) {
    return `This is a large text document containing approximately ${file.content.split(" ").length} words. It discusses general topics.`;
  }

  return "This is a brief text snippet or note containing short information.";
}

export function autoTagDocument(fileName: string, content?: string): string[] {
  const tags: string[] = [];
  const text = `${fileName} ${content || ""}`.toLowerCase();

  const keywordMap: Record<string, string> = {
    "invoice": "finance",
    "receipt": "finance",
    "tax": "finance",
    "meeting": "work",
    "agenda": "work",
    "report": "work",
    "project": "work",
    "todo": "planning",
    "plan": "planning",
    "draft": "draft",
    "final": "final",
    "react": "code",
    "config": "config",
    "password": "secret",
    "key": "secret",
    "personal": "personal",
    "recipe": "personal",
  };

  for (const [keyword, tag] of Object.entries(keywordMap)) {
    if (text.includes(keyword)) {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
  }

  // If no specific tags found, try to add generic ones based on extension
  if (tags.length === 0) {
    if (fileName.endsWith('.md')) tags.push('markdown');
    if (fileName.endsWith('.txt')) tags.push('text');
    if (fileName.endsWith('.json')) tags.push('data');
    if (fileName.match(/\.(jpg|png|gif|webp)$/i)) tags.push('image');
  }

  return tags.slice(0, 3); // Max 3 auto-tags
}

export function generateSmartBatchNames(files: VFSItem[], prefix: string = "Renamed_File"): Array<{id: string, oldName: string, newName: string}> {
  return files.map((file, index) => {
    // Generate a sequential name like Prefix_01.ext
    const num = (index + 1).toString().padStart(2, "0");
    const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : "";
    return {
      id: file.id,
      oldName: file.name,
      newName: `${prefix}_${num}${ext}`
    };
  });
}
