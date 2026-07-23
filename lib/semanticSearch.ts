import { pipeline, env } from '@xenova/transformers';
import { VFSItem } from './vfsStorage';

// Configure transformers to use the local files in public/models
env.allowLocalModels = true;
env.localModelPath = '/models/';
env.allowRemoteModels = false;

let extractor: any = null;

// Initialize the model (singleton)
export async function getSemanticExtractor() {
  if (extractor) return extractor;
  // Use a tiny, fast model for browser-based semantic search
  extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  });
  return extractor;
}

// Helper to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate an embedding array from text
export async function generateEmbedding(text: string): Promise<number[]> {
  const ext = await getSemanticExtractor();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// Perform semantic search
export async function semanticSearchVFS(files: VFSItem[], query: string, topK: number = 10) {
  if (!query.trim()) return [];

  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // In a real app, you would pre-compute embeddings and store them in the VFSItem or a local vector DB (like IndexedDB).
    // For this prototype, we'll embed on the fly (which can be slow if there are many files, 
    // but we only have a few mock files).
    
    const results = await Promise.all(
      files.map(async (file) => {
        // Embed the file's text representation
        const textToEmbed = `${file.name} ${file.tags.join(' ')} ${file.content ? file.content.substring(0, 500) : ''}`;
        const docEmbedding = await generateEmbedding(textToEmbed);
        const score = cosineSimilarity(queryEmbedding, docEmbedding);
        
        return { file, score };
      })
    );

    // Sort by descending score
    return results
      .filter((res) => res.score > 0.3) // threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => r.file);
      
  } catch (err) {
    console.error("Semantic search failed:", err);
    return [];
  }
}
