'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, UserCheck, Edit3 } from 'lucide-react'
import type { Thesis, Profile } from '@/types/database'
import ScheduleModal from './schedule-modal'

interface DefenseScheduleSectionProps {
  theses: (Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
    examiner1?: Profile
    examiner2?: Profile
  })[]
  mentors: Profile[]
}

export default function DefenseScheduleSection({
  theses,
  mentors,
}: DefenseScheduleSectionProps) {
  const [selectedThesis, setSelectedThesis] = useState<(Thesis & { leader?: Profile; member?: Profile }) | null>(null)

  return (
    <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs dark:shadow-none overflow-hidden seamless-card space-y-3">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Penjadwalan Sidang Tugas Akhir
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tetapkan tanggal, ruangan, dan penugasan Guru Penguji 1 & 2 untuk kelompok siswa.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200/60 dark:border-blue-800/50 self-start sm:self-auto">
          Fitur Sidang: Aktif
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {theses.map((t) => (
          <div key={t.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="space-y-1.5 flex-1 min-w-0 max-w-xl">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm break-words">
                {t.title}
              </span>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  <span>Siswa: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{t.leader?.name}</strong>
                  {t.member && <span> & {t.member.name}</span>}
                </div>
                <span>•</span>
                <div>
                  <span>Pembimbing: </span>
                  <strong className="text-slate-800 dark:text-slate-200">{t.mentor?.name || 'Belum ada'}</strong>
                </div>
              </div>

              {/* STATUS JADWAL */}
              {t.defense_date ? (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-blue-700 dark:text-blue-300">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(t.defense_date).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>
                  {t.defense_location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.defense_location}</span>
                    </span>
                  )}
                  {(t.examiner1 || t.examiner2) && (
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <span>Penguji: {t.examiner1?.name || '-'}{t.examiner2 ? ` & ${t.examiner2.name}` : ''}</span>
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 italic pt-0.5">
                  Belum dijadwalkan sidang.
                </p>
              )}
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setSelectedThesis(t)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors seamless-btn"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.defense_date ? 'Ubah Jadwal Sidang' : 'Atur Jadwal Sidang'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedThesis && (
        <ScheduleModal
          thesis={selectedThesis}
          mentors={mentors}
          onClose={() => setSelectedThesis(null)}
        />
      )}
    </div>
  )
}
