import {computeStreak, type StudySession, toDateKey} from '../streak';

describe('toDateKey', () => {
  it('memformat tanggal ke YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 7, 5))).toBe('2026-08-05');
  });
});

describe('computeStreak', () => {
  const today = new Date(2026, 7, 17); // 17 Agustus 2026

  it('menghitung 0 bila tidak ada sesi', () => {
    expect(computeStreak([], today)).toBe(0);
  });

  it('menghitung streak dari kemarin bila hari ini belum belajar', () => {
    const sessions: StudySession[] = [
      {date: '2026-08-15', minutes: 10},
      {date: '2026-08-16', minutes: 20},
    ];
    expect(computeStreak(sessions, today)).toBe(2);
  });

  it('menghitung streak termasuk hari ini', () => {
    const sessions: StudySession[] = [
      {date: '2026-08-16', minutes: 20},
      {date: '2026-08-17', minutes: 30},
    ];
    expect(computeStreak(sessions, today)).toBe(2);
  });

  it('streak putus bila ada hari kosong di tengah', () => {
    const sessions: StudySession[] = [
      {date: '2026-08-15', minutes: 10},
      {date: '2026-08-17', minutes: 30},
    ];
    expect(computeStreak(sessions, today)).toBe(1);
  });

  it('menggabungkan beberapa sesi pada hari yang sama', () => {
    const sessions: StudySession[] = [
      {date: '2026-08-16', minutes: 15},
      {date: '2026-08-16', minutes: 25},
      {date: '2026-08-17', minutes: 10},
    ];
    expect(computeStreak(sessions, today)).toBe(2);
  });

  it('sesi dengan 0 menit tidak dihitung', () => {
    const sessions: StudySession[] = [
      {date: '2026-08-16', minutes: 0},
      {date: '2026-08-17', minutes: 0},
    ];
    expect(computeStreak(sessions, today)).toBe(0);
  });
});
