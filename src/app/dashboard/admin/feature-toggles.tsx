'use client'

import { useState } from 'react'
import { toggleAdminFeature } from './actions'
import { Calendar, Award, Check, Settings2, Sliders } from 'lucide-react'

interface FeatureTogglesProps {
  initialScheduling: boolean
  initialScoring: boolean
}

export default function FeatureToggles({
  initialScheduling,
  initialScoring,
}: FeatureTogglesProps) {
  const [scheduling, setScheduling] = useState(initialScheduling)
  const [scoring, setScoring] = useState(initialScoring)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleToggle(key: 'feature_defense_scheduling' | 'feature_defense_scoring') {
    setLoadingKey(key)
    setFeedback(null)

    const nextValue = key === 'feature_defense_scheduling' ? !scheduling : !scoring

    if (key === 'feature_defense_scheduling') setScheduling(nextValue)
    if (key === 'feature_defense_scoring') setScoring(nextValue)

    const result = await toggleAdminFeature(key, nextValue)
    setLoadingKey(null)

    if (result?.error) {
      // Revert if error
      if (key === 'feature_defense_scheduling') setScheduling(!nextValue)
      if (key === 'feature_defense_scoring') setScoring(!nextValue)
      alert(result.error)
    } else {
      setFeedback('Pengaturan berhasil diperbarui!')
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  return (
    <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-5 shadow-xs dark:shadow-none space-y-4 seamless-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
              Saklar Pengaktifan Fitur Tambahan (On / Off)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Hidupkan atau matikan modul sidang & penilaian sesuai kebutuhan tahun ajaran sekolah.
            </p>
          </div>
        </div>

        {feedback && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{feedback}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FITUR 1: SAKLAR PENJADWALAN SIDANG */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-pink-200/60 dark:border-[#2E2838] bg-white/80 dark:bg-[#15131C] transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-xs">
                Fitur 1: Penjadwalan Sidang KTI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Mengaktifkan penetapan tanggal, ruangan sidang, dan alokasi Penguji 1 & 2 di dashboard guru dan siswa.
            </p>
            <div className="pt-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  scheduling
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {scheduling ? 'Status: AKTIF (ON)' : 'Status: NONAKTIF (OFF)'}
              </span>
            </div>
          </div>

          {/* SAKLAR SWITCH */}
          <button
            type="button"
            onClick={() => handleToggle('feature_defense_scheduling')}
            disabled={loadingKey === 'feature_defense_scheduling'}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 ${
              scheduling ? 'bg-[#E11D48] dark:bg-[#F472B6]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                scheduling ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* FITUR 4: SAKLAR RUBRIK & FORM PENILAIAN */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-pink-200/60 dark:border-[#2E2838] bg-white/80 dark:bg-[#15131C] transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-xs">
                Fitur 4: Rubrik Penilaian Sidang
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Mengaktifkan formulir input nilai ujian berbobot (Presentasi, Konten, Penguasaan) bagi Pembimbing & Penguji.
            </p>
            <div className="pt-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  scoring
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {scoring ? 'Status: AKTIF (ON)' : 'Status: NONAKTIF (OFF)'}
              </span>
            </div>
          </div>

          {/* SAKLAR SWITCH */}
          <button
            type="button"
            onClick={() => handleToggle('feature_defense_scoring')}
            disabled={loadingKey === 'feature_defense_scoring'}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 ${
              scoring ? 'bg-[#E11D48] dark:bg-[#F472B6]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                scoring ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

