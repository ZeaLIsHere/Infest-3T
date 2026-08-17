/**
 * Antrean sinkronisasi asinkron (PRD §5).
 * Catatan disimpan di SyncStore (default: in-memory; produksi: SQLite),
 * lalu dikirim dalam batch saat perangkat online. Batch yang gagal tetap
 * tersimpan agar bisa dicoba lagi (target sukses > 90%, PRD §4).
 */

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'done' | 'failed';

export interface SyncRecord {
  id: string;
  payload: unknown;
  createdAt: number;
}

/** Penyimpanan persisten antrean. */
export interface SyncStore {
  add(record: SyncRecord): Promise<void>;
  pending(): Promise<readonly SyncRecord[]>;
  remove(ids: readonly string[]): Promise<void>;
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

class InMemorySyncStore implements SyncStore {
  private records: SyncRecord[] = [];

  async add(record: SyncRecord): Promise<void> {
    this.records.push(record);
  }

  async pending(): Promise<readonly SyncRecord[]> {
    return [...this.records];
  }

  async remove(ids: readonly string[]): Promise<void> {
    this.records = this.records.filter(record => !ids.includes(record.id));
  }
}

export class AsyncSyncQueue {
  private _status: SyncStatus = 'idle';

  constructor(
    private readonly transport: SyncTransport,
    private readonly store: SyncStore = new InMemorySyncStore(),
  ) {}

  get status(): SyncStatus {
    return this._status;
  }

  async pendingCount(): Promise<number> {
    return (await this.store.pending()).length;
  }

  async enqueue(record: SyncRecord): Promise<void> {
    await this.store.add(record);
    this._status = 'pending';
  }

  async flush(): Promise<SyncResult> {
    const batch = await this.store.pending();
    if (batch.length === 0) {
      this._status = 'idle';
      return {synced: 0, failed: 0, status: 'idle'};
    }

    this._status = 'syncing';
    try {
      await this.transport.push(batch);
      await this.store.remove(batch.map(record => record.id));
      this._status = 'done';
      return {synced: batch.length, failed: 0, status: 'done'};
    } catch {
      this._status = 'failed';
      return {synced: 0, failed: batch.length, status: 'failed'};
    }
  }
}
