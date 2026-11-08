'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitThesisProposal } from './actions'
import {
  ArrowLeft,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ProposeThesisPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await submitThesisProposal(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F0F12] text-[#0F172A] dark:text-[#F8FAFC] py-10 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-2xl mx-auto w-full animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#E11D48] dark:hover:text-[#FF80AB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard Siswa</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-none seamless-card">
          <div className="flex items-center gap-3 pb-5 border-b border-pink-200/60 dark:border-[#2E2838]">
            <div className="w-11 h-11 rounded-xl bg-pink-100 dark:bg-[#2D2235] border border-pink-200 dark:border-pink-900/50 text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center font-bold shadow-2xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Pengajuan Judul Tugas Akhir
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daftarkan judul penelitian karya ilmiah dan masukkan rekan kelompok Anda
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="title"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Rancangan Judul Tugas Akhir / Karya Tulis Ilmiah *
              </label>
              <div className="mt-1">
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Contoh: Analisis Efektivitas Penggunaan Bioplastik Berbahan Dasar Pati Singkong..."
                  className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] bg-white dark:bg-[#15131C] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Latar Belakang / Rumusan Masalah Singkat (Opsional)
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Jelaskan secara ringkas fenomena atau masalah yang ingin diteliti..."
                  className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] bg-white dark:bg-[#15131C] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 transition-colors"
                />
              </div>
            </div>

            {/* INPUT KODE REKAN KELOMPOK */}
            <div className="pt-2">
              <label
                htmlFor="partner_identifier"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Kode Unik Rekan Kelompok (Siswa 2)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                Minta rekan Anda untuk memeriksa kode acak uniknya di dashboard siswa (format: <strong>SIS-XXXX</strong>).
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-[#E11D48] dark:text-[#F472B6]" />
                </div>
                <input
                  id="partner_identifier"
                  name="partner_identifier"
                  type="text"
                  placeholder="Contoh: SIS-4921"
                  className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] bg-white dark:bg-[#15131C] pl-9 pr-3.5 py-2 text-sm uppercase text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 font-mono transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                *Dapat dikosongkan terlebih dahulu jika Anda belum memiliki rekan pasangan.
              </p>
            </div>

            <div className="pt-4 border-t border-pink-200/60 dark:border-[#2E2838] flex items-center justify-end gap-3">
              <Link
                href="/dashboard/student"
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] font-semibold text-xs transition-colors shadow-xs disabled:opacity-60 seamless-btn"
              >
                {loading ? 'Mengirim Pengajuan...' : 'Ajukan Judul Sekarang'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
