jest.mock('react-native-sqlite-storage');

import {getStudySessions, recordStudyMinutes} from '../studyRepository';

const sqliteMock = jest.requireMock('react-native-sqlite-storage') as {
  __resetStudySessions: () => void;
};

beforeEach(() => {
  sqliteMock.__resetStudySessions();
});

describe('recordStudyMinutes', () => {
  it('mengabaikan menit <= 0', async () => {
    await recordStudyMinutes('2026-08-17', 0);
    expect(await getStudySessions()).toHaveLength(0);
  });

  it('menyisipkan sesi baru untuk tanggal baru', async () => {
    await recordStudyMinutes('2026-08-17', 25);
    expect(await getStudySessions()).toEqual([
      {date: '2026-08-17', minutes: 25},
    ]);
  });

  it('mengakumulasi menit untuk tanggal yang sama', async () => {
    await recordStudyMinutes('2026-08-17', 10);
    await recordStudyMinutes('2026-08-17', 15);
    expect(await getStudySessions()).toEqual([
      {date: '2026-08-17', minutes: 25},
    ]);
  });
});

describe('getStudySessions', () => {
  it('mengembalikan sesi terurut menurun (terbaru dulu)', async () => {
    await recordStudyMinutes('2026-08-15', 5);
    await recordStudyMinutes('2026-08-17', 9);
    await recordStudyMinutes('2026-08-16', 7);
    const sessions = await getStudySessions();
    expect(sessions.map(s => s.date)).toEqual([
      '2026-08-17',
      '2026-08-16',
      '2026-08-15',
    ]);
  });

  it('mengembalikan array kosong bila belum ada sesi', async () => {
    expect(await getStudySessions()).toEqual([]);
  });
});
