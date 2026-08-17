/**
 * Repositori sesi belajar (tabel `study_sessions`).
 * Akumulasi menit per tanggal; dipakai untuk perhitungan streak.
 * Sengaja tidak memakai UPSERT (ON CONFLICT) karena SQLite bawaan
 * Android 8.0 (API 26) masih versi 3.18 yang belum mendukungnya.
 */
import type {StudySession} from '../lib/streak';
import {openDatabase} from './index';
import {enqueueSyncRecord} from './syncRepository';

const SELECT_MINUTES_BY_DATE = `
  SELECT minutes FROM study_sessions WHERE date = ? LIMIT 1;
`;
const INSERT_SESSION = `
  INSERT INTO study_sessions (date, minutes) VALUES (?, ?);
`;
const ADD_MINUTES = `
  UPDATE study_sessions SET minutes = minutes + ? WHERE date = ?;
`;
const SELECT_SESSIONS = `
  SELECT date, minutes FROM study_sessions ORDER BY date DESC LIMIT 90;
`;

/**
 * Tambah menit belajar pada tanggal tertentu (format YYYY-MM-DD).
 * Baris baru dibuat bila tanggal belum ada; menit diakumulasi bila sudah ada.
 */
export async function recordStudyMinutes(
  date: string,
  minutes: number,
): Promise<void> {
  if (minutes <= 0) {
    return;
  }
  const db = await openDatabase();
  const [existing] = await db.executeSql(SELECT_MINUTES_BY_DATE, [date]);
  if (existing.rows.length > 0) {
    await db.executeSql(ADD_MINUTES, [minutes, date]);
  } else {
    await db.executeSql(INSERT_SESSION, [date, minutes]);
  }

  // Progress belajar ini wajib sampai ke guru: antrekan untuk sinkronisasi.
  try {
    await enqueueSyncRecord({type: 'study_session', date, minutes});
  } catch {
    // Gagal mengantre sinkronisasi tidak boleh menggagalkan pencatatan belajar.
  }
}

/** Ambil riwayat sesi belajar (terbaru dulu, maks 90 hari). */
export async function getStudySessions(): Promise<StudySession[]> {
  const db = await openDatabase();
  const [results] = await db.executeSql(SELECT_SESSIONS);
  const sessions: StudySession[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i) as {date: string; minutes: number};
    sessions.push({date: row.date, minutes: Number(row.minutes)});
  }
  return sessions;
}
