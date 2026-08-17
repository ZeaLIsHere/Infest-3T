/**
 * Retrieval augmented generation luring (PRD §5, fase 2).
 * Alur: embed pertanyaan → cari chunk paling mirip (cosine similarity) →
 * susun konteks yang muat dalam budget token.
 */
import {estimateTokens} from './contextWindow';
import type {EmbeddingProvider} from './embedding';
import {cosineSimilarity} from './vector';

export interface RagChunk {
  id: number;
  content: string;
  embedding: Float32Array;
}

/** Sumber chunk; implementasi produksi = SQLite (material_chunks). */
export interface ChunkStore {
  all(): Promise<ReadonlyArray<RagChunk>>;
}

export interface RetrievedChunk {
  content: string;
  score: number;
}

export const DEFAULT_RETRIEVAL_LIMIT = 3;

/**
 * Cari chunk paling relevan untuk sebuah pertanyaan.
 * MVP memakai cosine similarity di JS; untuk korpus besar pindah ke
 * sqlite-vec (native) pada fase integrasi.
 */
export async function retrieveRelevantChunks(
  query: string,
  provider: EmbeddingProvider,
  store: ChunkStore,
  limit: number = DEFAULT_RETRIEVAL_LIMIT,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await provider.embed(query);
  const candidates = await store.all();

  const scored = candidates.map(candidate => ({
    content: candidate.content,
    score: cosineSimilarity(queryEmbedding, candidate.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Susun konteks RAG dari chunk terpilih, dipotong agar muat dalam
 * budget token (tidak melebihi context window 512).
 */
export function buildRagContext(
  chunks: readonly RetrievedChunk[],
  maxTokens: number = 200,
): string {
  let context = '';
  for (const chunk of chunks) {
    const snippet = chunk.content.trim();
    if (snippet.length === 0) {
      continue;
    }
    const candidate =
      context.length === 0 ? snippet : `${context}\n\n${snippet}`;
    if (estimateTokens(candidate) > maxTokens) {
      break;
    }
    context = candidate;
  }
  return context;
}
