import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  GraduationCap,
  LogIn,
  Calendar,
  Clock,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  Sparkles,
  Award,
  CheckCircle2,
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
      {/* NAVBAR AKADEMIK ELEGAN */}
      <header className="bg-white/80 dark:bg-[#0F0F12]/80 backdrop-blur-xl border-b border-pink-200/80 dark:border-[#2E2838] sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nusaputera.png"
              alt="Logo SMA Nusaputera"
              className="w-10 h-10 object-contain shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  SIMBITA
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] border border-pink-200/80 dark:border-pink-900/50 uppercase tracking-wider">
                  SMA Nusaputera
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
                Sistem Bimbingan & Karya Tulis Ilmiah Siswa
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/repository"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#E11D48] dark:hover:text-[#FF80AB] border border-pink-200/70 dark:border-[#2E2838] rounded-xl hover:bg-pink-50/50 dark:hover:bg-[#1E1B24] transition-all seamless-btn"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#FF80AB]" />
              <span>Repositori KTI</span>
            </Link>
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] dark:text-[#0F0F12] rounded-xl seamless-btn shadow-sm transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION DENGAN SENTUHAN PROFESIONAL */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 sm:py-14 space-y-12 animate-fade-in">
        {/* HERO CARD */}
        <section className="relative overflow-hidden rounded-3xl bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/90 dark:border-[#2E2838] p-7 sm:p-12 seamless-card">
          {/* Subtle Ambient Background Grid */}
          <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-5">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 dark:bg-[#15131C]/90 border border-pink-200 dark:border-[#2E2838] text-xs font-semibold text-[#E11D48] dark:text-[#FF80AB] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#E11D48] dark:bg-[#FF80AB] animate-pulse" />
              <span>Tahun Ajaran 2025/2026 • Portal Akademik Terpadu</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-[1.15]">
              Bimbingan Karya Ilmiah{" "}
              <span className="bg-linear-to-r from-[#E11D48] via-pink-600 to-[#FF4081] dark:from-[#F472B6] dark:via-[#FF80AB] dark:to-pink-300 bg-clip-text text-transparent">
                Lebih Rapi, Terstruktur & Terverifikasi
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Platform bimbingan resmi SMA Nusaputera Semarang. Unggah naskah bab per bab tanpa kendala kuota, rekam konsultasi tatap muka berparaf digital guru, dan cetak kartu kontrol tugas akhir dalam satu pintu.
            </p>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-3 text-sm font-bold text-white bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] dark:text-[#0F0F12] rounded-xl flex items-center justify-center gap-2 shadow-xs seamless-btn transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun Bimbingan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/repository"
                className="px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white/80 dark:bg-[#15131C] hover:bg-pink-100/60 dark:hover:bg-[#2D2235] border border-pink-200 dark:border-[#2E2838] rounded-xl flex items-center justify-center gap-2 seamless-btn transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
                <span>Eksplorasi Repositori KTI</span>
              </Link>
            </div>

            {/* Trust Badges Strip */}
            <div className="pt-5 border-t border-pink-200/60 dark:border-[#2E2838] flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Identitas Anonim <strong>SIS-XXXX</strong></span>
              </div>
              <span className="hidden sm:inline text-pink-300 dark:text-pink-900">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB] shrink-0" />
                <span>Bimbingan Fleksibel (Tanpa Kuota Kaku)</span>
              </div>
              <span className="hidden sm:inline text-pink-300 dark:text-pink-900">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Paraf Digital & Rubrik Nilai Sidang</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 PILAR FITUR SISTEM: GRID ELEGAN */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* FITUR 1 */}
          <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 space-y-3 seamless-card">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center font-bold shadow-2xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base">
              Unggah Naskah Bab Cepat
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Jalur unggah naskah langsung berkecepatan tinggi dengan indikator progres persentase transparan untuk berkas PDF dan Word hingga 15 MB.
            </p>
          </div>

          {/* FITUR 2 */}
          <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 space-y-3 seamless-card">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center font-bold shadow-2xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base">
              Logbook Konsultasi Tatap Muka
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Catat setiap sesi konsultasi langsung di sekolah lengkap dengan tanggal dan ruang bimbingan, lalu divalidasi dengan paraf digital guru.
            </p>
          </div>

          {/* FITUR 3 */}
          <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 space-y-3 seamless-card">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center font-bold shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base">
              Rekomendasi Sidang & Rubrik Nilai
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Guru pembimbing dapat memberikan persetujuan ACC Final kapan saja jika naskah dinilai telah layak, dilanjutkan penilaian sidang resmi sekolah.
            </p>
          </div>
        </section>

        {/* TIMELINE TAHAPAN TUGAS AKHIR */}
        <section className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-none space-y-5 seamless-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-pink-200/60 dark:border-[#2E2838]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base">
                  Jadwal & Batas Waktu Bimbingan Sekolah
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tahapan penting penyusunan Karya Tulis Ilmiah yang wajib diperhatikan oleh siswa.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 dark:bg-[#15131C] border border-pink-200 dark:border-[#2E2838] text-slate-600 dark:text-slate-300 self-start sm:self-auto">
              Total {milestones.length} Tahapan
            </span>
          </div>

          <div className="divide-y divide-pink-200/60 dark:divide-[#2E2838]">
            {milestones.length > 0 ? (
              milestones.map((item, index) => (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-[#15131C]/40 px-3 -mx-3 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] border border-pink-200 dark:border-pink-900/50 text-xs font-extrabold flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-[#15131C] px-3 py-1.5 rounded-xl border border-pink-200/80 dark:border-[#2E2838] shrink-0 self-start sm:self-auto ml-10 sm:ml-0 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#FF80AB]" />
                    <span>
                      Tenggat:{" "}
                      <strong>
                        {new Date(item.deadline_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
                Belum ada jadwal yang ditetapkan oleh sekolah.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER RESMI INSTITUSI */}
      <footer className="border-t border-pink-200/80 dark:border-[#2E2838] bg-white dark:bg-[#0F0F12] py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5 transition-colors duration-200">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-nusaputera.png"
            alt="Logo"
            className="w-5 h-5 object-contain inline-block"
          />
          <span>SMA NUSAPUTERA SEMARANG</span>
        </div>
        <p>Jl. Ki Mangunsarkoro No.59, Semarang Tengah • Telp: (024) 3542444</p>
        <p>Email: sma_nusaputera@yahoo.id / info@smanusaputera.sch.id</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-pink-100 dark:border-[#2E2838] max-w-md mx-auto">
          © 2026 SIMBITA • Sistem Informasi Bimbingan Tugas Akhir & Karya Tulis Ilmiah
        </p>
      </footer>
    </div>
  );
}
