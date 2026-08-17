/**
 * Status koneksi jaringan.
 * Indikator luring vs sinkronisasi wajib jelas di UI (PRD §9).
 */
import NetInfo from '@react-native-community/netinfo';

export type ConnectionStatus = 'offline' | 'online' | 'syncing';

/** Cek status koneksi satu kali. */
export async function getConnectionStatus(): Promise<ConnectionStatus> {
  const state = await NetInfo.fetch();
  return state.isConnected ? 'online' : 'offline';
}

/** Langganan perubahan status koneksi; mengembalikan fungsi berhenti. */
export function subscribeConnection(
  listener: (status: ConnectionStatus) => void,
): () => void {
  return NetInfo.addEventListener(state => {
    listener(state.isConnected ? 'online' : 'offline');
  });
}
