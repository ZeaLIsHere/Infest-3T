/**
 * Server sinkronisasi Pijar 3T (dev/MVP) — tanpa dependensi eksternal.
 * Menerima batch catatan dari aplikasi (POST /sync) dan menyimpannya ke
 * file JSON. Format body: { "records": [...] } (lihat HttpSyncTransport).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

function respond(res, status, payload) {
  res.writeHead(status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(payload));
}

function readJsonBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;
    req.on('data', chunk => {
      body += chunk;
      if (body.length > maxBytes) {
        tooLarge = true;
        req.destroy();
      }
    });
    req.on('end', () => {
      if (tooLarge) {
        reject(new Error('body too large'));
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function createFileStorage(filePath) {
  return {
    async append(records) {
      fs.mkdirSync(path.dirname(filePath), {recursive: true});
      const existing = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
        : [];
      const next = existing.concat(records);
      fs.writeFileSync(filePath, JSON.stringify(next, null, 2));
      return records.length;
    },
  };
}

function createSyncHandler({storage}) {
  return (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      respond(res, 200, {ok: true});
      return;
    }
    if (req.method === 'POST' && req.url === '/sync') {
      readJsonBody(req, MAX_BODY_BYTES)
        .then(async body => {
          const records = Array.isArray(body.records) ? body.records : [];
          await storage.append(records);
          respond(res, 200, {ok: true, received: records.length});
        })
        .catch(() => respond(res, 400, {ok: false, error: 'invalid body'}));
      return;
    }
    respond(res, 404, {ok: false, error: 'not found'});
  };
}

function createSyncServer({storagePath}) {
  const storage = createFileStorage(storagePath);
  return http.createServer(createSyncHandler({storage}));
}

module.exports = {createFileStorage, createSyncHandler, createSyncServer};
