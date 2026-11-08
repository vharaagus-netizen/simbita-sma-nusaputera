import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Award,
  Sparkles,
} from 'lucide-react'
import ReviewForm from './review-form'
import VerifyJournalButton from './verify-button'
import DefenseScoringCard from './defense-scoring-card'
import DefenseReadyToggle from './defense-ready-toggle'
import type { Thesis, GuidanceSession, GuidanceJournal, Profile, DefenseScore } from '@/types/database'
import { ThemeToggle } from '@/components/theme-toggle'
import { getFeatureSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function MentorGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil saklar fitur On / Off
  const featureSettings = await getFeatureSettings()

  // Ambil detail kelompok tugas akhir
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
    .eq('id', id)
    .single()

  if (!thesisData) {
    notFound()
  }

  const thesis = thesisData as Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
    examiner1?: Profile
    examiner2?: Profile
  }

  // Ambil riwayat berkas naskah bab
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

  // Ambil jurnal bimbingan tatap muka
  const { data: journalsData } = await supabase
    .from('guidance_journals')
    .select('*')
    .eq('thesis_id', thesis.id)
    .order('meeting_date', { ascending: false })

  const journals = (journalsData || []) as GuidanceJournal[]

  const verifiedJournalsCount = journals.filter((j) => j.is_verified).length

  // Ambil data nilai sidang jika fitur penilaian aktif
  let existingScore: DefenseScore | null = null
  let allDefenseScores: (DefenseScore & { examiner?: Profile })[] = []
  if (featureSettings.defense_scoring) {
    const { data: scoresData } = await supabase
      .from('defense_scores')
      .select('*, examiner:examiner_id(*)')
      .eq('thesis_id', thesis.id)

    if (scoresData) {
      allDefenseScores = scoresData as (DefenseScore & { examiner?: Profile })[]
      existingScore = allDefenseScores.find((s) => s.examiner_id === user.id) || null
    }
  }

  // Tentukan peran pengguna saat ini (Pembimbing / Penguji 1 / Penguji 2)
  let roleLabel = 'Pembimbing'
  if (thesis.examiner1_id === user.id) {
    roleLabel = 'Penguji 1'
  } else if (thesis.examiner2_id === user.id) {
    roleLabel = 'Penguji 2'
  } else if (thesis.mentor_id === user.id) {
    roleLabel = 'Pembimbing'
  } else {
    roleLabel = 'Penguji'
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F0F12] text-[#0F172A] dark:text-[#F8FAFC] py-8 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto w-full space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/mentor"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#E11D48] dark:hover:text-[#FF80AB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Kelompok</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* HEADER KELOMPOK SISWA */}
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4 overflow-hidden seamless-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E11D48] dark:text-[#FF80AB]">
                Lembar Bimbingan Tugas Akhir Kelompok
              </span>
              <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 break-words break-all [overflow-wrap:anywhere]">
                {thesis.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words break-all [overflow-wrap:anywhere]">
                {thesis.description || 'Tidak ada deskripsi tambahan.'}
              </p>
            </div>

            {thesis.status === 'completed' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Siap Sidang (ACC Final)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] border border-pink-200/80 dark:border-pink-900/50 shrink-0 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#FF80AB]" />
                <span>Sedang Bimbingan</span>
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-pink-200/60 dark:border-[#2E2838] flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 dark:text-slate-500">Siswa 1 (Ketua): </span>
              <strong className="text-slate-800 dark:text-slate-100">{thesis.leader?.name}</strong>{' '}
              <span className="text-[#E11D48] dark:text-[#FF80AB] font-semibold font-mono">
                ({thesis.leader?.identifier})
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Siswa 2 (Anggota): </span>
              <strong className="text-slate-800 dark:text-slate-100">{thesis.member?.name || 'Belum ditambahkan'}</strong>{' '}
              {thesis.member && (
                <span className="text-[#E11D48] dark:text-[#FF80AB] font-semibold font-mono">
                  ({thesis.member?.identifier})
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Jurnal Tervalidasi: </span>
              <strong className="text-slate-800 dark:text-slate-100">{verifiedJournalsCount} Pertemuan Diparaf</strong>
            </div>
          </div>
        </div>

        {/* TOMBOL KESIAPAN SIDANG OLEH GURU PEMBIMBING */}
        <DefenseReadyToggle
          groupId={thesis.id}
          currentStatus={thesis.status}
          isMentorOrAdmin={thesis.mentor_id === user.id}
        />

        {/* JADWAL SIDANG KTI (KONDISIONAL: FITUR 1 ON) */}
        {featureSettings.defense_scheduling && (thesis.defense_date || thesis.defense_location) && (
          <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4 seamless-card">
            <div className="flex items-center justify-between pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
                <h2 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                  Jadwal & Penguji Sidang Ujian KTI
                </h2>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] border border-pink-200/80 dark:border-pink-900/50">
                Terjadwal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-[#15131C] border border-pink-200/60 dark:border-[#2E2838]">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  Waktu & Tanggal
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {thesis.defense_date
                    ? new Date(thesis.defense_date).toLocaleString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) + ' WIB'
                    : 'Belum ditentukan'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-[#15131C] border border-pink-200/60 dark:border-[#2E2838]">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  Ruangan / Lokasi
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{thesis.defense_location || 'Ruang Sidang SMA Nusaputera'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-[#15131C] border border-pink-200/60 dark:border-[#2E2838]">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                  Dewan Penguji
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  1. {thesis.examiner1?.name || 'Penguji 1 (Belum ditentukan)'}
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  2. {thesis.examiner2?.name || 'Penguji 2 (Belum ditentukan)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RUBRIK & FORM PENILAIAN SIDANG (KONDISIONAL: FITUR 4 ON) */}
        {featureSettings.defense_scoring && (
          <div className="space-y-4">
            <DefenseScoringCard
              thesisId={thesis.id}
              existingScore={existingScore}
              currentUserId={user.id}
              roleLabel={roleLabel}
            />

            {/* REKAPITULASI NILAI DARI SEMUA PENGUJI / PEMBIMBING */}
            {allDefenseScores.length > 0 && (
              <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4 seamless-card">
                <div className="flex items-center justify-between pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
                    <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                      Rekap Nilai Sidang Masuk ({allDefenseScores.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-pink-100 dark:divide-[#2E2838] text-xs">
                  {allDefenseScores.map((sc) => (
                    <div key={sc.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {sc.examiner?.name || 'Guru Penguji/Pembimbing'}
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2 capitalize font-mono">
                          ({sc.examiner_role})
                        </span>
                        {sc.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                            &quot;{sc.notes}&quot;
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-[#E11D48] dark:text-[#FF80AB] text-sm">
                          {sc.final_score}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">/ 100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BAGIAN 1: REVISI BERKAS NASKAH BAB */}
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none space-y-5 seamless-card">
          <div className="flex items-center justify-between pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
              <h2 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                Naskah Draft Bab yang Perlu Diperiksa ({sessions.length})
              </h2>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              Kelompok siswa ini belum mengunggah naskah bab untuk diperiksa.
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((item) => (
                <div
                  key={item.id}
                  className="border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-5 bg-white/70 dark:bg-[#15131C] space-y-3 seamless-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                        {item.chapter}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          item.file_type === 'pdf'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50'
                            : 'bg-pink-100 dark:bg-pink-950/60 text-[#E11D48] dark:text-[#FF80AB] border border-pink-200/60 dark:border-pink-900/50'
                        }`}
                      >
                        {item.file_type}
                      </span>
                    </div>

                    <div>
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Evaluasi Anda</span>
                        </span>
                      )}
                      {item.status === 'needs_revision' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Perlu Revisi</span>
                        </span>
                      )}
                      {item.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Telah Di-ACC</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.file_name}
                      </span>
                      <span> • Oleh {item.submitter?.name}</span>
                    </div>
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-100 dark:bg-[#2D2235] border border-pink-200/80 dark:border-pink-900/50 text-[#E11D48] dark:text-[#FF80AB] font-semibold hover:bg-pink-200 dark:hover:bg-pink-900/60 seamless-btn transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Berkas ({item.file_type.toUpperCase()})</span>
                    </a>
                  </div>

                  {item.student_notes && (
                    <div className="bg-white/80 dark:bg-[#1E1B24] p-3 rounded-xl border border-pink-200/60 dark:border-[#2E2838] text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-800 dark:text-slate-100">Catatan Siswa: </strong>
                      {item.student_notes}
                    </div>
                  )}

                  {/* FORM REVIEW LANGSUNG OLEH GURU */}
                  <ReviewForm
                    sessionId={item.id}
                    groupId={thesis.id}
                    currentStatus={item.status}
                    currentFeedback={item.mentor_feedback}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BAGIAN 2: JURNAL TATAP MUKA (LOGBOOK KONSULTASI) */}
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4 seamless-card">
          <div className="flex items-center justify-between pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
              <h2 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                Jurnal Konsultasi Tatap Muka ({journals.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {verifiedJournalsCount} Disetujui
            </span>
          </div>

          {journals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              Kelompok ini belum mencatat sesi konsultasi tatap muka.
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((j) => (
                <div
                  key={j.id}
                  className="border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-4 bg-white/70 dark:bg-[#15131C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 seamless-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {new Date(j.meeting_date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      {j.location && (
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{j.location}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {j.discussion_summary}
                    </p>
                  </div>

                  <div className="shrink-0 self-start sm:self-auto">
                    <VerifyJournalButton
                      journalId={j.id}
                      groupId={thesis.id}
                      isVerified={j.is_verified}
                    />
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
