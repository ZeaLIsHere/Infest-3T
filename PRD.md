  # PRD: Pijar 3T

## 1. Overview
- **Nama produk**: Pijar 3T
- **Latar belakang**: Kesenjangan infrastruktur internet di wilayah 3T menyebabkan *learning loss* 1,8 tahun. Solusi EdTech saat ini sangat bergantung pada *cloud* yang butuh *bandwidth* besar.
- **Tujuan bisnis**: Menyediakan akses pendidikan merata dan inklusif di wilayah tanpa internet melalui asisten AI luring.

## 2. Problem Statement
- **Masalah spesifik**: Siswa di wilayah 3T tidak dapat menggunakan aplikasi bimbingan belajar berbasis AI karena keterbatasan sinyal seluler dan mahalnya biaya data.
- **Data pendukung**: Indeks Moran's I 0,68 menunjukkan kluster ketimpangan digital di 3T. *Learning loss* setara 1,8 tahun berkorelasi dengan infrastruktur *broadband* yang minim.

## 3. Target User / Persona
- **Siswa 3T**: Remaja usia 13-18 tahun di wilayah tertinggal, memiliki ponsel Android spesifikasi rendah (RAM 2-3GB).
- **Guru/Kader Pendidikan**: Tenaga pendidik yang memantau progres siswa, memiliki akses internet sporadis (misal saat di balai desa).

## 4. Goals & Success Metrics
- **Goals**: Memungkinkan siswa 3T belajar mandiri secara interaktif tanpa konektivitas.
- **Success Metrics**: 
  - Waktu belajar luring harian per pengguna > 30 menit.
  - Tingkat *crash* aplikasi (*Out of Memory*) < 2%.
  - Persentase sinkronisasi asinkron yang berhasil > 90%.

## 5. Scope
- **In scope**: Inferensi LLM luring, *Offline RAG* (buku teks Kurikulum Merdeka), sinkronisasi data asinkron, distribusi materi *peer-to-peer* (MicroSD/Wi-Fi Direct).
- **Out of scope**: Tutor video langsung, integrasi LLM *cloud*, kolaborasi *real-time*.

## 6. User Stories
- Sebagai siswa 3T, saya ingin bertanya materi ke AI tanpa internet agar bisa belajar kapan saja.
- Sebagai siswa, saya ingin aplikasi berjalan lancar di HP saya yang spesifikasinya rendah tanpa membuat *crash*.
- Sebagai guru, saya ingin progres belajar siswa tersinkronisasi otomatis saat HP mereka mendapat sinyal.

## 7. Functional Requirements
- **Must Have**: 
  - *Chatbot* AI luring (MLC LLM, model INT4).
  - Pangkalan data vektor lokal untuk RAG.
- **Should Have**:
  - Deteksi RAM otomatis untuk membatasi *context window*.
  - Pencatatan *streak* belajar lokal (SQLite).
- **Nice to Have**:
  - *Speech-to-text* luring dengan Whisper Tiny (khusus RAM >= 3GB).

## 8. Non-Functional Requirements
- **Performa**: Waktu respons (Time to First Token) < 3 detik.
- **Keamanan**: Privasi penuh (*on-device data*), nol telemetri luring.
- **Kompatibilitas**: Android 8.0+ (API Level 26), minimum RAM 2GB.

## 9. Design & UX
- Minimalis, *dark mode default* untuk hemat daya.
- Tanpa animasi atau efek transisi berat.
- Indikator status jaringan yang jelas (luring vs sinkronisasi).

## 10. Technical Considerations
- **Dependency**: MLC LLM, TensorFlow Lite, SQLite + sqlite-vec.
- **Constraint**: RAM terbatas menuntut manajemen memori agresif. *Context window* maksimal 512 token.

## 11. Timeline & Milestone
- **Fase 1 (Bulan 1)**: Kuantisasi model dan kompilasi MLC LLM Android.
- **Fase 2 (Bulan 2)**: *Offline RAG* dan pemotongan basis data buku teks.
- **Fase 3 (Bulan 3)**: Pembuatan UI/UX fungsional dan sistem *asynchronous sync*.
- **Fase 4 (Bulan 4)**: *Beta testing* luring di desa percontohan 3T.

## 12. Assumptions & Risks
- **Asumsi**: Pengguna target memiliki Android dengan minimal RAM 2GB.
- **Risiko**: Aplikasi ditutup paksa oleh OS karena *Out of Memory* (OOM).
- **Mitigasi**: Pembatasan ketat parameter model (maksimal 2B) dan pelepasan memori manual saat berpindah *screen*.

## 13. Stakeholders
- Product Manager
- Edge AI Engineer / Mobile Developer
- Pakar Kurikulum Pendidikan
- Sponsor (Pemerintah/NGO)
