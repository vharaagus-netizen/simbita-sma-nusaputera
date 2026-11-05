'use client'

import { useState } from 'react'
import { reviewGuidanceSession } from './actions'
import { CheckCircle2, AlertCircle, Send } from 'lucide-react'

export default function ReviewForm({
  sessionId,
  groupId,
  currentStatus,
  currentFeedback,
}: {
  sessionId: string
  groupId: string
  currentStatus: string
  currentFeedback?: string | null
}) {
  const [status, setStatus] = useState(
    currentStatus === 'pending' ? 'needs_revision' : currentStatus
  )
  const [feedback, setFeedback] = useState(currentFeedback || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setSaved(false)

    const formData = new FormData()
    formData.set('session_id', sessionId)
    formData.set('group_id', groupId)
    formData.set('status', status)
    formData.set('mentor_feedback', feedback)

    const result = await reviewGuidanceSession(formData)

    setLoading(false)
    if (result?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Penilaian & Umpan Balik Guru Pembimbing:
        </label>
        {saved && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tersimpan!</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="radio"
            name={`status_${sessionId}`}
            value="needs_revision"
            checked={status === 'needs_revision'}
            onChange={(e) => setStatus(e.target.value)}
            className="text-rose-600 focus:ring-rose-500"
          />
          <span className="text-rose-700 dark:text-rose-400 font-semibold">🔴 Perlu Perbaikan / Revisi</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input
            type="radio"
            name={`status_${sessionId}`}
            value="accepted"
            checked={status === 'accepted'}
            onChange={(e) => setStatus(e.target.value)}
            className="text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">🟢 Disetujui / ACC Bab Ini</span>
        </label>
      </div>

      <div>
        <textarea
          rows={2}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tuliskan catatan perbaikan atau arahan spesifik untuk kelompok siswa..."
          className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 transition-colors"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-60 seamless-btn"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'Menyimpan...' : 'Simpan Catatan & Status'}</span>
        </button>
      </div>
    </form>
  )
}
