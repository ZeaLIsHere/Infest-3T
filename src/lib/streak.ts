/**
 * Pencatatan & perhitungan streak belajar (PRD §7 "Should Have").
 */

export interface StudySession {
  /** Tanggal belajar, format YYYY-MM-DD. */
  date: string;
  minutes: number;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Hitung streak belajar harian (hari berturut-turut dengan ≥ 1 menit belajar).
 * - Beberapa sesi pada hari yang sama digabung.
 * - Jika hari ini belum ada sesi, perhitungan mundur dimulai dari kemarin
 *   (streak dianggap belum putus sampai hari berakhir).
 */
export function computeStreak(
  sessions: readonly StudySession[],
  today: Date = new Date(),
): number {
  const minutesByDate = new Map<string, number>();
  for (const session of sessions) {
    const current = minutesByDate.get(session.date) ?? 0;
    minutesByDate.set(session.date, current + session.minutes);
  }

  const cursor = new Date(today);
  if ((minutesByDate.get(toDateKey(cursor)) ?? 0) === 0) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while ((minutesByDate.get(toDateKey(cursor)) ?? 0) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
