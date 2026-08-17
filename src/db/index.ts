/**
 * Akses database SQLite (react-native-sqlite-storage).
 * Inisialisasi skema sesuai AGENT.md §6.
 */
import SQLite from 'react-native-sqlite-storage';
import {CREATE_INDEXES_SQL, CREATE_TABLES_SQL} from './schema';

SQLite.enablePromise(true);

const DB_NAME = 'pijar3t.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Buka koneksi database (singleton). */
export function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabase({name: DB_NAME, location: 'default'});
  }
  return dbPromise;
}

/** Inisialisasi skema: buat tabel + indeks jika belum ada. */
export async function initDatabase(): Promise<void> {
  const db = await openDatabase();
  await db.transaction(tx => {
    for (const statement of CREATE_TABLES_SQL) {
      tx.executeSql(statement);
    }
    for (const statement of CREATE_INDEXES_SQL) {
      tx.executeSql(statement);
    }
  });
}
