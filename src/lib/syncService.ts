/**
 * Layanan sinkronisasi: mem-flush antrean otomatis saat perangkat online
 * (user story guru, PRD §6). Menangani koordinasi antara antrean,
 * transport, dan status jaringan.
 */
import {AsyncSyncQueue, type SyncResult} from './sync';

export class SyncService {
  private unsubscribe: (() => void) | undefined;
  private flushing = false;

  constructor(
    private readonly queue: AsyncSyncQueue,
    private readonly subscribeNetwork: (
      listener: (online: boolean) => void,
    ) => () => void,
  ) {}

  start(): void {
    if (this.unsubscribe) {
      return;
    }
    this.unsubscribe = this.subscribeNetwork(online => {
      if (online && !this.flushing) {
        this.flushNow().catch(() => {
          // Flush latar belakang gagal: batch akan dicoba lagi saat online berikutnya.
        });
      }
    });
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  async flushNow(): Promise<SyncResult> {
    if (this.flushing) {
      return {synced: 0, failed: 0, status: this.queue.status};
    }
    this.flushing = true;
    try {
      return await this.queue.flush();
    } finally {
      this.flushing = false;
    }
  }
}
