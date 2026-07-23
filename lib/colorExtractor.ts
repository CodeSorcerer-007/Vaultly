import { VFSItem } from "@/lib/vfsStorage";

export async function extractDominantColor(file: VFSItem): Promise<string | null> {
  // If we had actual image blobs in memory, we would draw them to a canvas and average the pixels.
  // Since Vaultly currently uses a simulated metadata-only VFS for images, we will generate a 
  // beautiful, deterministic color based on the file ID and name for the premium gradient effect.
  
  if (file.category !== 'images' && file.category !== 'videos') {
    return null;
  }

  // Simple string hash
  let hash = 0;
  const str = file.id + file.name;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL colors for a vibrant, pleasing look (S=70-90%, L=50-65%)
  const h = Math.abs(hash) % 360;
  const s = 70 + (Math.abs(hash) % 20); // 70 to 90
  const l = 50 + (Math.abs(hash) % 15); // 50 to 65

  // Return as hsl string which CSS radial-gradient can use
  return `hsl(${h}, ${s}%, ${l}%)`;
}
