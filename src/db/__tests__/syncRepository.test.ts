jest.mock('react-native-sqlite-storage');

import type {SyncRecord} from '../../lib/sync';
import {enqueueSyncRecord, SqliteSyncStore} from '../syncRepository';

const sqliteMock = jest.requireMock('react-native-sqlite-storage') as {
  __resetStudySessions: () => void;
  __resetSyncQueue: () => void;
};

beforeEach(() => {
  sqliteMock.__resetStudySessions();
  sqliteMock.__resetSyncQueue();
});

describe('SqliteSyncStore', () => {
  it('menyimpan dan mengambil ulang record (payload JSON)', async () => {
    const store = new SqliteSyncStore();
    const record: SyncRecord = {
      id: 'r1',
      payload: {type: 'study_session', date: '2026-08-17', minutes: 10},
      createdAt: 1234,
    };

    await store.add(record);
    const pending = await store.pending();

    expect(pending).toEqual([record]);
  });

  it('mengembalikan record urut berdasarkan waktu pembuatan', async () => {
    const store = new SqliteSyncStore();
    await store.add({id: 'r1', payload: {n: 1}, createdAt: 10});
    await store.add({id: 'r2', payload: {n: 2}, createdAt: 5});

    const pending = await store.pending();

    expect(pending.map(r => r.id)).toEqual(['r2', 'r1']);
  });

  it('menghapus record yang sudah disinkronkan', async () => {
    const store = new SqliteSyncStore();
    await store.add({id: 'r1', payload: {n: 1}, createdAt: 1});
    await store.add({id: 'r2', payload: {n: 2}, createdAt: 2});

    await store.remove(['r1']);

    expect((await store.pending()).map(r => r.id)).toEqual(['r2']);
  });

  it('remove tanpa id tidak melakukan apa-apa', async () => {
    const store = new SqliteSyncStore();
    await expect(store.remove([])).resolves.toBeUndefined();
  });
});

describe('enqueueSyncRecord', () => {
  it('membuat record dengan id unik dan createdAt terisi', async () => {
    await enqueueSyncRecord({type: 'study_session', date: '2026-08-17'});

    const pending = await new SqliteSyncStore().pending();

    expect(pending).toHaveLength(1);
    expect(pending[0]?.payload).toEqual({type: 'study_session', date: '2026-08-17'});
    expect(pending[0]?.id).toBeDefined();
    expect(typeof pending[0]?.createdAt).toBe('number');
  });
});
