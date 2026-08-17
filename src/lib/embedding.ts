/**
 * Kontrak penyedia embedding luring (TensorFlow Lite).
 *
 * Keputusan model: universal-sentence-encoder-lite (USE Lite), 128 dimensi.
 * Alasan: didukung resmi TFLite, ukuran ~23MB (muat RAM 2GB), output
 * embedding kalimat langsung cocok untuk retrieval per-chunk, latensi CPU
 * rendah. Kekurangan: dominan bahasa Inggris. Karena dipisah di belakang
 * interface ini, model bisa diganti (mis. IndoSBERT INT8 / MUSE untuk
 * RAM >= 3GB) tanpa mengubah kode pemanggil.
 */

export interface EmbeddingProvider {
  readonly dimension: number;
  embed(text: string): Promise<Float32Array>;
}

export const USE_LITE_DIMENSION = 128;

/**
 * Placeholder sampai native binding TFLite (USE Lite) terpasang pada
 * build android/. Dipakai agar pipeline RAG bisa diuji tanpa modul native.
 */
export class NotInstalledEmbeddingProvider implements EmbeddingProvider {
  readonly dimension = USE_LITE_DIMENSION;

  async embed(_text: string): Promise<Float32Array> {
    throw new Error('Embedding TFLite (USE Lite) belum terpasang pada build native.');
  }
}
