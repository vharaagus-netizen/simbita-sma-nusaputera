import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  GraduationCap,
  LogIn,
  UserPlus,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import type { Milestone } from "@/types/database";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  // Ambil jadwal tahapan dari database Supabase
  let milestones: Milestone[] = [];
  try {
    const { data } = await supabase
      .from("milestones")
      .select("*")
      .order("stage_order", { ascending: true });
    if (data) milestones = data;
  } catch {
    milestones = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-[#090d16] transition-colors duration-200">
      {/* NAVBAR */}
      <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nusaputera.png"
              alt="Logo SMA Nusaputera"
              className="w-10 h-10 object-contain shrink-0 drop-shadow-2xs"
            />
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                SIMBITA SMA NUSAPUTERA
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-1">
                SMA Nusaputera Semarang • Bimbingan Tugas Akhir & KTI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-xl"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl seamless-btn shadow-xs"
            >
              Daftar Siswa
            </Link>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA: PORTAL AKADEMIK */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8 animate-fade-in">
        {/* KARTU SELAMAT DATANG */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-none seamless-card">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              Portal Bimbingan Tugas Akhir Siswa
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Selamat datang di sistem bimbingan tugas akhir. Silakan masuk dengan akun Anda untuk mengakses lembar bimbingan kelompok, naskah revisi, dan logbook tatap muka.
            </p>
          </div>

          {/* DUA TOMBOL AKSI UTAMA */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl flex items-center justify-center gap-2 seamless-btn shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun</span>
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 seamless-btn"
            >
              <UserPlus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Pendaftaran Siswa Baru</span>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Privasi terlindungi: Sistem menggunakan <strong>Kode Identitas Acak (SIS-XXXX / GUR-XXXX)</strong>.
            </span>
          </div>
        </div>

        {/* JADWAL & TENGGAT WAKTU TUGAS AKHIR */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none seamless-card">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Jadwal & Batas Waktu Bimbingan Sekolah
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {milestones.length > 0 ? (
              milestones.map((item, index) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 shrink-0 self-start sm:self-auto ml-9 sm:ml-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>
                      {new Date(item.deadline_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-3">
                Belum ada jadwal yang ditetapkan.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER RESMI SEKOLAH */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 transition-colors duration-200">
        <p className="font-bold text-slate-700 dark:text-slate-200">SMA NUSAPUTERA SEMARANG</p>
        <p>Jl. Ki Mangunsarkoro No.59, Semarang Tengah • Telp: (024) 3542444</p>
        <p>Email: sma_nusaputera@yahoo.id / info@smanusaputera.sch.id</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          © 2026 SIMBITA • Sistem Informasi Bimbingan Tugas Akhir & Karya Tulis Ilmiah Siswa
        </p>
      </footer>
    </div>
  );
}
