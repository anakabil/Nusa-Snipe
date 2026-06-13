# Nusa Snipe — Panduan Deployment Lengkap

Platform **Marketing & Sales Intelligence** untuk PT. Nusa Rendra Jayatama (Nusa Safety).
Stack produksi: **Next.js 14 + Vercel + Upstash Redis + Anthropic API** — sama persis dengan AIRA & HazidApp.

Estimasi waktu deploy dari nol: **20–30 menit**.

---

## 1. Cara kerja (arsitektur singkat)

```
                          ┌──────────────────────────────┐
   Browser (user)         │           VERCEL             │
  ┌───────────────┐       │  ┌────────────────────────┐  │
  │  NusaSnipe.jsx│──────▶│  │  /api/kv   ── Redis ───┼──┼──▶ Upstash Redis (data)
  │  (UI lengkap) │       │  │  /api/ai   ── Claude ──┼──┼──▶ Anthropic API (AI)
  └───────────────┘       │  └────────────────────────┘  │
        │  window.storage │                              │
        │  + fetch proxy  │   API key & token = SERVER    │
        └─ lib/client-runtime.js  (tidak pernah ke browser)
```

**Poin penting:** file aplikasi `components/NusaSnipe.jsx` **tidak diubah sama sekali** dari versi
yang Daddy kembangkan sebagai artifact. Sebuah lapisan adapter (`lib/client-runtime.js`)
menyambungkannya ke backend:

- **`window.storage`** → diarahkan ke `/api/kv` (Upstash Redis). App menyimpan semua data
  (klien, deal, proposal, penagihan, user, dll) di sini.
- **Panggilan AI** → semua `fetch` ke `api.anthropic.com` otomatis dialihkan ke `/api/ai`,
  yang menyuntikkan `ANTHROPIC_API_KEY` di sisi server. **API key tidak pernah bocor ke browser.**

Artinya: Daddy bisa terus iterasi `NusaSnipe.jsx` di Claude, lalu cukup copy file-nya ke folder
`components/` untuk update produksi. Tidak ada kode app yang perlu disesuaikan.

---

## 2. Struktur file

```
nusa-snipe/
├── package.json              # dependencies (Next, React, lucide-react, xlsx)
├── next.config.mjs
├── jsconfig.json             # alias @/ -> root
├── tailwind.config.js        # Tailwind + safelist class dinamis
├── postcss.config.js
├── .gitignore
├── .env.example              # template environment variables
├── README.md                 # file ini
├── app/
│   ├── layout.jsx            # root layout
│   ├── page.jsx              # render app + pasang runtime bridge
│   ├── globals.css           # Tailwind directives
│   └── api/
│       ├── kv/route.js       # proxy Upstash Redis (storage)
│       └── ai/route.js       # proxy Anthropic (AI, key server-side)
├── components/
│   └── NusaSnipe.jsx         # APLIKASI LENGKAP (jangan diedit, tinggal ganti)
└── lib/
    └── client-runtime.js     # jembatan storage + AI proxy
```

---

## 3. Prasyarat

Siapkan akun (semua punya tier gratis yang cukup untuk mulai):

| Kebutuhan | Link | Untuk |
|-----------|------|-------|
| Node.js 18+ | https://nodejs.org | menjalankan & build |
| Akun GitHub | https://github.com | menyimpan kode |
| Akun Vercel | https://vercel.com | hosting (login pakai GitHub) |
| Akun Upstash | https://upstash.com | database Redis |
| Anthropic API key | https://console.anthropic.com | fitur AI |

---

## 4. Langkah A — Jalankan & tes di lokal dulu

```bash
# 1. Masuk ke folder project
cd nusa-snipe

# 2. Install dependencies
npm install

# 3. Buat file environment lokal
cp .env.example .env.local
#    lalu buka .env.local dan isi nilainya (lihat Langkah B, C, D)

# 4. Jalankan
npm run dev
```

Buka **http://localhost:3000**. Login dengan akun demo:

- Admin: `admin@nusasafety.co.id` / `admin123`
- Sales: `ahmad@nusasafety.co.id` / `sales123`

> Sebelum mengisi `.env.local`, app tetap jalan tapi data tidak tersimpan permanen & AI error.
> Lengkapi env di langkah berikut agar berfungsi penuh.

---

## 5. Langkah B — Setup Upstash Redis (database)

1. Login ke https://console.upstash.com
2. **Create Database** → pilih tipe **Redis** → pilih region terdekat (mis. *ap-southeast-1 Singapore*) → **Create**
3. Di halaman database, scroll ke bagian **REST API**
4. Copy dua nilai ini ke `.env.local`:
   - `UPSTASH_REDIS_REST_URL` → tempel ke **`KV_REST_API_URL`**
   - `UPSTASH_REDIS_REST_TOKEN` → tempel ke **`KV_REST_API_TOKEN`**

```env
KV_REST_API_URL=https://xxxx-yyyy.upstash.io
KV_REST_API_TOKEN=AYourLongTokenHere...
```

---

## 6. Langkah C — Anthropic API key (fitur AI)

1. Login ke https://console.anthropic.com
2. **Settings → API Keys → Create Key**
3. Copy key (diawali `sk-ant-...`) ke `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
```

> Pastikan akun Anthropic punya saldo/billing aktif. Model yang dipakai app: `claude-sonnet-4-6`.

---

## 7. Langkah D — Token pelindung endpoint

Endpoint `/api/kv` dilindungi token sederhana. Generate satu string acak, isi ke **dua**
variabel dengan nilai **sama**:

```bash
# Mac/Linux:
openssl rand -hex 24

# atau Windows PowerShell:
#   -join ((48..57)+(97..102) | Get-Random -Count 48 | % {[char]$_})
```

```env
APP_API_TOKEN=hasil-generate-tadi
NEXT_PUBLIC_API_TOKEN=hasil-generate-tadi
```

`.env.local` final harus berisi **6 baris** (ANTHROPIC_API_KEY, KV_REST_API_URL,
KV_REST_API_TOKEN, APP_API_TOKEN, NEXT_PUBLIC_API_TOKEN). Restart `npm run dev`, lalu tes:
buat klien baru, refresh halaman — data harus tetap ada (artinya Redis jalan). Coba AI Copilot —
harus membalas (artinya proxy AI jalan).

---

## 8. Langkah E — Push ke GitHub

```bash
cd nusa-snipe
git init
git add .
git commit -m "Nusa Snipe v1.4.0 — initial deploy"

# buat repo kosong di github.com lebih dulu, lalu:
git remote add origin https://github.com/USERNAME/nusa-snipe.git
git branch -M main
git push -u origin main
```

> `.gitignore` sudah mengecualikan `.env.local` & `node_modules`. **Jangan pernah commit
> file `.env.local`** — itu berisi rahasia.

---

## 9. Langkah F — Deploy ke Vercel

1. Login ke https://vercel.com (pakai GitHub)
2. **Add New… → Project** → pilih repo `nusa-snipe` → **Import**
3. Framework otomatis terdeteksi **Next.js**. Jangan ubah build settings.
4. Buka **Environment Variables**, masukкan **6 variabel** yang sama persis dari `.env.local`:

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` |
   | `KV_REST_API_URL` | `https://...upstash.io` |
   | `KV_REST_API_TOKEN` | `A...` |
   | `APP_API_TOKEN` | string acak |
   | `NEXT_PUBLIC_API_TOKEN` | string acak (sama dgn APP_API_TOKEN) |

5. Klik **Deploy**. Tunggu ±2 menit.
6. Selesai — Vercel kasih URL live, mis. `https://nusa-snipe.vercel.app`

> **Update ke depan:** cukup `git push` lagi, Vercel auto-deploy. Untuk update app, ganti
> isi `components/NusaSnipe.jsx`, commit, push — selesai.

---

## 10. Langkah G — Verifikasi live

Buka URL Vercel, lalu cek checklist:

- [ ] Login `admin@nusasafety.co.id` / `admin123` berhasil
- [ ] Buat klien baru → refresh → data tetap ada *(Redis OK)*
- [ ] AI Copilot membalas pertanyaan *(proxy AI OK)*
- [ ] Buka proposal Adaro → tab Penagihan → **Email tagihan AI** menghasilkan draft
- [ ] Menu **Laporan** → **Export Excel** mengunduh `.xlsx`, **Export PDF** membuka dialog cetak
- [ ] Menu **Perusahaan** tampil & bisa diedit

---

## 11. WAJIB dilakukan setelah live

1. **Ganti data perusahaan** — menu **Perusahaan** → Edit profil: isi NIB, NPWP, no. rekening,
   alamat, telepon asli Nusa Safety (nilai default masih placeholder). Ini otomatis dipakai di
   semua invoice, proposal & laporan.
2. **Ganti semua password default** — menu **Pengguna**: reset password `admin123`/`sales123`,
   atau lewat **Profil Saya**. Update juga email & nama personil asli.
3. **Lengkapi profil personil** — tiap marketing isi foto, nama lengkap, jabatan, HP di
   **Profil Saya**, supaya tertera di email & dokumen.

---

## 12. Catatan keamanan & langkah lanjut (penting)

Versi ini sudah aman untuk **internal/pilot** (API key server-side, data di Redis privat).
Untuk skala produksi penuh dengan banyak user eksternal, lakukan hardening berikut:

- **Autentikasi server-side.** Saat ini password di-hash **SHA-256 di client** & sesi disimpan di
  storage. Untuk produksi, ganti ke **bcrypt + NextAuth.js/Lucia** dengan httpOnly cookies, dan
  pindahkan login ke `/api/auth`. (Login by-email sudah jalan, tinggal pindahkan verifikasi.)
- **RBAC di server.** Filter kepemilikan data (admin vs sales) sekarang di sisi client. Idealnya
  ditegakkan di `/api/kv` per-user. Karena `NEXT_PUBLIC_API_TOKEN` terlihat di browser, ia hanya
  penghalang ringan — bukan keamanan sejati. Untuk data sensitif, gabungkan dengan sesi NextAuth
  dan validasi user di setiap request KV.
- **Foto profil.** Disimpan sebagai data URL terkompres (256×256) di Redis. Untuk volume besar,
  pindahkan ke **Vercel Blob / S3** dan simpan URL-nya saja.
- **Invoice & e-Faktur.** Export PDF saat ini lewat dialog cetak browser. Untuk faktur pajak resmi,
  render server-side (mis. `@react-pdf` atau Puppeteer) di `/api/invoice/[id]/pdf` + integrasi e-Faktur.
- **Reminder & laporan terjadwal.** Tambahkan **Vercel Cron** untuk `/api/billing/reminders`
  (H-7/H-3/H-1/overdue) dan laporan bulanan otomatis ke email manajemen.

---

## 13. Troubleshooting

| Gejala | Penyebab & solusi |
|--------|-------------------|
| Data hilang saat refresh | `KV_REST_API_URL`/`KV_REST_API_TOKEN` salah/kosong. Cek env di Vercel, redeploy. |
| AI error / tidak membalas | `ANTHROPIC_API_KEY` salah atau billing Anthropic habis. Cek **Logs** di Vercel. |
| `/api/kv` 401 unauthorized | `APP_API_TOKEN` ≠ `NEXT_PUBLIC_API_TOKEN`. Samakan keduanya, redeploy. |
| Halaman tidak ada styling | Pastikan `tailwind.config.js`, `postcss.config.js`, `globals.css` ada & ter-commit. |
| Export PDF tidak terbuka | Popup diblokir browser. Izinkan popup untuk domain ini. |
| Build gagal di Vercel | Cek versi Node 18+. Hapus `node_modules` & `.next`, `npm install` ulang lokal untuk reproduce. |
| Setelah ubah env tidak berubah | Env baru butuh **redeploy** (Vercel → Deployments → Redeploy). |

---

## 14. Update aplikasi di masa depan

1. Iterasi `NusaSnipe.jsx` seperti biasa (di Claude / lokal).
2. Copy file final ke `components/NusaSnipe.jsx` (pastikan baris pertama tetap `"use client";`).
3. `git add . && git commit -m "update" && git push`
4. Vercel auto-deploy. Selesai.

---

**Nusa Snipe v1.4.0** · Modul: Dashboard · Prospect Hunter · CRM · Pipeline · Proposal (HPP/margin) ·
Penagihan · Laporan · Outreach · Booking · Inbox · AI Copilot · Profil Perusahaan & Personil.

Dibangun untuk PT. Nusa Rendra Jayatama (Nusa Safety).
