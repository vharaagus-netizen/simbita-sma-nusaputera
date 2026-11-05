'use client'

import { useState } from 'react'
import { submitDefenseScore } from '@/app/dashboard/admin/actions'
import { Award, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import type { DefenseScore } from '@/types/database'

interface DefenseScoringCardProps {
  thesisId: string
  existingScore?: DefenseScore | null
  currentUserId: string
  roleLabel: string // 'Pembimbing' | 'Penguji'
}

export default function DefenseScoringCard({
  thesisId,
  existingScore,
  currentUserId,
  roleLabel,
}: DefenseScoringCardProps) {
  const [scorePresentation, setScorePresentation] = useState<number>(
    existingScore?.score_presentation || 80
  )
  const [scoreContent, setScoreContent] = useState<number>(
    existingScore?.score_content || 80
  )
  const [scoreMastery, setScoreMastery] = useState<number>(
    existingScore?.score_mastery || 80
  )
  const [notes, setNotes] = useState<string>(existingScore?.notes || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hitung nilai akhir berbobot
  const calculatedFinal = Math.round(
    scorePresentation * 0.3 + scoreContent * 0.35 + scoreMastery * 0.35
  )

  // Predikat
  const getPredicate = (score: number) => {
    if (score >= 85) return { text: 'A (Sangat Memuaskan)', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' }
    if (score >= 75) return { text: 'B (Memuaskan)', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' }
    if (score >= 60) return { text: 'C (Cukup)', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' }
    return { text: 'D (Kurang / Perlu Remidi)', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' }
  }

  const predicate = getPredicate(calculatedFinal)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)

    const formData = new FormData()
    formData.set('thesis_id', thesisId)
    formData.set('examiner_role', roleLabel.toLowerCase())
    formData.set('score_presentation', scorePresentation.toString())
    formData.set('score_content', scoreContent.toString())
    formData.set('score_mastery', scoreMastery.toString())
    formData.set('notes', notes)

    const result = await submitDefenseScore(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3500)
    }
  }

  return (
    <div className="bg-white dark:bg-[#111927] border border-purple-200/80 dark:border-purple-900/60 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4 seamless-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Rubrik & Form Penilaian Sidang KTI ({roleLabel})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Input nilai ujian berbobot resmi sesuai panduan kurikulum SMA Nusaputera.
            </p>
          </div>
        </div>

        {saved && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Nilai Tersimpan!</span>
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* SKOR 1 */}
          <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              1. Presentasi & Sikap (30%)
            </label>
            <p className="text-[10px] text-slate-400">Intonasi, kerapian, kejelasan slide</p>
            <input
              type="number"
              min="0"
              max="100"
              value={scorePresentation}
              onChange={(e) => setScorePresentation(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-base font-bold text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* SKOR 2 */}
          <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              2. Kualitas Naskah (35%)
            </label>
            <p className="text-[10px] text-slate-400">Sistematika BAB 1-5, daftar pustaka</p>
            <input
              type="number"
              min="0"
              max="100"
              value={scoreContent}
              onChange={(e) => setScoreContent(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-base font-bold text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* SKOR 3 */}
          <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              3. Penguasaan Materi (35%)
            </label>
            <p className="text-[10px] text-slate-400">Argumen & jawaban atas pertanyaan</p>
            <input
              type="number"
              min="0"
              max="100"
              value={scoreMastery}
              onChange={(e) => setScoreMastery(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-base font-bold text-slate-900 dark:text-slate-100 focus:border-purple-600 focus:outline-none"
            />
          </div>
        </div>

        {/* REKAP NILAI OTOMATIS */}
        <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
              Nilai Akhir Berbobot:
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-purple-900 dark:text-purple-100">
                {calculatedFinal}
              </span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Predikat Kelulusan:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border border-current ${predicate.color}`}>
              {predicate.text}
            </span>
          </div>
        </div>

        {/* CATATAN PENGUJI */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Catatan / Masukan Dewan Penguji (Opsional):
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan catatan apresiasi atau revisi kecil pasca-sidang..."
            className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-semibold text-xs shadow-xs disabled:opacity-60 seamless-btn transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Menyimpan Nilai...' : 'Simpan Nilai Sidang'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

