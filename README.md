# Pijar 3T

Aplikasi pendidikan inklusif untuk wilayah 3T (tertinggal, terdepan, terluar) melalui
**asisten AI luring** — belajar interaktif tanpa internet, berjalan di Android
spesifikasi rendah (RAM 2–3GB, Android 8.0+/API 26).

Dokumen acuan: [`PRD.md`](PRD.md) (requirement) dan [`AGENT.md`](AGENT.md) (aturan teknis).

## Fitur MVP (in scope)

- Chatbot AI luring (MLC LLM, model INT4 ≤ 2B param, context window ≤ 512 token).
- Offline RAG dari buku teks Kurikulum Merdeka (SQLite + sqlite-vec).
- Deteksi RAM otomatis untuk membatasi context window.
- Pencatatan streak belajar lokal (SQLite).
- Sinkronisasi data asinkron saat perangkat online.
- Distribusi materi peer-to-peer (MicroSD/Wi-Fi Direct) — integrasi fase 2.

## Struktur proyek

```
src/
  components/   Komponen UI (ChatBubble, NetworkStatusIndicator, …)
  screens/      Layar (Beranda, Tanya AI, Materi, Progres)
  lib/          Logika inti: contextWindow, memory, streak, sync, llm, network, theme
  db/           Skema SQLite + sqlite-vec dan akses database
assets/         (dipakai fase 2 — model & materi)
```

## Perintah

```bash
npm install        # pasang dependensi
npm run start      # Metro bundler
npm run android    # jalankan di emulator/device Android
npm run build:android
npm run test       # Jest (wajib, lihat AGENT.md §8)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit (strict)
npm run format     # Prettier
```

## Environment

Salin `.env.example` menjadi `.env` bila perlu:

```env
SYNC_API_URL=
```

## Status saat ini

Fondasi JS/TS sudah terpasang: tooling (TS strict, ESLint, Prettier, Jest), skema
database, logika inti (context window 512 token, klasifikasi RAM, streak,
antrean sinkronisasi), dan UI MVP dark-mode. Semua modul native (MLC LLM,
sqlite-vec, `android/`) sengaja dipisah di belakang kontrak (`LlmEngine`,
`SyncTransport`) supaya bisa diuji tanpa build Android.

## Langkah berikutnya

1. Scaffold native: jalankan `npx @react-native-community/cli init` untuk
   menghasilkan folder `android/` (API 26), lalu pasang dependensi native.
2. Integrasi MLC LLM (fase 1): implementasi `LlmEngine` lewat modul native.
3. Integrasi sqlite-vec (fase 2): muat `libvec` dan pipeline chunking buku teks.
4. Implementasi transport sinkronisasi nyata terhadap `SYNC_API_URL`.
