/**
 * Pipeline impor materi: teks buku teks → chunk → embed → simpan ke SQLite.
 * Sumber teks nantinya dari MicroSD / Wi-Fi Direct (PRD §5, fase native);
 * fungsi ini bisa dipakai oleh UI maupun prosesor impor.
 */
import {
  splitTextIntoChunks,
  type ChunkingOptions,
} from './chunking';
import type {EmbeddingProvider} from './embedding';
import {saveMaterial} from '../db/materialRepository';

export interface ImportMaterialInput {
  title: string;
  subject: string;
  sourcePath?: string;
  text: string;
  provider: EmbeddingProvider;
  chunkOptions?: ChunkingOptions;
}

export interface ImportMaterialResult {
  materialId: number;
  chunkCount: number;
}

export async function importMaterialFromText(
  input: ImportMaterialInput,
): Promise<ImportMaterialResult> {
  const chunks = splitTextIntoChunks(input.text, input.chunkOptions);
  const embedded: Array<{content: string; embedding: Float32Array}> = [];
  for (const chunk of chunks) {
    embedded.push({
      content: chunk.content,
      embedding: await input.provider.embed(chunk.content),
    });
  }
  const materialId = await saveMaterial({
    title: input.title,
    subject: input.subject,
    sourcePath: input.sourcePath,
    chunks: embedded,
  });
  return {materialId, chunkCount: embedded.length};
}
