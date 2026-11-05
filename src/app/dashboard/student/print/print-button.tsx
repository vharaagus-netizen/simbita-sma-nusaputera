'use client'

import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function PrintActionButtons() {
  return (
    <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111927] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-none seamless-card transition-colors">
      <Link
        href="/dashboard/student"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Dashboard Siswa</span>
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer seamless-btn"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen / Simpan PDF</span>
        </button>
      </div>
    </div>
  )
}
