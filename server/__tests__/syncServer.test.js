const fs = require('fs');
const os = require('os');
const path = require('path');
const {createSyncServer} = require('../syncServer');

function startServer(server) {
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

function stopServer(server) {
  return new Promise(resolve => server.close(resolve));
}

describe('server sinkronisasi', () => {
  it('menerima POST /sync dan menyimpan records ke file', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pijar-sync-'));
    const storagePath = path.join(dir, 'sync.json');
    const server = createSyncServer({storagePath});
    const base = await startServer(server);
    try {
      const response = await fetch(`${base}/sync`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          records: [{id: 'a', payload: {date: '2026-08-17'}, createdAt: 1}],
        }),
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.received).toBe(1);

      const saved = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
      expect(saved).toHaveLength(1);
      expect(saved[0].payload.date).toBe('2026-08-17');
    } finally {
      await stopServer(server);
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });

  it('menolak body yang bukan JSON valid', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pijar-sync-'));
    const server = createSyncServer({storagePath: path.join(dir, 'sync.json')});
    const base = await startServer(server);
    try {
      const response = await fetch(`${base}/sync`, {
        method: 'POST',
        body: 'bukan json',
      });
      expect(response.status).toBe(400);
    } finally {
      await stopServer(server);
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });

  it('menyediakan health check', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pijar-sync-'));
    const server = createSyncServer({storagePath: path.join(dir, 'sync.json')});
    const base = await startServer(server);
    try {
      const response = await fetch(`${base}/health`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ok: true});
    } finally {
      await stopServer(server);
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });
});
