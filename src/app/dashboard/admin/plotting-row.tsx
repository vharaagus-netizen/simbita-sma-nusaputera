'use client'

import { useState } from 'react'
import { assignMentorToThesis } from './actions'
import { CheckCircle2, UserCheck } from 'lucide-react'
import type { Profile } from '@/types/database'

export default function PlottingRow({
  thesisId,
  currentMentorId,
  mentors,
}: {
  thesisId: string
  currentMentorId?: string | null
  mentors: Profile[]
}) {
  const [mentorId, setMentorId] = useState(currentMentorId || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!mentorId) return

    setLoading(true)
    setSaved(false)

    const formData = new FormData()
    formData.set('thesis_id', thesisId)
    formData.set('mentor_id', mentorId)

    const result = await assignMentorToThesis(formData)
    setLoading(false)

    if (result?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form onSubmit={handleAssign} className="flex flex-wrap items-center gap-2">
      <select
        value={mentorId}
        onChange={(e) => setMentorId(e.target.value)}
        className="block w-full max-w-xs rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
      >
        <option value="">-- Pilih Guru Pembimbing --</option>
        {mentors.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.identifier}) {m.class_or_dept ? `[${m.class_or_dept}]` : ''}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading || !mentorId || mentorId === currentMentorId}
        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-40 shrink-0 seamless-btn"
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>{loading ? 'Menyimpan...' : 'Plot'}</span>
      </button>

      {saved && (
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 shrink-0 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Tersimpan</span>
        </span>
      )}
    </form>
  )
}
