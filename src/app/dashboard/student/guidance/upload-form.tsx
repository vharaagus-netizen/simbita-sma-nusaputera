'use client'

import { useState } from 'react'
import { uploadGuidanceDraft } from './actions'
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const CHAPTER_OPTIONS = [
  'Bab 1 - Pendahuluan',
  'Bab 2 - Kajian Pustaka',
  'Bab 3 - Metodologi Penelitian',
  'Bab 4 - Hasil dan Pembahasan',
  'Bab 5 - Kesimpulan dan Saran',
  'Naskah Lengkap Final (ACC Sidang)',
]

export default function GuidanceUploadForm({ thesisId }: { thesisId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('thesis_id', thesisId)

    const result = await uploadGuidanceDraft(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess('Berkas naskah berhasil diunggah! Guru pembimbing dapat meninjau naskah ini.')
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
        {/* PILIH BAB */}
        <div>
          <label
            htmlFor="chapter"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Pilih Bagian / Bab Naskah *
          </label>
          <select
            id="chapter"
            name="chapter"
            required
            className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
          >
            {CHAPTER_OPTIONS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        {/* INPUT FILE (PDF / WORD) */}
        <div>
          <label
            htmlFor="file"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Berkas Naskah (PDF atau Word .docx, maks 15 MB) *
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".pdf,.docx,.doc"
            required
            className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-950/60 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer border border-slate-300 dark:border-slate-700 rounded-xl p-1 bg-white dark:bg-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* CATATAN SISWA */}
      <div>
        <label
          htmlFor="student_notes"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
        >
          Catatan / Penjelasan Perbaikan untuk Guru (Opsional)
        </label>
        <textarea
          id="student_notes"
          name="student_notes"
          rows={2}
          placeholder="Contoh: Sudah memperbaiki latar belakang masalah dan menambahkan 3 jurnal rujukan sesuai saran Bapak..."
          className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2 pt-1">
        {loading ? (
          <p className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Sedang mengunggah berkas ke cloud storage... Mohon jangan tutup halaman ini.</span>
          </p>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Pastikan naskah sesuai format (.pdf / .docx)
          </span>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-60 seamless-btn transition-colors shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Kirim Naskah ke Pembimbing</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
