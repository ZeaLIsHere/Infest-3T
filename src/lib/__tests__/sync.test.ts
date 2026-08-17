import {AsyncSyncQueue, type SyncRecord} from '../sync';

function record(id: string): SyncRecord {
  return {id, payload: {id}, createdAt: Date.now()};
}

describe('AsyncSyncQueue', () => {
  it('flush tanpa antrean menghasilkan status idle', async () => {
    const queue = new AsyncSyncQueue({push: jest.fn()});
    const result = await queue.flush();
    expect(result.status).toBe('idle');
    expect(queue.pendingCount).toBe(0);
  });

  it('mengirim batch dan mengosongkan antrean saat sukses', async () => {
    const push = jest.fn().mockResolvedValue(undefined);
    const queue = new AsyncSyncQueue({push});
    queue.enqueue(record('a'));
    queue.enqueue(record('b'));

    const result = await queue.flush();

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[0]).toHaveLength(2);
    expect(result).toEqual({synced: 2, failed: 0, status: 'done'});
    expect(queue.pendingCount).toBe(0);
  });

  it('menyimpan batch saat gagal agar bisa dicoba lagi', async () => {
    const push = jest.fn().mockRejectedValue(new Error('offline'));
    const queue = new AsyncSyncQueue({push});
    queue.enqueue(record('a'));

    const result = await queue.flush();

    expect(result).toEqual({synced: 0, failed: 1, status: 'failed'});
    expect(queue.pendingCount).toBe(1);
  });

  it('enqueue menandai status pending', () => {
    const queue = new AsyncSyncQueue({push: jest.fn()});
    expect(queue.status).toBe('idle');
    queue.enqueue(record('a'));
    expect(queue.status).toBe('pending');
    expect(queue.pendingCount).toBe(1);
  });
});
