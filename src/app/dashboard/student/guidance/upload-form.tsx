'use client'

import { useState } from 'react'
import { prepareGuidanceUpload, finalizeGuidanceUpload } from './actions'
import { Upload, AlertCircle, CheckCircle2, Loader2, FileCheck } from 'lucide-react'

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
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const chapter = formData.get('chapter') as string
    const studentNotes = formData.get('student_notes') as string
    const file = formData.get('file') as File

    if (!file || file.size === 0) {
      setError('Silakan pilih berkas naskah yang ingin diunggah.')
      return
    }

    setLoading(true)
    setProgress(10)
    setStatusMessage('Menghubungkan ke server Singapura...')

    try {
      // 1. Ambil URL unggah aman (Direct Signed Upload URL)
      const prep = await prepareGuidanceUpload(thesisId, file.name, file.size)

      if (prep.error || !prep.uploadUrl) {
        setError(prep.error || 'Gagal menyiapkan saluran unggah.')
        setLoading(false)
        return
      }

      setProgress(20)
      setStatusMessage('Mengunggah naskah langsung ke penyimpanan cloud...')

      // 2. Unggah langsung dari browser ke Supabase Storage (Direct Upload)
      // Jalur langsung Indonesia -> Singapura berkecepatan tinggi dengan progress akurat
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', prep.uploadUrl!)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Rentang 20% s/d 90% untuk transmisi berkas
            const percent = Math.round(20 + (e.loaded / e.total) * 70)
            setProgress(percent)
            const loadedMb = (e.loaded / (1024 * 1024)).toFixed(1)
            const totalMb = (e.total / (1024 * 1024)).toFixed(1)
            setStatusMessage(`Mengunggah berkas (${loadedMb} MB / ${totalMb} MB)...`)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Gagal mengunggah berkas ke penyimpanan (Kode respon: ${xhr.status})`))
          }
        }

        xhr.onerror = () => {
          reject(new Error('Koneksi internet terputus saat mengunggah naskah. Silakan coba lagi.'))
        }

        xhr.send(file)
      })

      setProgress(95)
      setStatusMessage('Menyimpan riwayat bimbingan...')

      // 3. Catat riwayat bimbingan ke database
      const finalize = await finalizeGuidanceUpload({
        thesisId,
        chapter,
        studentNotes,
        storagePath: prep.storagePath!,
        publicUrl: prep.publicUrl!,
        fileName: prep.fileName!,
        fileExt: prep.fileExt!,
      })

      if (finalize.error) {
        setError(finalize.error)
        setLoading(false)
      } else {
        setProgress(100)
        setSuccess(
          `Naskah "${prep.fileName}" berhasil diunggah! Guru pembimbing dapat langsung meninjau naskah ini.`
        )
        form.reset()
        setLoading(false)
        setProgress(0)
        setStatusMessage('')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err?.message || 'Terjadi kesalahan saat mengunggah naskah.')
      setLoading(false)
      setProgress(0)
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
            disabled={loading}
            className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-[#15131C] focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 transition-colors disabled:opacity-60"
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
            disabled={loading}
            className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-100 dark:file:bg-pink-950/60 file:text-[#E11D48] dark:file:text-[#FF80AB] hover:file:bg-pink-200 dark:hover:file:bg-pink-900/50 cursor-pointer border border-pink-200 dark:border-[#2E2838] rounded-xl p-1 bg-white dark:bg-[#15131C] transition-colors disabled:opacity-60"
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
          disabled={loading}
          placeholder="Contoh: Sudah memperbaiki latar belakang masalah dan menambahkan 3 jurnal rujukan sesuai saran Bapak..."
          className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] bg-white dark:bg-[#15131C] px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 transition-colors disabled:opacity-60"
        />
      </div>

      {/* LIVE PROGRESS BAR */}
      {loading && (
        <div className="p-3 rounded-xl bg-pink-50/80 dark:bg-[#2D2235] border border-pink-200/80 dark:border-pink-900/50 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-pink-950 dark:text-pink-200 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E11D48] dark:text-[#FF80AB]" />
              <span>{statusMessage || 'Sedang memproses naskah...'}</span>
            </span>
            <span className="font-bold text-[#E11D48] dark:text-[#FF80AB] font-mono">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-pink-100 dark:bg-[#15131C] overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#E11D48] via-pink-500 to-[#F472B6] rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2 pt-1">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <FileCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Jalur unggah cepat langsung terhubung ke Singapura (maks 15 MB)</span>
        </span>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] text-xs font-semibold shadow-xs disabled:opacity-60 seamless-btn transition-colors shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mengunggah ({progress}%)...</span>
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
