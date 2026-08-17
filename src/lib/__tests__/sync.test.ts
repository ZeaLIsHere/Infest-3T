import {AsyncSyncQueue, type SyncRecord} from '../sync';

function record(id: string): SyncRecord {
  return {id, payload: {id}, createdAt: Date.now()};
}

describe('AsyncSyncQueue', () => {
  it('flush tanpa antrean menghasilkan status idle', async () => {
    const queue = new AsyncSyncQueue({push: jest.fn()});
    const result = await queue.flush();
    expect(result.status).toBe('idle');
    expect(await queue.pendingCount()).toBe(0);
  });

  it('mengirim batch dan mengosongkan antrean saat sukses', async () => {
    const push = jest.fn().mockResolvedValue(undefined);
    const queue = new AsyncSyncQueue({push});
    await queue.enqueue(record('a'));
    await queue.enqueue(record('b'));

    const result = await queue.flush();

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[0]).toHaveLength(2);
    expect(result).toEqual({synced: 2, failed: 0, status: 'done'});
    expect(await queue.pendingCount()).toBe(0);
  });

  it('menyimpan batch saat gagal agar bisa dicoba lagi', async () => {
    const push = jest.fn().mockRejectedValue(new Error('offline'));
    const queue = new AsyncSyncQueue({push});
    await queue.enqueue(record('a'));

    const result = await queue.flush();

    expect(result).toEqual({synced: 0, failed: 1, status: 'failed'});
    expect(await queue.pendingCount()).toBe(1);
  });

  it('batch gagal bisa dikirim ulang pada flush berikutnya', async () => {
    const push = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined);
    const queue = new AsyncSyncQueue({push});
    await queue.enqueue(record('a'));

    const first = await queue.flush();
    expect(first).toEqual({synced: 0, failed: 1, status: 'failed'});

    const second = await queue.flush();
    expect(second).toEqual({synced: 1, failed: 0, status: 'done'});
    expect(await queue.pendingCount()).toBe(0);
  });

  it('enqueue menandai status pending', async () => {
    const queue = new AsyncSyncQueue({push: jest.fn()});
    expect(queue.status).toBe('idle');
    await queue.enqueue(record('a'));
    expect(queue.status).toBe('pending');
    expect(await queue.pendingCount()).toBe(1);
  });

  it('flush hanya menghapus record yang terkirim', async () => {
    const push = jest.fn().mockResolvedValue(undefined);
    const queue = new AsyncSyncQueue({push});
    await queue.enqueue(record('a'));
    await queue.flush();
    await queue.enqueue(record('b'));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[0]?.[0]?.id).toBe('a');
    expect(await queue.pendingCount()).toBe(1);
  });
});
