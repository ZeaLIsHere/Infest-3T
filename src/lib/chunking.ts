/**
 * Pemotongan teks buku teks menjadi chunk untuk RAG.
 * Ukuran chunk dibatasi agar total prompt tetap jauh di bawah
 * context window 512 token (AGENT.md §9).
 */
import {estimateTokens} from './contextWindow';

export interface Chunk {
  index: number;
  content: string;
}

export interface ChunkingOptions {
  /** Maksimum estimasi token per chunk (default 128). */
  maxTokens?: number;
  /** Overlap antar chunk dalam token (default ~10%). */
  overlapTokens?: number;
}

export const DEFAULT_CHUNK_MAX_TOKENS = 128;

/**
 * Bagi teks menjadi chunk dengan overlap.
 * Heuristik 1 token ≈ 3,5 karakter sama dengan estimateTokens.
 * Tidak memotong di tengah kalimat bila memungkinkan (mundur ke spasi).
 */
export function splitTextIntoChunks(
  text: string,
  options: ChunkingOptions = {},
): Chunk[] {
  const maxTokens = options.maxTokens ?? DEFAULT_CHUNK_MAX_TOKENS;
  const overlapTokens =
    options.overlapTokens ?? Math.max(1, Math.floor(maxTokens * 0.1));
  const maxChars = Math.max(1, Math.floor(maxTokens * 3.5));
  const overlapChars = Math.min(
    maxChars - 1,
    Math.max(0, Math.floor(overlapTokens * 3.5)),
  );

  const chunks: Chunk[] = [];
  let cursor = 0;
  let index = 0;

  while (cursor < text.length) {
    let end = Math.min(cursor + maxChars, text.length);
    // Jangan potong di tengah kalimat kecuali chunk-nya sangat pendek.
    const lastSpace = text.lastIndexOf(' ', end);
    if (lastSpace > cursor && end < text.length) {
      end = lastSpace;
    }

    const content = text.slice(cursor, end).trim();
    if (content.length > 0) {
      chunks.push({index, content});
      index += 1;
    }

    if (end >= text.length) {
      break;
    }
    const next = end - overlapChars;
    cursor = next > cursor ? next : end;
  }

  return chunks;
}

/** Pastikan seluruh chunk memenuhi budget token yang diminta. */
export function chunksWithinTokenBudget(
  chunks: readonly Chunk[],
  maxTokens: number,
): boolean {
  return chunks.every(chunk => estimateTokens(chunk.content) <= maxTokens);
}
