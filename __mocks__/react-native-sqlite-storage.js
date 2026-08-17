/**
 * Mock manual react-native-sqlite-storage untuk Jest.
 * Database in-memory sederhana untuk tabel study_sessions dan sync_queue.
 */
const studySessions = [];
const syncQueue = [];
const materials = [];
const materialChunks = [];

function rowsFrom(list) {
  return {
    length: list.length,
    item: index => list[index],
  };
}

function executeSqlSync(sql, params = []) {
  const statement = sql.replace(/\s+/g, ' ').trim();

  if (statement.startsWith('SELECT minutes FROM study_sessions')) {
    const rows = studySessions.filter(row => row.date === params[0]);
    return {rows: rowsFrom(rows), insertId: 0, rowsAffected: rows.length};
  }

  if (statement.startsWith('INSERT INTO study_sessions')) {
    studySessions.push({date: params[0], minutes: params[1]});
    return {
      rows: rowsFrom([]),
      insertId: studySessions.length,
      rowsAffected: 1,
    };
  }

  if (statement.startsWith('UPDATE study_sessions')) {
    const row = studySessions.find(item => item.date === params[1]);
    if (row) {
      row.minutes += params[0];
    }
    return {rows: rowsFrom([]), insertId: 0, rowsAffected: row ? 1 : 0};
  }

  if (statement.startsWith('SELECT date, minutes FROM study_sessions')) {
    const rows = [...studySessions].sort((a, b) => (a.date < b.date ? 1 : -1));
    return {rows: rowsFrom(rows), insertId: 0, rowsAffected: rows.length};
  }

  if (statement.startsWith('INSERT INTO sync_queue')) {
    syncQueue.push({id: params[0], payload: params[1], createdAt: params[2]});
    return {rows: rowsFrom([]), insertId: 0, rowsAffected: 1};
  }

  if (statement.startsWith('SELECT id, payload, created_at FROM sync_queue')) {
    const rows = [...syncQueue]
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(row => ({
        id: row.id,
        payload: row.payload,
        created_at: row.createdAt,
      }));
    return {rows: rowsFrom(rows), insertId: 0, rowsAffected: rows.length};
  }

  if (statement.startsWith('DELETE FROM sync_queue WHERE id IN')) {
    const ids = params;
    let removed = 0;
    for (let i = syncQueue.length - 1; i >= 0; i--) {
      if (ids.includes(syncQueue[i].id)) {
        syncQueue.splice(i, 1);
        removed += 1;
      }
    }
    return {rows: rowsFrom([]), insertId: 0, rowsAffected: removed};
  }

  if (statement.startsWith('INSERT INTO materials')) {
    materials.push({
      title: params[0],
      subject: params[1],
      sourcePath: params[2],
    });
    return {rows: rowsFrom([]), insertId: materials.length, rowsAffected: 1};
  }

  if (statement.startsWith('INSERT INTO material_chunks')) {
    materialChunks.push({
      materialId: params[0],
      chunkIndex: params[1],
      content: params[2],
      embedding: params[3],
    });
    return {
      rows: rowsFrom([]),
      insertId: materialChunks.length,
      rowsAffected: 1,
    };
  }

  if (
    statement.startsWith('SELECT id, content, embedding FROM material_chunks')
  ) {
    const rows = materialChunks.map((chunk, index) => ({
      id: index + 1,
      content: chunk.content,
      embedding: chunk.embedding,
    }));
    return {rows: rowsFrom(rows), insertId: 0, rowsAffected: rows.length};
  }

  if (
    statement.startsWith(
      'SELECT id, title, subject, source_path FROM materials',
    )
  ) {
    const rows = materials
      .map((material, index) => ({
        id: index + 1,
        title: material.title,
        subject: material.subject,
        source_path: material.sourcePath,
      }))
      .reverse();
    return {rows: rowsFrom(rows), insertId: 0, rowsAffected: rows.length};
  }

  throw new Error(`Mock tidak mengenali statement: ${sql}`);
}

const database = {
  executeSql: (sql, params) => Promise.resolve([executeSqlSync(sql, params)]),
};

module.exports = {
  enablePromise: jest.fn(),
  openDatabase: jest.fn(() => Promise.resolve(database)),
  __resetStudySessions: () => {
    studySessions.length = 0;
  },
  __resetSyncQueue: () => {
    syncQueue.length = 0;
  },
  __resetMaterials: () => {
    materials.length = 0;
    materialChunks.length = 0;
  },
};
