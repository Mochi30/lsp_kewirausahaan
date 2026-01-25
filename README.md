# LSP Kewirausahaan - Frontend + Backend (HTML/CSS/JS + Express)

Ini versi tanpa React/Vite: `index.html`, `style.css`, dan `script.js` + backend Express.

## Cara menjalankan (frontend)
Cukup buka `index.html` di browser. Data FAQ/skema dan form pendaftaran akan mencoba
ambil/simpan ke `/api` jika backend aktif, dan fallback ke data lokal jika tidak.

## Backend (Express + Prisma)
### Prasyarat
- Node.js 18+
- Database Postgres (mis. Supabase, Neon, Railway, Vercel Postgres)

### Setup lokal
1) Copy `.env.example` menjadi `.env` dan isi `DATABASE_URL` + `JWT_SECRET`.
2) Install dependency:
   - `npm install`
3) Generate Prisma client:
   - `npm run prisma:generate`
4) Jalankan migrasi:
   - `npm run prisma:migrate -- --name init`
5) Buat admin pertama (pilih salah satu):
   - Jalankan script lokal:
     - `ADMIN_EMAIL=admin@domain.com ADMIN_PASSWORD=secret node scripts/create-admin.js`
   - Atau gunakan endpoint bootstrap (lihat bagian API).
6) Jalankan server:
   - `npm run dev`

### Deploy ke Vercel
1) Pastikan repo berisi `api/` dan `vercel.json`.
2) Set env vars di Vercel:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `BOOTSTRAP_TOKEN` (sementara, untuk buat admin pertama)
3) Deploy seperti biasa.

## API ringkas
- `GET /api/health`
- `GET /api/faqs`
- `POST /api/faqs` (admin)
- `GET /api/schemes`
- `POST /api/schemes` (admin)
- `POST /api/registrations` (publik)
- `GET /api/registrations` (admin)
- `POST /api/auth/login`
- `GET /api/auth/me` (admin)
- `POST /api/auth/bootstrap` (gunakan header `x-bootstrap-token`)

## Catatan
- Nomor WA/email masih placeholder. Ganti di:
  - `index.html` (bagian CTA & footer)
  - `script.js` (variabel `admin`)

## Asset
- `assets/logo.svg`
- `assets/favicon.svg`
