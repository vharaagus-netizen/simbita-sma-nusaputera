'use client'

import { useState } from 'react'
import { addGuidanceJournal } from './actions'
import { PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function JournalForm({ thesisId }: { thesisId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Default tanggal hari ini (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('thesis_id', thesisId)

    const result = await addGuidanceJournal(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess('Catatan jurnal bimbingan berhasil disimpan! Guru dapat memvalidasi pertemuan ini.')
      form.reset()
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="meeting_date"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Tanggal Konsultasi Tatap Muka *
          </label>
          <input
            id="meeting_date"
            name="meeting_date"
            type="date"
            defaultValue={today}
            required
            className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:focus:ring-emerald-500/20 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Lokasi Bimbingan di Sekolah *
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            placeholder="Contoh: Ruang Guru, Perpustakaan, Lab IPA"
            className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:focus:ring-emerald-500/20 transition-colors"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="discussion_summary"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
        >
          Materi / Topik Pembahasan Konsultasi *
        </label>
        <textarea
          id="discussion_summary"
          name="discussion_summary"
          rows={3}
          required
          placeholder="Jelaskan secara ringkas poin-poin yang didiskusikan dan arahan langsung dari guru pembimbing saat pertemuan..."
          className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:focus:ring-emerald-500/20 transition-colors"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs disabled:opacity-60 seamless-btn transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{loading ? 'Menyimpan Jurnal...' : 'Simpan Jurnal Pertemuan'}</span>
        </button>
      </div>
    </form>
  )
}
