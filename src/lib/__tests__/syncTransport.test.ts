import type {SyncRecord} from '../sync';
import {HttpSyncTransport} from '../syncTransport';

const fetchMock = jest.fn();

function record(id: string): SyncRecord {
  return {id, payload: {id}, createdAt: Date.now()};
}

describe('HttpSyncTransport', () => {
  beforeAll(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('mengirim batch sebagai POST JSON ke endpoint', async () => {
    fetchMock.mockResolvedValue({ok: true, status: 200});
    const transport = new HttpSyncTransport('https://sync.example.test');

    await transport.push([record('a'), record('b')]);

    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    const [url, init] = call;
    expect(url).toBe('https://sync.example.test');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({'Content-Type': 'application/json'});
    const body = JSON.parse(init?.body as string);
    expect(body.records).toHaveLength(2);
  });

  it('menolak bila endpoint belum dikonfigurasi', async () => {
    const transport = new HttpSyncTransport('');
    await expect(transport.push([record('a')])).rejects.toThrow('SYNC_API_URL');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('menganggap respons non-OK sebagai kegagalan', async () => {
    fetchMock.mockResolvedValue({ok: false, status: 500});
    const transport = new HttpSyncTransport('https://sync.example.test');
    await expect(transport.push([record('a')])).rejects.toThrow('HTTP 500');
  });

  it('meneruskan error jaringan ke pemanggil', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    const transport = new HttpSyncTransport('https://sync.example.test');
    await expect(transport.push([record('a')])).rejects.toThrow('network down');
  });
});
