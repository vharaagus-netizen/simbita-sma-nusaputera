'use client'

import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function PrintActionButtons() {
  return (
    <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-3 bg-[#FFF0F6] dark:bg-[#1E1B24] p-4 rounded-2xl border border-pink-200/80 dark:border-[#2E2838] shadow-xs dark:shadow-none seamless-card transition-colors">
      <Link
        href="/dashboard/student"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#E11D48] dark:hover:text-[#FF80AB] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Dashboard Siswa</span>
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] font-semibold text-xs shadow-xs transition-colors cursor-pointer seamless-btn"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen / Simpan PDF</span>
        </button>
      </div>
    </div>
  )
}
