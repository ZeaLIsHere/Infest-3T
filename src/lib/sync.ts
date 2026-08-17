/**
 * Antrean sinkronisasi asinkron (PRD §5).
 * Catatan dikumpulkan saat luring, lalu dikirim dalam batch ketika
 * perangkat online. Batch yang gagal tetap disimpan agar bisa dicoba
 * lagi pada sinkronisasi berikutnya (target sukses > 90%, PRD §4).
 */

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'done' | 'failed';

export interface SyncRecord {
  id: string;
  payload: unknown;
  createdAt: number;
}

/** Transport pengiriman batch. Implementasi nyata: REST API SYNC_API_URL. */
export interface SyncTransport {
  push(records: readonly SyncRecord[]): Promise<void>;
}

export interface SyncResult {
  synced: number;
  failed: number;
  status: SyncStatus;
}

export class AsyncSyncQueue {
  private records: SyncRecord[] = [];
  private _status: SyncStatus = 'idle';

  constructor(private readonly transport: SyncTransport) {}

  get status(): SyncStatus {
    return this._status;
  }

  get pendingCount(): number {
    return this.records.length;
  }

  enqueue(record: SyncRecord): void {
    this.records.push(record);
    this._status = 'pending';
  }

  async flush(): Promise<SyncResult> {
    if (this.records.length === 0) {
      this._status = 'idle';
      return {synced: 0, failed: 0, status: 'idle'};
    }

    this._status = 'syncing';
    const batch = [...this.records];
    try {
      await this.transport.push(batch);
      this.records = [];
      this._status = 'done';
      return {synced: batch.length, failed: 0, status: 'done'};
    } catch {
      this._status = 'failed';
      return {synced: 0, failed: batch.length, status: 'failed'};
    }
  }
}
