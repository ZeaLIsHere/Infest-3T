/**
 * Repositori materi & chunk (tabel `materials` + `material_chunks`).
 * Embedding disimpan sebagai BLOB float32 (format sqlite-vec).
 */
import {blobToEmbedding, embeddingToBlob} from '../lib/vector';
import {openDatabase} from './index';

export interface StoredChunk {
  id: number;
  content: string;
  embedding: Float32Array;
}

export interface NewChunk {
  content: string;
  embedding: Float32Array;
}

export interface NewMaterial {
  title: string;
  subject: string;
  sourcePath?: string;
  chunks: ReadonlyArray<NewChunk>;
}

const INSERT_MATERIAL = `
  INSERT INTO materials (title, subject, source_path) VALUES (?, ?, ?);
`;
const INSERT_CHUNK = `
  INSERT INTO material_chunks (material_id, chunk_index, content, embedding)
  VALUES (?, ?, ?, ?);
`;
const SELECT_ALL_CHUNKS = `
  SELECT id, content, embedding FROM material_chunks;
`;
const SELECT_MATERIALS = `
  SELECT id, title, subject, source_path FROM materials ORDER BY id DESC;
`;

export interface MaterialRow {
  id: number;
  title: string;
  subject: string;
  sourcePath: string | null;
}

/**
 * Simpan materi beserta chunk + embedding-nya.
 * Mengembalikan id materi yang baru dibuat.
 */
export async function saveMaterial(input: NewMaterial): Promise<number> {
  const db = await openDatabase();
  const [result] = await db.executeSql(INSERT_MATERIAL, [
    input.title,
    input.subject,
    input.sourcePath ?? null,
  ]);
  const materialId = result.insertId;
  for (const [index, chunk] of input.chunks.entries()) {
    await db.executeSql(INSERT_CHUNK, [
      materialId,
      index,
      chunk.content,
      embeddingToBlob(chunk.embedding),
    ]);
  }
  return materialId;
}

/** Ambil daftar materi (terbaru dulu). */
export async function getAllMaterials(): Promise<MaterialRow[]> {
  const db = await openDatabase();
  const [results] = await db.executeSql(SELECT_MATERIALS);
  const materials: MaterialRow[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i) as {
      id: number;
      title: string;
      subject: string;
      source_path: string | null;
    };
    materials.push({
      id: row.id,
      title: row.title,
      subject: row.subject,
      sourcePath: row.source_path,
    });
  }
  return materials;
}

/** Ambil seluruh chunk + embedding untuk retrieval. */
export async function getAllChunkEmbeddings(): Promise<StoredChunk[]> {
  const db = await openDatabase();
  const [results] = await db.executeSql(SELECT_ALL_CHUNKS);
  const chunks: StoredChunk[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i) as {
      id: number;
      content: string;
      embedding: Uint8Array;
    };
    chunks.push({
      id: row.id,
      content: row.content,
      embedding: blobToEmbedding(row.embedding),
    });
  }
  return chunks;
}
