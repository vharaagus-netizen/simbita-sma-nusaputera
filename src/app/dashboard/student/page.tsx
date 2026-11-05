import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import {
  FileText,
  Calendar,
  Users,
  LogOut,
  PlusCircle,
  Clock,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import type { Thesis, Profile } from '@/types/database'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil profil siswa
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const studentProfile = profile as Profile

  // Cari tugas akhir yang melibatkan siswa ini (baik sebagai ketua maupun anggota)
  const { data: thesisData } = await supabase
    .from('theses')
    .select(`
      *,
      leader:leader_id(*),
      member:member_id(*),
      mentor:mentor_id(*)
    `)
    .or(`leader_id.eq.${user.id},member_id.eq.${user.id}`)
    .maybeSingle()

  const thesis = thesisData as (Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
  }) | null

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-[#090d16] transition-colors duration-200">
      {/* HEADER DASHBOARD */}
      <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nusaputera.png"
              alt="Logo SMA Nusaputera"
              className="w-9 h-9 object-contain shrink-0 drop-shadow-2xs"
            />
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                SIMBITA NUSAPUTERA
              </span>
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                Siswa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="text-right hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {studentProfile?.name || user.email}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {studentProfile?.class_or_dept || 'Siswa SMA'}
              </p>
            </div>

            <form action={logout}>
              <button
                type="submit"
                title="Keluar dari Akun"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl seamless-btn transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ISI DASHBOARD */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6 animate-fade-in">
        {/* KARTU IDENTITAS ACAK SISWA */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-extrabold text-blue-700 dark:text-blue-300 text-lg shadow-2xs">
              {studentProfile?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {studentProfile?.name || 'Siswa'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{studentProfile?.identifier || 'SIS-XXXX'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kelas: {studentProfile?.class_or_dept || '-'} • Bagikan kode unik Anda kepada rekan kelompok.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
            <span>Status Akun: </span>
            <strong className="text-slate-700 dark:text-slate-200 font-semibold">Aktif</strong>
          </div>
        </div>

        {/* STATUS KELOMPOK & TUGAS AKHIR */}
        {!thesis ? (
          /* BELUM PUNYA KELOMPOK / BELUM MENGAJUKAN JUDUL */
          <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 text-center shadow-xs dark:shadow-none space-y-4 seamless-card">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Belum Terdaftar dalam Kelompok Tugas Akhir
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Tugas akhir SMA dikerjakan secara <strong>berkelompok (2 siswa)</strong>. Anda dapat mengajukan judul baru dan mengundang rekan kelompok menggunakan kode uniknya, atau menunggu rekan Anda memasukkan kode unik Anda.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/student/propose"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold seamless-btn shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajukan Judul & Bentuk Kelompok</span>
              </Link>
            </div>
          </div>
        ) : (
          /* SUDAH MEMILIKI KELOMPOK */
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none overflow-hidden seamless-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Judul Tugas Akhir Kelompok
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 break-words break-all [overflow-wrap:anywhere]">
                    {thesis.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words break-all [overflow-wrap:anywhere]">
                    {thesis.description || 'Tidak ada deskripsi tambahan.'}
                  </p>
                </div>

                <div className="shrink-0 self-start sm:self-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                    {thesis.status === 'pending_mentor'
                      ? 'Menunggu Plotting Guru'
                      : thesis.status === 'title_approved'
                      ? 'Judul Disetujui'
                      : thesis.status === 'in_progress'
                      ? 'Sedang Bimbingan'
                      : thesis.status === 'completed'
                      ? 'ACC Final / Siap Sidang'
                      : thesis.status}
                  </span>
                </div>
              </div>

              {/* ANGGOTA KELOMPOK & GURU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 min-w-0 transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Siswa 1 (Ketua):</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 truncate">
                    {thesis.leader?.name || 'Siswa 1'}
                  </p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    {thesis.leader?.identifier}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 min-w-0 transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Siswa 2 (Anggota):</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 truncate">
                    {thesis.member?.name || 'Belum ditambahkan'}
                  </p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    {thesis.member?.identifier || '-'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 min-w-0 transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Guru Pembimbing:</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 truncate">
                    {thesis.mentor?.name || 'Belum di-plot oleh Admin'}
                  </p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                    {thesis.mentor?.identifier || 'Menunggu Koordinator'}
                  </p>
                </div>
              </div>
            </div>

            {/* NAVIGASI MENU BIMBINGAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/student/guidance"
                className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Revisi Berkas Naskah Bab (PDF / Word)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Unggah naskah bab baru dan periksa catatan perbaikan dari guru pembimbing.
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/student/journal"
                className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Jurnal Bimbingan Tatap Muka
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Catat riwayat konsultasi tatap muka di sekolah dan minta paraf digital guru.
                  </p>
                </div>
              </Link>
            </div>

            {/* CETAK KARTU KONTROL BIMBINGAN */}
            <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Cetak Lembar Kontrol & Kartu Bimbingan Digital
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dokumen resmi siap cetak (A4/PDF) berisi riwayat revisi dan paraf konsultasi untuk syarat sidang.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/student/print"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs seamless-btn transition-colors shrink-0 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Buka Lembar Cetak</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
