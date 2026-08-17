/**
 * Transport sinkronisasi via HTTP (fetch bawaan React Native).
 * Mengirim batch catatan sebagai POST JSON ke SYNC_API_URL.
 */
import {SYNC_API_URL} from './config';
import type {SyncRecord, SyncTransport} from './sync';

export class HttpSyncTransport implements SyncTransport {
  constructor(private readonly endpoint: string = SYNC_API_URL ?? '') {}

  async push(records: readonly SyncRecord[]): Promise<void> {
    if (this.endpoint.length === 0) {
      throw new Error('SYNC_API_URL belum dikonfigurasi.');
    }
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({records}),
    });
    if (!response.ok) {
      throw new Error(`Sinkronisasi ditolak server: HTTP ${response.status}`);
    }
  }
}
