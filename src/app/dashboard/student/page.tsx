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
  Sparkles,
  MapPin,
  Award,
} from 'lucide-react'
import type { Thesis, Profile, DefenseScore } from '@/types/database'
import { ThemeToggle } from '@/components/theme-toggle'
import WhatsAppButton from '@/components/whatsapp-button'
import { getFeatureSettings } from '@/lib/settings'

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

  // Ambil saklar fitur On / Off
  const featureSettings = await getFeatureSettings()

  // Cari tugas akhir yang melibatkan siswa ini (baik sebagai ketua maupun anggota)
  const { data: thesisData } = await supabase
    .from('theses')
    .select(`
      *,
      leader:leader_id(*),
      member:member_id(*),
      mentor:mentor_id(*),
      examiner1:examiner1_id(*),
      examiner2:examiner2_id(*)
    `)
    .or(`leader_id.eq.${user.id},member_id.eq.${user.id}`)
    .maybeSingle()

  const thesis = thesisData as (Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
    examiner1?: Profile
    examiner2?: Profile
  }) | null

  // Ambil nilai ujian sidang jika fitur penilaian aktif
  let scores: DefenseScore[] = []
  if (featureSettings.defense_scoring && thesis?.id) {
    const { data: scoreData } = await supabase
      .from('defense_scores')
      .select('*, examiner:examiner_id(name, identifier)')
      .eq('thesis_id', thesis.id)
    if (scoreData) scores = scoreData as DefenseScore[]
  }

  // Hitung rata-rata nilai sidang jika ada
  const averageFinalScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((acc, curr) => acc + (curr.final_score || 0), 0) /
            scores.length
        )
      : null

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F0F12] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* HEADER DASHBOARD */}
      <header className="bg-[#FFF0F6]/90 dark:bg-[#1E1B24]/90 backdrop-blur-md border-b border-pink-200/80 dark:border-[#2E2838] sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nusaputera.png"
              alt="Logo SMA Nusaputera"
              className="w-9 h-9 object-contain shrink-0 drop-shadow-2xs"
            />
            <div>
              <span className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                SIMBITA NUSAPUTERA
              </span>
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100/80 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] border border-pink-200/80 dark:border-pink-900/50">
                Siswa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/repository"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-200/80 dark:border-[#2E2838] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#E11D48] dark:hover:text-[#FF80AB] hover:bg-white dark:hover:bg-[#2D2235] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#FF80AB]" />
              <span>Koleksi KTI</span>
            </Link>

            <ThemeToggle />

            <div className="text-right hidden sm:block border-l border-pink-200/60 dark:border-[#2E2838] pl-3">
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
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl seamless-btn transition-colors cursor-pointer"
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
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#2D2235] border border-pink-200 dark:border-pink-900/50 flex items-center justify-center font-extrabold text-[#E11D48] dark:text-[#FF80AB] text-lg shadow-2xs">
              {studentProfile?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
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

          <div className="text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#0F0F12]/80 px-3 py-2 rounded-xl border border-pink-200/80 dark:border-[#2E2838] self-start sm:self-auto">
            <span>Status Akun: </span>
            <strong className="text-slate-700 dark:text-slate-200 font-semibold">Aktif</strong>
          </div>
        </div>

        {/* STATUS KELOMPOK & TUGAS AKHIR */}
        {!thesis ? (
          /* BELUM PUNYA KELOMPOK / BELUM MENGAJUKAN JUDUL */
          <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-8 text-center shadow-xs dark:shadow-none space-y-4 seamless-card">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#2D2235] border border-pink-200 dark:border-pink-900/50 text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center mx-auto shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Belum Terdaftar dalam Kelompok Tugas Akhir
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Tugas akhir SMA dikerjakan secara <strong>berkelompok (2 siswa)</strong>. Anda dapat mengajukan judul baru dan mengundang rekan kelompok menggunakan kode uniknya, atau menunggu rekan Anda memasukkan kode unik Anda.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/student/propose"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] text-sm font-semibold seamless-btn shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajukan Judul & Bentuk Kelompok</span>
              </Link>
            </div>
          </div>
        ) : (
          /* SUDAH MEMILIKI KELOMPOK */
          <div className="space-y-6">
            <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none overflow-hidden seamless-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-pink-200/60 dark:border-[#2E2838]">
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E11D48] dark:text-[#FF80AB]">
                    Judul Tugas Akhir Kelompok
                  </span>
                  <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 break-words break-all [overflow-wrap:anywhere]">
                    {thesis.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words break-all [overflow-wrap:anywhere]">
                    {thesis.description || 'Tidak ada deskripsi tambahan.'}
                  </p>
                </div>

                <div className="shrink-0 flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {/* FITUR 3: TOMBOL WHATSAPP CEPAT */}
                  {thesis.mentor && (
                    <WhatsAppButton
                      mentorName={thesis.mentor.name}
                      mentorPhone={thesis.mentor.phone || thesis.mentor.phone_number}
                      studentName={studentProfile?.name}
                      studentIdentifier={studentProfile?.identifier}
                      thesisTitle={thesis.title}
                    />
                  )}

                  {thesis.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Siap Sidang (ACC Final)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                      {thesis.status === 'pending_mentor'
                        ? 'Menunggu Plotting Guru'
                        : thesis.status === 'title_approved'
                        ? 'Judul Disetujui'
                        : thesis.status === 'in_progress'
                        ? 'Sedang Bimbingan'
                        : thesis.status}
                    </span>
                  )}
                </div>
              </div>

              {/* ANGGOTA KELOMPOK & GURU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div className="p-3.5 bg-white/80 dark:bg-[#0F0F12]/80 rounded-xl border border-pink-200/60 dark:border-[#2E2838] min-w-0 transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Siswa 1 (Ketua):</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 truncate">
                    {thesis.leader?.name || 'Siswa 1'}
                  </p>
                  <p className="text-[11px] text-[#E11D48] dark:text-[#FF80AB] font-semibold mt-0.5 font-mono">
                    {thesis.leader?.identifier}
                  </p>
                </div>

                <div className="p-3.5 bg-white/80 dark:bg-[#0F0F12]/80 rounded-xl border border-pink-200/60 dark:border-[#2E2838] min-w-0 transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Siswa 2 (Anggota):</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 truncate">
                    {thesis.member?.name || 'Belum ditambahkan'}
                  </p>
                  <p className="text-[11px] text-[#E11D48] dark:text-[#FF80AB] font-semibold mt-0.5 font-mono">
                    {thesis.member?.identifier || '-'}
                  </p>
                </div>

                <div className="p-3.5 bg-white/80 dark:bg-[#0F0F12]/80 rounded-xl border border-pink-200/60 dark:border-[#2E2838] min-w-0 transition-colors">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Guru Pembimbing:</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 truncate">
                    {thesis.mentor?.name || 'Belum di-plot oleh Admin'}
                  </p>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 font-mono">
                    {thesis.mentor?.identifier || 'Menunggu Koordinator'}
                  </p>
                </div>
              </div>
            </div>

            {/* FITUR 1 (JIKA SAKLAR ON): KARTU JADWAL SIDANG */}
            {featureSettings.defense_scheduling && thesis.defense_date && (
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-5 shadow-xs space-y-3 seamless-card">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Jadwal Sidang Tugas Akhir Anda
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Diselenggarakan oleh Panitia Sidang SMA Nusaputera Semarang
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-blue-100 dark:border-blue-950">
                    <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Waktu Sidang:</span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {new Date(thesis.defense_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-blue-100 dark:border-blue-950">
                    <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Tempat / Ruangan:</span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {thesis.defense_location || 'Ruang Sidang Sekolah'}
                    </strong>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-blue-100 dark:border-blue-950">
                    <span className="text-slate-400 dark:text-slate-500 block mb-0.5">Dewan Penguji:</span>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold truncate">
                      1. {thesis.examiner1?.name || 'Belum ditugaskan'}
                    </p>
                    {thesis.examiner2 && (
                      <p className="text-slate-900 dark:text-slate-100 font-semibold truncate">
                        2. {thesis.examiner2.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FITUR 4 (JIKA SAKLAR ON): HASIL NILAI SIDANG */}
            {featureSettings.defense_scoring && scores.length > 0 && averageFinalScore !== null && (
              <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-5 shadow-xs space-y-3 seamless-card">
                <div className="flex items-center justify-between pb-2 border-b border-pink-200/60 dark:border-[#2E2838]">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
                    <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                      Hasil Penilaian Sidang Tugas Akhir
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#E11D48] dark:text-[#FF80AB] bg-pink-100 dark:bg-[#2D2235] px-3 py-1 rounded-full border border-pink-200/80 dark:border-pink-900/50">
                    Nilai Akhir: {averageFinalScore} / 100
                  </span>
                </div>

                <div className="divide-y divide-pink-200/60 dark:divide-[#2E2838] text-xs">
                  {scores.map((s, idx) => (
                    <div key={s.id || idx} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.examiner?.name || `Penguji ${idx + 1}`} ({s.examiner_role})
                        </span>
                        {s.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">"{s.notes}"</p>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {s.final_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NAVIGASI MENU BIMBINGAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/student/guidance"
                className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] hover:border-[#E11D48] dark:hover:border-[#FF80AB] rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex items-start gap-4 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#2D2235] border border-pink-200/80 dark:border-pink-900/50 text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm group-hover:text-[#E11D48] dark:group-hover:text-[#FF80AB] transition-colors">
                    Revisi Berkas Naskah Bab (PDF / Word)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Unggah naskah bab baru dan periksa catatan perbaikan dari guru pembimbing.
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/student/journal"
                className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] hover:border-[#E11D48] dark:hover:border-[#FF80AB] rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex items-start gap-4 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#2D2235] border border-pink-200/80 dark:border-pink-900/50 text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm group-hover:text-[#E11D48] dark:group-hover:text-[#FF80AB] transition-colors">
                    Jurnal Bimbingan Tatap Muka
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Catat riwayat konsultasi tatap muka di sekolah dan minta paraf digital guru.
                  </p>
                </div>
              </Link>
            </div>

            {/* CETAK KARTU KONTROL BIMBINGAN */}
            <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#2D2235] border border-pink-200/80 dark:border-pink-900/50 text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center shrink-0 shadow-2xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                    Cetak Lembar Kontrol & Kartu Bimbingan Digital
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Dokumen resmi siap cetak (A4/PDF) berisi seluruh rekapitulasi riwayat revisi dan paraf konsultasi bimbingan.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/student/print"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#0F0F12] font-semibold text-xs seamless-btn transition-colors shrink-0 shadow-xs active:scale-[0.98]"
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
