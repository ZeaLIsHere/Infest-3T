/**
 * Skema database SQLite + sqlite-vec (AGENT.md §6).
 * Ekstensi vektor (sqlite-vec) dimuat dari library native Android.
 */

export const TABLES = {
  studySessions: 'study_sessions',
  chatMessages: 'chat_messages',
  materials: 'materials',
  materialChunks: 'material_chunks',
  syncQueue: 'sync_queue',
} as const;

export const CREATE_TABLES_SQL: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS ${TABLES.studySessions} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    minutes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.chatMessages} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.materials} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    source_path TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.materialChunks} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL
      REFERENCES ${TABLES.materials}(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding BLOB,
    UNIQUE (material_id, chunk_index)
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.syncQueue} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    synced_at TEXT
  );`,
];

export const CREATE_INDEXES_SQL: readonly string[] = [
  `CREATE INDEX IF NOT EXISTS idx_study_sessions_date
    ON ${TABLES.studySessions}(date);`,
  `CREATE INDEX IF NOT EXISTS idx_material_chunks_material
    ON ${TABLES.materialChunks}(material_id);`,
];

/**
 * Nama library ekstensi vektor sqlite-vec.
 * Path lengkap disesuaikan saat integrasi android/ (fase 2).
 */
export const VECTOR_EXTENSION_NAME = 'libvec';
