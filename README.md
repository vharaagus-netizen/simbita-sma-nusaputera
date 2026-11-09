# SIMBITA — Sistem Informasi Bimbingan Tugas Akhir & KTI
**SMA Nusaputera Semarang**

SIMBITA adalah aplikasi web untuk mengelola alur bimbingan Karya Tulis Ilmiah (KTI) siswa SMA Nusaputera Semarang. Sistem ini menghubungkan siswa, guru pembimbing, dewan penguji, dan tim koordinator sekolah dalam satu alur kerja terstruktur dari pengajuan judul hingga penilaian sidang.

---

## Peran Pengguna

### 1. Siswa
- **Kelompok KTI:** Mengajukan judul penelitian secara berkelompok (2 siswa per kelompok) menggunakan kode unik siswa.
- **Unggah Draf Naskah:** Mengunggah berkas naskah bab per bab (PDF dan Word hingga 15 MB) dan menerima catatan revisi berkala dari pembimbing.
- **Logbook Konsultasi:** Mencatat riwayat konsultasi tatap muka di sekolah (tanggal, lokasi, dan ringkasan bahasan) untuk divalidasi dengan paraf digital guru.
- **Lembar Kontrol Bimbingan:** Mencetak dokumen resmi rekapitulasi bimbingan berformat A4 sebagai berkas prasyarat pendaftaran sidang.

### 2. Guru Pembimbing & Penguji
- **Review Berkas:** Membaca draf bab, memberikan catatan koreksi, dan menentukan status naskah (*Pending*, *Perlu Revisi*, *ACC Bab*).
- **Paraf Digital:** Memvalidasi pertemuan tatap muka siswa dengan satu klik.
- **Rekomendasi Sidang:** Menetapkan status *Siap Sidang (ACC Final)* ketika seluruh bab dan konsultasi telah memenuhi standar.
- **Rubrik Penilaian Sidang:** Mengisi nilai ujian sidang KTI siswa berdasarkan indikator penilaian resmi sekolah.

### 3. Administrator & Koordinator KTI
- **Alokasi Pembimbing & Penguji:** Memplot guru pembimbing dan dewan penguji ke masing-masing kelompok siswa.
- **Penjadwalan Sidang:** Mengatur tanggal, jam, ruangan, dan penguji sidang untuk kelompok yang telah berstatus *Siap Sidang*.
- **Saklar Fitur (Feature Toggles):** Mengaktifkan atau menonaktifkan modul penjadwalan dan penilaian sidang secara fleksibel.
- **Ekspor Data:** Mengunduh rekapitulasi progres seluruh kelompok ke format spreadsheet (CSV/Excel).
- **Manajemen Akun:** Mengelola akun pengguna (Siswa, Guru, Admin) beserta reset kata sandi.

---

## Teknologi yang Digunakan

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikonografi:** [Lucide React](https://lucide.dev/)
- **Basis Data & Autentikasi:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, Row Level Security, Supabase Storage)
- **Hosting:** [Vercel](https://vercel.com/)

---

## Struktur Direktori

```text
simbita-app/
├── public/                     # Aset statis (logo sekolah, favicon, manifest)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/               # Aksi autentikasi (login, logout)
│   │   ├── dashboard/
│   │   │   ├── admin/          # Panel kontrol koordinator KTI
│   │   │   ├── mentor/         # Panel guru pembimbing & lembar kelompok
│   │   │   └── student/        # Panel siswa, bimbingan, jurnal, dan cetak A4
│   │   ├── login/              # Halaman masuk portal
│   │   ├── repository/         # Repositori publik KTI siswa lulus
│   │   ├── globals.css         # Konfigurasi gaya global & palet warna
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Beranda utama institusi
│   ├── components/             # Komponen UI bersama (ThemeToggle, WhatsApp, dll.)
│   ├── lib/
│   │   └── supabase/           # Inisialisasi klien Supabase (client, server, middleware)
│   └── types/                  # Definisi antarmuka TypeScript dan basis data
├── supabase/
│   └── schema.sql              # Skema tabel PostgreSQL, RLS, dan fungsi pemicu
├── README.md                   # Dokumentasi teknis proyek
└── package.json
```

---

## Tabel Basis Data Utama

| Tabel | Deskripsi |
| :--- | :--- |
| `profiles` | Data identitas pengguna (nama, peran, NIS/NIP, kelas/rumpun). |
| `theses` | Data kelompok, judul KTI, pembimbing, penguji, tanggal sidang, dan status. |
| `guidance_sessions` | Riwayat draf naskah bab yang diunggah siswa beserta catatan koreksi guru. |
| `guidance_journals` | Logbook konsultasi tatap muka siswa di sekolah beserta status paraf guru. |
| `defense_scores` | Lembar penilaian sidang KTI dari dewan penguji dan pembimbing. |
| `milestones` | Tenggat waktu dan jadwal tahapan KTI yang ditetapkan sekolah. |
| `system_settings` | Konfigurasi saklar fitur sistem (penjadwalan sidang, penilaian sidang). |

---

## Menjalankan Proyek Secara Lokal

### 1. Prasyarat
- Node.js versi 20 atau yang lebih baru.
- Proyek Supabase aktif dengan skema dari `supabase/schema.sql` yang telah dijalankan.

### 2. Kloning dan Instalasi
```bash
git clone https://github.com/vharaagus-netizen/simbita-sma-nusaputera.git
cd simbita-sma-nusaputera
npm install
```

### 3. Konfigurasi Lingkungan (`.env.local`)
Buat berkas `.env.local` pada direktori utama proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka `http://localhost:3000` pada peramban Anda.

---

## Build Produksi

Untuk memverifikasi kompilasi produksi:
```bash
npm run build
```

---

## Hak Cipta & Lisensi

© 2026 **SMA Nusaputera Semarang**. Seluruh hak cipta dilindungi undang-undang.
Jl. Ki Mangunsarkoro No.59, Semarang Tengah • Telp: (024) 3542444
