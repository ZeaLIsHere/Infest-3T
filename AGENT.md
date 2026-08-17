# AGENT.md

## 1. Project Overview
Aplikasi Pijar 3T untuk pendidikan inklusif di wilayah tanpa internet melalui asisten AI luring.
Target user: Siswa 13-18 tahun di wilayah 3T dengan HP Android RAM 2-3GB dan Guru/Kader Pendidikan.

## 2. Tech Stack
- Frontend/Mobile: React Native, TypeScript
- AI & ML: MLC LLM (INT4), TensorFlow Lite
- Database: SQLite, sqlite-vec
- Target: Android 8.0+ (API Level 26)

## 3. Project Structure
- `/src/components`
- `/src/screens`
- `/src/lib`
- `/src/db`
- `/assets`

## 4. Coding Conventions / Style Guide
- TypeScript strict mode
- camelCase, PascalCase
- Functional components, hooks
- ESLint, Prettier

## 5. Commands
```bash
npm run android
npm run build:android
npm run test
npm run lint
```

## 6. Database & Schema
- SQLite dengan sqlite-vec
- `/src/db/schema.ts`

## 7. Environment Variables
```env
SYNC_API_URL=
```

## 8. Testing Guidelines
- Jest
- Wajib test

## 9. Do's and Don'ts / Constraints
- Selalu pakai TypeScript strict mode
- Wajib offline
- Batasi context window 512 token
- Pelepasan memori manual
- Tanpa animasi berat

## 10. Git Workflow
- Conventional Commits
- Branch: feature/, fix/
- PR ke main

## 11. Known Issues / Gotchas
- Out of Memory (OOM) pada RAM < 2GB
- Sinkronisasi asinkron terputus

## 12. Referensi ke PRD
- PRD-Infest.md
