'use client'

import { Download, FileSpreadsheet } from 'lucide-react'
import type { Thesis, Profile } from '@/types/database'

interface ExportThesesProps {
  theses: (Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
    examiner1?: Profile
    examiner2?: Profile
  })[]
}

export default function ExportExcelButton({ theses }: ExportThesesProps) {
  function handleExport() {
    if (!theses || theses.length === 0) {
      alert('Belum ada data tugas akhir untuk diekspor.')
      return
    }

    // Header Kolom
    const headers = [
      'No',
      'Judul Tugas Akhir',
      'Status Bimbingan',
      'Siswa 1 (Ketua)',
      'Kode Siswa 1',
      'Kelas Siswa 1',
      'Siswa 2 (Anggota)',
      'Kode Siswa 2',
      'Kelas Siswa 2',
      'Guru Pembimbing',
      'Kode Pembimbing',
      'Tanggal Sidang',
      'Ruang Sidang',
      'Penguji 1',
      'Penguji 2',
      'Tanggal Pengajuan',
    ]

    // Format status readable
    const formatStatus = (s: string) => {
      switch (s) {
        case 'pending_mentor':
          return 'Menunggu Plotting Pembimbing'
        case 'title_approved':
          return 'Judul Disetujui'
        case 'in_progress':
          return 'Sedang Bimbingan'
        case 'completed':
          return 'ACC Final / Lulus'
        case 'rejected':
          return 'Ditolak'
        default:
          return s
      }
    }

    // Format baris CSV
    const rows = theses.map((t, idx) => {
      const escape = (val: string | null | undefined) => {
        if (!val) return '""'
        const clean = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ')
        return `"${clean}"`
      }

      return [
        idx + 1,
        escape(t.title),
        escape(formatStatus(t.status)),
        escape(t.leader?.name),
        escape(t.leader?.identifier),
        escape(t.leader?.class_or_dept),
        escape(t.member?.name || 'Tidak Ada'),
        escape(t.member?.identifier || '-'),
        escape(t.member?.class_or_dept || '-'),
        escape(t.mentor?.name || 'Belum di-plot'),
        escape(t.mentor?.identifier || '-'),
        escape(
          t.defense_date
            ? new Date(t.defense_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-'
        ),
        escape(t.defense_location || '-'),
        escape(t.examiner1?.name || '-'),
        escape(t.examiner2?.name || '-'),
        escape(
          t.created_at
            ? new Date(t.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '-'
        ),
      ].join(',')
    })

    // UTF-8 BOM agar Excel di Windows membaca karakter bahasa Indonesia tanpa masalah encoding
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    const dateStr = new Date().toISOString().split('T')[0]
    link.setAttribute('href', url)
    link.setAttribute('download', `Rekap_Bimbingan_SIMBITA_SMA_Nusaputera_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors seamless-btn cursor-pointer"
      title="Unduh rekapitulasi data seluruh kelompok siswa ke Excel / CSV"
    >
      <FileSpreadsheet className="w-4 h-4" />
      <span>Ekspor Rekap Excel (CSV)</span>
    </button>
  )
}
