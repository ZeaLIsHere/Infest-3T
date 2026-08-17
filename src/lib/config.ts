/**
 * Konfigurasi aplikasi global.
 * Batasan teknis merujuk AGENT.md §7 dan PRD §10.
 */
import {Platform} from 'react-native';

export const APP_NAME = 'Pijar 3T';

/** Batas context window global (maksimal 512 token). */
export const MAX_CONTEXT_TOKENS = 512;

/** API level minimum: Android 8.0 (API 26). */
export const MIN_ANDROID_API = 26;

/**
 * URL endpoint sinkronisasi asinkron.
 * Disuntikkan saat proses build/bundling dari variabel lingkungan
 * (lihat .env.example). Fallback undefined = mode luring penuh.
 */
declare const process: {env: {SYNC_API_URL?: string}} | undefined;

export const SYNC_API_URL: string | undefined = process?.env?.SYNC_API_URL;

/** True saat berjalan di Android (platform target utama). */
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}
