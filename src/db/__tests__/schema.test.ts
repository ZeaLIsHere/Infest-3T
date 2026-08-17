import {
  CREATE_INDEXES_SQL,
  CREATE_TABLES_SQL,
  TABLES,
  VECTOR_EXTENSION_NAME,
} from '../schema';

describe('schema database', () => {
  it('menyediakan semua tabel yang dibutuhkan MVP', () => {
    expect(TABLES.studySessions).toBe('study_sessions');
    expect(TABLES.chatMessages).toBe('chat_messages');
    expect(TABLES.materials).toBe('materials');
    expect(TABLES.materialChunks).toBe('material_chunks');
    expect(TABLES.syncQueue).toBe('sync_queue');
  });

  it('semua pernyataan CREATE TABLE memakai IF NOT EXISTS', () => {
    for (const statement of CREATE_TABLES_SQL) {
      expect(statement).toMatch(/^CREATE TABLE IF NOT EXISTS /);
    }
  });

  it('study_sessions memiliki UNIQUE pada kolom date untuk akumulasi', () => {
    const statement = CREATE_TABLES_SQL.find(s =>
      s.includes(TABLES.studySessions),
    );
    expect(statement).toContain('UNIQUE');
  });

  it('chunks mereferensikan materials dengan ON DELETE CASCADE', () => {
    const chunkTable = CREATE_TABLES_SQL.find(s =>
      s.includes(TABLES.materialChunks),
    );
    expect(chunkTable).toBeDefined();
    expect(chunkTable).toContain(`REFERENCES ${TABLES.materials}(id)`);
    expect(chunkTable).toContain('ON DELETE CASCADE');
  });

  it('menyediakan indeks untuk query streak & RAG', () => {
    expect(CREATE_INDEXES_SQL.join(' ')).toContain('idx_study_sessions_date');
    expect(CREATE_INDEXES_SQL.join(' ')).toContain(
      'idx_material_chunks_material',
    );
  });

  it('memiliki nama ekstensi vektor sqlite-vec', () => {
    expect(VECTOR_EXTENSION_NAME).toBe('libvec');
  });
});
