import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Download,
} from 'lucide-react'
import GuidanceUploadForm from './upload-form'
import type { Thesis, GuidanceSession, Profile } from '@/types/database'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

export default async function StudentGuidancePage() {
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

  // Ambil riwayat bimbingan naskah bab
  const { data: sessionsData } = await supabase
    .from('guidance_sessions')
    .select(`
      *,
      submitter:submitted_by(name, identifier)
    `)
    .eq('thesis_id', thesis.id)
    .order('created_at', { ascending: false })

  const sessions = (sessionsData || []) as (GuidanceSession & {
    submitter?: Profile
  })[]

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

        {/* HEADER PROYEK */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none overflow-hidden seamless-card">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Bimbingan Naskah Tugas Akhir
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

        {/* FORM UNGGAH NASKAH REVISI BARU */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none seamless-card">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Unggah Berkas Naskah Bab Baru (PDF / Word)
            </h2>
          </div>

          <GuidanceUploadForm thesisId={thesis.id} />
        </div>

        {/* RIWAYAT REVISI & CATATAN GURU */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4 seamless-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Riwayat Berkas & Catatan Revisi Guru
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total: {sessions.length} Pengajuan
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              Belum ada berkas naskah yang diunggah. Silakan unggah bab tugas akhir Anda menggunakan formulir di atas.
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3 bg-slate-50/60 dark:bg-slate-800/40 seamless-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {item.chapter}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          item.file_type === 'pdf'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50'
                        }`}
                      >
                        {item.file_type}
                      </span>
                    </div>

                    {/* STATUS BADGE */}
                    <div>
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Review Guru</span>
                        </span>
                      )}
                      {item.status === 'needs_revision' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Perlu Revisi</span>
                        </span>
                      )}
                      {item.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Disetujui / ACC Bab</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KETERANGAN FILE & WAKTU */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.file_name}
                      </span>
                      <span>• Diunggah oleh {item.submitter?.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors seamless-btn"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Berkas</span>
                      </a>
                    </div>
                  </div>

                  {/* CATATAN SISWA */}
                  {item.student_notes && (
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                        Catatan dari Siswa:
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">{item.student_notes}</p>
                    </div>
                  )}

                  {/* CATATAN REVISI DARI GURU PEMBIMBING */}
                  {item.mentor_feedback ? (
                    <div className="bg-amber-50/80 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Catatan Arahan / Perbaikan dari Guru Pembimbing:</span>
                      </div>
                      <p className="text-amber-800 dark:text-amber-200/90 whitespace-pre-line pl-5 leading-relaxed">
                        {item.mentor_feedback}
                      </p>
                    </div>
                  ) : (
                    item.status === 'pending' && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        Guru pembimbing belum memberikan catatan untuk berkas ini.
                      </p>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
