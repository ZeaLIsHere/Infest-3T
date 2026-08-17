/**
 * Kontrak penyedia embedding luring.
 *
 * Target akhir: universal-sentence-encoder-lite (USE Lite, 128 dimensi)
 * via TensorFlow Lite — didukung resmi TFLite, ~23MB (muat RAM 2GB),
 * embedding kalimat langsung cocok untuk retrieval per-chunk.
 *
 * MVP: HashEmbeddingProvider — embedding deterministik berbasis hashing
 * fitur (kata + bigram) tanpa modul native. Kualitas retrieval cukup untuk
 * pengembangan/verifikasi; diganti USE Lite saat native terpasang. Karena
 * dipisah di belakang interface ini, penggantian tidak mengubah pemanggil.
 */

export interface EmbeddingProvider {
  readonly dimension: number;
  embed(text: string): Promise<Float32Array>;
}

export const USE_LITE_DIMENSION = 128;

/* eslint-disable no-bitwise -- hash FNV-1a memerlukan operasi bitwise. */

/** Hash FNV-1a 32-bit (deterministik lintas platform). */
function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Embedding deterministik tanpa native: feature hashing kata (≥ 2 huruf)
 * dan bigram karakter, dinormalisasi L2. Stand-in MVP untuk USE Lite.
 */
export class HashEmbeddingProvider implements EmbeddingProvider {
  readonly dimension = USE_LITE_DIMENSION;

  async embed(text: string): Promise<Float32Array> {
    const lowered = text.toLowerCase();
    const words = lowered.match(/[a-z0-9]+/g) ?? [];
    const features: string[] = words.filter(word => word.length > 1);
    for (let i = 0; i < lowered.length - 1; i++) {
      const bigram = lowered.slice(i, i + 2);
      if (
        /[a-z0-9]/.test(bigram[0] ?? '') ||
        /[a-z0-9]/.test(bigram[1] ?? '')
      ) {
        features.push(bigram);
      }
    }

    const vector = new Float32Array(this.dimension);
    for (const feature of features) {
      const hash = hashString(feature);
      const index = hash % this.dimension;
      const sign = (hash & 1) === 0 ? 1 : -1;
      vector[index] = (vector[index] ?? 0) + sign;
    }

    // Normalisasi L2 agar cosine similarity bermakna.
    let norm = 0;
    for (let i = 0; i < vector.length; i++) {
      norm += (vector[i] ?? 0) ** 2;
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] = (vector[i] ?? 0) / norm;
      }
    }
    return vector;
  }
}

/**
 * Placeholder sampai native binding TFLite (USE Lite) terpasang pada
 * build android/. Dipakai bila aplikasi sengaja dijalankan tanpa embedding.
 */
export class NotInstalledEmbeddingProvider implements EmbeddingProvider {
  readonly dimension = USE_LITE_DIMENSION;

  async embed(_text: string): Promise<Float32Array> {
    throw new Error(
      'Embedding TFLite (USE Lite) belum terpasang pada build native.',
    );
  }
}
