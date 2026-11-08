import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  GraduationCap,
  LogIn,
  Calendar,
  Clock,
  ShieldCheck,
  BookOpen,
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F0F12] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* NAVBAR */}
      <header className="bg-[#FFF0F6]/90 dark:bg-[#1E1B24]/90 backdrop-blur-md border-b border-pink-200/80 dark:border-[#2E2838] sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nusaputera.png"
              alt="Logo SMA Nusaputera"
              className="w-10 h-10 object-contain shrink-0 drop-shadow-2xs"
            />
            <div>
              <span className="font-bold text-lg text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                SIMBITA SMA NUSAPUTERA
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-1">
                SMA Nusaputera Semarang • Bimbingan Tugas Akhir & KTI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/repository"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-[#E11D48] dark:hover:text-[#FF80AB] transition-colors rounded-xl"
            >
              <BookOpen className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
              <span>Koleksi KTI</span>
            </Link>
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] dark:text-[#0F0F12] rounded-xl seamless-btn shadow-xs transition-colors"
            >
              Masuk Portal
            </Link>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA: PORTAL AKADEMIK */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8 animate-fade-in">
        {/* KARTU SELAMAT DATANG */}
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-none seamless-card">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Portal Bimbingan Tugas Akhir Siswa
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Selamat datang di sistem bimbingan tugas akhir. Silakan masuk dengan akun Anda untuk mengakses lembar bimbingan kelompok, naskah revisi, dan logbook tatap muka.
            </p>
          </div>

          {/* TOMBOL AKSI UTAMA */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] dark:text-[#0F0F12] rounded-xl flex items-center justify-center gap-2 seamless-btn shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun</span>
            </Link>
            <Link
              href="/repository"
              className="px-5 py-2.5 text-sm font-semibold text-[#E11D48] dark:text-[#FF80AB] bg-white dark:bg-[#2D2235] hover:bg-pink-100/50 dark:hover:bg-[#382B42] border border-pink-200/80 dark:border-pink-900/50 rounded-xl flex items-center justify-center gap-2 seamless-btn transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
              <span>Perpustakaan KTI</span>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-pink-200/60 dark:border-[#2E2838] flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Privasi terlindungi: Sistem menggunakan <strong>Kode Identitas Acak (SIS-XXXX / GUR-XXXX)</strong>.
            </span>
          </div>
        </div>

        {/* JADWAL & TENGGAT WAKTU TUGAS AKHIR */}
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none seamless-card">
          <div className="flex items-center gap-2 pb-4 border-b border-pink-200/60 dark:border-[#2E2838] mb-4">
            <Calendar className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
            <h2 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base">
              Jadwal & Batas Waktu Bimbingan Sekolah
            </h2>
          </div>

          <div className="divide-y divide-pink-200/60 dark:divide-[#2E2838]">
            {milestones.length > 0 ? (
              milestones.map((item, index) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-white dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] border border-pink-200 dark:border-pink-900/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
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
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-[#0F0F12]/80 px-2.5 py-1 rounded-lg border border-pink-200/80 dark:border-[#2E2838] shrink-0 self-start sm:self-auto ml-9 sm:ml-0">
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
      <footer className="border-t border-pink-200/80 dark:border-[#2E2838] bg-white dark:bg-[#0F0F12] py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 transition-colors duration-200">
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
