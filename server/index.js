/**
 * Entry point server sinkronisasi Pijar 3T.
 * Jalankan: node server/index.js  (PORT default 3000)
 * Arahkan SYNC_API_URL di aplikasi ke http://<IP-server>:3000/sync
 */
const path = require('path');
const {createSyncServer} = require('./syncServer');

const PORT = Number(process.env.PORT || 3000);
const storagePath = path.join(__dirname, 'data', 'sync.json');
const server = createSyncServer({storagePath});

server.listen(PORT, () => {
  console.log(`Server sinkronisasi Pijar 3T: http://0.0.0.0:${PORT}`);
  console.log(`Penyimpanan: ${storagePath}`);
});
