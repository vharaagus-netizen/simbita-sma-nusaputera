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
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-[#090d16] py-10 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-2xl mx-auto w-full animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard Siswa</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-none seamless-card">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-2xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
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
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
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
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
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
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <input
                  id="partner_identifier"
                  name="partner_identifier"
                  type="text"
                  placeholder="Contoh: SIS-4921"
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3.5 py-2 text-sm uppercase text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 font-mono transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                *Dapat dikosongkan terlebih dahulu jika Anda belum memiliki rekan pasangan.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Link
                href="/dashboard/student"
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-60 seamless-btn"
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
