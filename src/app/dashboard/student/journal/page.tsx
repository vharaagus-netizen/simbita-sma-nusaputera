import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  FileCheck,
  GraduationCap,
} from 'lucide-react'
import JournalForm from './journal-form'
import type { Thesis, GuidanceJournal, Profile } from '@/types/database'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

export default async function StudentJournalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cari tugas akhir kelompok siswa ini
  const { data: thesisData } = await supabase
    .from('theses')
    .select(`
      *,
      mentor:mentor_id(name, identifier)
    `)
    .or(`leader_id.eq.${user.id},member_id.eq.${user.id}`)
    .maybeSingle()

  const thesis = thesisData as (Thesis & {
    mentor?: Profile
  }) | null

  if (!thesis) {
    redirect('/dashboard/student')
  }

  // Ambil riwayat logbook konsultasi tatap muka
  const { data: journalsData } = await supabase
    .from('guidance_journals')
    .select('*')
    .eq('thesis_id', thesis.id)
    .order('meeting_date', { ascending: true })

  const journals = (journalsData || []) as GuidanceJournal[]

  // Hitung jumlah bimbingan yang sudah divalidasi/diparaf oleh guru (fleksibel tanpa batas)
  const verifiedCount = journals.filter((j) => j.is_verified).length

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-[#090d16] py-8 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto w-full space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard Utama</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* NOTIFIKASI JIKA GURU SUDAH MEMBERIKAN SIAP SIDANG */}
        {thesis.status === 'completed' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-2xl p-5 shadow-xs flex items-start sm:items-center gap-3.5 text-xs text-emerald-900 dark:text-emerald-200 animate-fade-in seamless-card">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold text-sm text-emerald-950 dark:text-emerald-100 block">
                Selamat! Kelompok Anda Telah Dinyatakan Siap Sidang (ACC Final)
              </strong>
              <p className="text-emerald-800/90 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                Guru Pembimbing telah menyetujui seluruh naskah dan logbook bimbingan Anda. Panitia sekolah dapat segera menjadwalkan tanggal dan dewan penguji Sidang KTI Anda.
              </p>
            </div>
          </div>
        )}

        {/* HEADER & INDIKATOR BIMBINGAN */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden seamless-card">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Logbook Konsultasi Tatap Muka
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 break-words break-all [overflow-wrap:anywhere]">
              {thesis.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Guru Pembimbing:{' '}
              <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                {(thesis.mentor as any)?.name || 'Belum di-plot oleh Admin'}
              </strong>
            </p>
          </div>

          {/* INDIKATOR STATUS DARI PEMBIMBING */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shrink-0 text-center sm:text-right shadow-2xs space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
              Pertemuan Diparaf Guru
            </span>
            <div className="flex items-center justify-center sm:justify-end gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {verifiedCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Sesi Terlaksana
              </span>
            </div>

            {/* STATUS REKOMENDASI SIDANG */}
            <div className="pt-1">
              {thesis.status === 'completed' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Siap Sidang</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Bimbingan Berjalan</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* FORM PENCATATAN PERTEMUAN BARU */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none seamless-card">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Catat Pertemuan Konsultasi Baru
            </h2>
          </div>

          <JournalForm thesisId={thesis.id} />
        </div>

        {/* DAFTAR JURNAL YANG SUDAH TERCATAT */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4 seamless-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Daftar Pertemuan yang Tercatat
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total: {journals.length} Catatan
            </span>
          </div>

          {journals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              Belum ada riwayat bimbingan tatap muka yang dicatat. Catat pertemuan Anda setelah konsultasi dengan guru di sekolah.
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-2.5 bg-slate-50/60 dark:bg-slate-800/40 seamless-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/50">
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {new Date(item.meeting_date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>

                    {/* STATUS PARAF DIGITAL GURU */}
                    <div>
                      {item.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Diparaf Digital oleh Guru</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                          <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <span>Menunggu Paraf Digital Guru</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* MATERI KONSULTASI */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {item.discussion_summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
