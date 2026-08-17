/**
 * Penyimpanan antrean sinkronisasi di SQLite (tabel `sync_queue`).
 * Record tersimpan persisten sehingga batch yang gagal tetap bisa
 * dikirim ulang setelah perangkat kembali online.
 */
import type {SyncRecord, SyncStore} from '../lib/sync';
import {openDatabase} from './index';

const INSERT_RECORD = `
  INSERT INTO sync_queue (id, payload, created_at) VALUES (?, ?, ?);
`;
const SELECT_PENDING = `
  SELECT id, payload, created_at FROM sync_queue ORDER BY created_at ASC;
`;

export class SqliteSyncStore implements SyncStore {
  async add(record: SyncRecord): Promise<void> {
    const db = await openDatabase();
    await db.executeSql(INSERT_RECORD, [
      record.id,
      JSON.stringify(record.payload),
      record.createdAt,
    ]);
  }

  async pending(): Promise<readonly SyncRecord[]> {
    const db = await openDatabase();
    const [results] = await db.executeSql(SELECT_PENDING);
    const records: SyncRecord[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i) as {
        id: string;
        payload: string;
        created_at: number;
      };
      records.push({
        id: row.id,
        payload: JSON.parse(row.payload) as unknown,
        createdAt: Number(row.created_at),
      });
    }
    return records;
  }

  async remove(ids: readonly string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const placeholders = ids.map(() => '?').join(', ');
    const db = await openDatabase();
    await db.executeSql(
      `DELETE FROM sync_queue WHERE id IN (${placeholders});`,
      [...ids],
    );
  }
}

/** Catat payload untuk dikirim saat perangkat online. */
export async function enqueueSyncRecord(payload: unknown): Promise<void> {
  const record: SyncRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    payload,
    createdAt: Date.now(),
  };
  await new SqliteSyncStore().add(record);
}
