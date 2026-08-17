/**
 * Utilitas vektor embedding.
 * Format BLOB mengikuti sqlite-vec: float32 little-endian berurutan.
 */

/** Enkode Float32Array menjadi byte (untuk kolom BLOB). */
export function embeddingToBlob(embedding: Float32Array): Uint8Array {
  const buffer = new ArrayBuffer(embedding.length * 4);
  new Float32Array(buffer).set(embedding);
  return new Uint8Array(buffer);
}

/** Dekode byte BLOB kembali menjadi Float32Array. */
export function blobToEmbedding(blob: Uint8Array): Float32Array {
  const buffer = blob.buffer.slice(
    blob.byteOffset,
    blob.byteOffset + blob.byteLength,
  );
  return new Float32Array(buffer);
}

/** Kemiripan kosinus antara dua vektor (0 bila dimensi tidak cocok). */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
