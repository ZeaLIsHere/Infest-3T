import {AsyncSyncQueue, type SyncRecord} from '../sync';
import {SyncService} from '../syncService';

function record(id: string): SyncRecord {
  return {id, payload: {id}, createdAt: Date.now()};
}

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('SyncService', () => {
  it('flush otomatis saat status online', async () => {
    const network: {listener: ((online: boolean) => void) | null} = {
      listener: null,
    };
    const subscribe = jest.fn((cb: (online: boolean) => void) => {
      network.listener = cb;
      return () => {
        network.listener = null;
      };
    });
    const push = jest.fn().mockResolvedValue(undefined);
    const queue = new AsyncSyncQueue({push});
    await queue.enqueue(record('a'));

    const service = new SyncService(queue, subscribe);
    service.start();
    expect(subscribe).toHaveBeenCalledTimes(1);

    network.listener?.(true);
    await tick();

    expect(push).toHaveBeenCalledTimes(1);
    service.stop();
  });

  it('tidak flush saat perangkat offline', async () => {
    const network: {listener: ((online: boolean) => void) | null} = {
      listener: null,
    };
    const subscribe = jest.fn((cb: (online: boolean) => void) => {
      network.listener = cb;
      return () => {};
    });
    const push = jest.fn().mockResolvedValue(undefined);
    const queue = new AsyncSyncQueue({push});
    await queue.enqueue(record('a'));

    const service = new SyncService(queue, subscribe);
    service.start();
    network.listener?.(false);
    await tick();

    expect(push).not.toHaveBeenCalled();
    service.stop();
  });

  it('stop menghentikan langganan jaringan', () => {
    const unsubscribe = jest.fn();
    const subscribe = jest.fn(() => unsubscribe);
    const service = new SyncService(
      new AsyncSyncQueue({push: jest.fn()}),
      subscribe,
    );

    service.start();
    service.stop();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('start dua kali tidak membuat dua langganan', () => {
    const subscribe = jest.fn(() => jest.fn());
    const service = new SyncService(
      new AsyncSyncQueue({push: jest.fn()}),
      subscribe,
    );

    service.start();
    service.start();

    expect(subscribe).toHaveBeenCalledTimes(1);
  });

  it('flushNow mengembalikan hasil sinkronisasi', async () => {
    const push = jest.fn().mockResolvedValue(undefined);
    const queue = new AsyncSyncQueue({push});
    await queue.enqueue(record('a'));

    const service = new SyncService(
      queue,
      jest.fn(() => jest.fn()),
    );
    const result = await service.flushNow();

    expect(result).toEqual({synced: 1, failed: 0, status: 'done'});
  });

  it('flushNow tidak menjalankan flush ganda secara bersamaan', async () => {
    let resolvePush: (() => void) | undefined;
    const push = jest.fn(
      () =>
        new Promise<void>(resolve => {
          resolvePush = resolve;
        }),
    );
    const queue = new AsyncSyncQueue({push});
    await queue.enqueue(record('a'));

    const service = new SyncService(
      queue,
      jest.fn(() => jest.fn()),
    );
    const first = service.flushNow();
    const second = service.flushNow();

    const secondResult = await second;
    expect(push).toHaveBeenCalledTimes(1);
    expect(secondResult.synced).toBe(0);

    resolvePush?.();
    await first;
    // Flush kedua tidak memicu pengiriman tambahan.
    expect(push).toHaveBeenCalledTimes(1);
  });
});
