'use client'

import { useState } from 'react'
import { toggleDefenseReady } from './actions'
import { CheckCircle2, GraduationCap, RotateCcw, Loader2, AlertCircle } from 'lucide-react'

interface DefenseReadyToggleProps {
  groupId: string
  currentStatus: string
  isMentorOrAdmin: boolean
}

export default function DefenseReadyToggle({
  groupId,
  currentStatus,
  isMentorOrAdmin,
}: DefenseReadyToggleProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isReady = currentStatus === 'completed'

  async function handleToggle(targetStatus: 'completed' | 'in_progress') {
    if (targetStatus === 'completed') {
      const confirmed = window.confirm(
        'Konfirmasi Kesiapan Sidang:\n\nApakah Anda menyatakan naskah dan bimbingan kelompok ini telah lengkap dan SIAP diajukan ke Sidang KTI?'
      )
      if (!confirmed) return
    } else {
      const confirmed = window.confirm(
        'Batalkan Rekomendasi Sidang:\n\nApakah Anda ingin mengembalikan status kelompok ini ke Bimbingan Aktif (belum siap sidang)?'
      )
      if (!confirmed) return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('group_id', groupId)
    formData.set('status', targetStatus)

    const res = await toggleDefenseReady(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  if (!isMentorOrAdmin) {
    return null
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {isReady ? (
        /* KONDISI 1: SUDAH DINYATAKAN SIAP SIDANG */
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in seamless-card">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                  Kelompok Telah Dinyatakan Siap Sidang (ACC Final)
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-300" />
                  <span>Disetujui</span>
                </span>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
                Kelompok ini telah Anda rekomendasikan untuk maju ke Sidang Ujian KTI. Siswa dapat mencetak kartu bimbingan resmi dan Panitia dapat menjadwalkan sidang.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleToggle('in_progress')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 dark:hover:bg-rose-950/30 dark:hover:border-rose-900 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
            title="Klik jika siswa memerlukan perbaikan/revisi lanjutan sebelum sidang"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
            )}
            <span>Kembalikan ke Bimbingan</span>
          </button>
        </div>
      ) : (
        /* KONDISI 2: BELUM SIAP SIDANG (DALAM PROSES BIMBINGAN) */
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-5 shadow-xs dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 seamless-card">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-[#2D2235] border border-pink-200/80 dark:border-pink-900/60 text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">
                Rekomendasi Kesiapan Sidang KTI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Jumlah sesi bimbingan tidak dibatasi. Jika naskah bab dan konsultasi siswa dinilai sudah layak uji, Anda dapat menyetujui kesiapan sidang kelompok ini kapan saja.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleToggle('completed')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors shrink-0 cursor-pointer seamless-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui Siap Sidang (ACC Final)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

