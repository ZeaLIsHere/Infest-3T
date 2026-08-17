/**
 * Mock manual react-native-sqlite-storage untuk Jest.
 * Menyediakan database in-memory sederhana untuk tabel study_sessions.
 */
const studySessions = [];

function rowsFrom(list) {
  return {
    length: list.length,
    item: index => list[index],
  };
}

function executeSqlSync(sql, params) {
  const statement = sql.replace(/\s+/g, ' ').trim();

  if (statement.startsWith('SELECT minutes FROM study_sessions')) {
    const rows = studySessions.filter(row => row.date === params[0]);
    return {rows: rowsFrom(rows), insertId: 0, rowsAffected: rows.length};
  }

  if (statement.startsWith('INSERT INTO study_sessions')) {
    studySessions.push({date: params[0], minutes: params[1]});
    return {rows: rowsFrom([]), insertId: studySessions.length, rowsAffected: 1};
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

  throw new Error(`Mock tidak mengenali statement: ${sql}`);
}

const database = {
  executeSql: (sql, params) =>
    Promise.resolve([executeSqlSync(sql, params)]),
};

module.exports = {
  enablePromise: jest.fn(),
  openDatabase: jest.fn(() => Promise.resolve(database)),
  __resetStudySessions: () => {
    studySessions.length = 0;
  },
};
