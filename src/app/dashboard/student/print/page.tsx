import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PrintActionButtons from './print-button'
import { GraduationCap, CheckCircle2 } from 'lucide-react'
import type { Thesis, Profile, GuidanceSession, GuidanceJournal } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function PrintGuidanceCardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil data tugas akhir siswa
  const { data: thesisData } = await supabase
    .from('theses')
    .select(`
      *,
      leader:leader_id(name, identifier, class_or_dept),
      member:member_id(name, identifier, class_or_dept),
      mentor:mentor_id(name, identifier, class_or_dept)
    `)
    .or(`leader_id.eq.${user.id},member_id.eq.${user.id}`)
    .maybeSingle()

  if (!thesisData) {
    redirect('/dashboard/student')
  }

  const thesis = thesisData as Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
  }

  // Ambil sesi bimbingan dokumen bab
  const { data: sessionsData } = await supabase
    .from('guidance_sessions')
    .select('*')
    .eq('thesis_id', thesis.id)
    .order('created_at', { ascending: true })

  const sessions = (sessionsData || []) as GuidanceSession[]

  // Ambil jurnal bimbingan tatap muka
  const { data: journalsData } = await supabase
    .from('guidance_journals')
    .select('*')
    .eq('thesis_id', thesis.id)
    .order('meeting_date', { ascending: true })

  const journals = (journalsData || []) as GuidanceJournal[]

  const verifiedJournals = journals.filter((j) => j.is_verified)
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F12] print:bg-white py-6 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* TOMBOL AKSI KEMBALI & PRINT */}
        <PrintActionButtons />

        {/* LEMBAR CETAK RESMI (FORMAT A4) */}
        <div className="bg-white border border-slate-300 print:border-none p-8 sm:p-12 shadow-sm print:shadow-none text-slate-900 font-serif">
          {/* KOP RESMI SEKOLAH */}
          <div className="flex items-center gap-5 pb-4 border-b-2 border-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nusaputera.png"
              alt="Logo SMA Nusaputera Semarang"
              className="w-20 h-auto object-contain shrink-0"
            />
            <div className="flex-1 text-center space-y-0.5">
              <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-600">
                YAYASAN PERGURUAN NUSAPUTERA
              </h3>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight uppercase text-slate-900">
                SMA NUSAPUTERA SEMARANG
              </h1>
              <p className="text-xs text-slate-600 font-sans">
                Jl. Ki Mangunsarkoro No.59, Semarang Tengah • Telp: (024) 3542444
              </p>
              <p className="text-[11px] text-slate-500 font-sans">
                Email: sma_nusaputera@yahoo.id / info@smanusaputera.sch.id
              </p>
              <div className="pt-1">
                <span className="text-[11px] font-bold font-sans uppercase tracking-wider px-3 py-0.5 bg-slate-100 border border-slate-300 rounded inline-block">
                  TIM PENYELENGGARA KARYA TULIS ILMIAH & TUGAS AKHIR SISWA
                </span>
              </div>
            </div>
          </div>

          <div className="text-center my-6">
            <h3 className="text-base font-bold uppercase tracking-wider underline">
              KARTU KONTROL & LEMBAR BUKTI BIMBINGAN TUGAS AKHIR
            </h3>
            <p className="text-xs font-sans text-slate-500 mt-1">
              Nomor Registrasi Kelompok: <span className="font-mono font-semibold">{thesis.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          {/* TABEL IDENTITAS SISWA & PEMBIMBING */}
          <table className="w-full text-xs font-sans border-collapse mb-6">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-bold w-44 text-slate-700 align-top">Judul Karya Ilmiah/TA</td>
                <td className="py-1.5 font-bold text-slate-900 break-words break-all [overflow-wrap:anywhere]">: {thesis.title}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold text-slate-700">Siswa 1 (Ketua)</td>
                <td className="py-1.5">
                  : {thesis.leader?.name} (Kode: <span className="font-mono font-semibold">{thesis.leader?.identifier}</span>) • Kelas: {thesis.leader?.class_or_dept || '-'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold text-slate-700">Siswa 2 (Anggota)</td>
                <td className="py-1.5">
                  : {thesis.member ? `${thesis.member.name} (Kode: ${thesis.member.identifier}) • Kelas: ${thesis.member.class_or_dept || '-'}` : 'Tidak Ada / Pengerjaan Mandiri'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold text-slate-700">Guru Pembimbing</td>
                <td className="py-1.5">
                  : {thesis.mentor ? `${thesis.mentor.name} (Kode: ${thesis.mentor.identifier})` : 'Belum Ditugaskan'}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold text-slate-700">Status Tugas Akhir</td>
                <td className="py-1.5 font-bold text-blue-700">
                  : {thesis.status === 'completed' ? 'ACC FINAL / SIAP SIDANG' : 'DALAM PROSES BIMBINGAN'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* BAGIAN 1: TABEL JURNAL KONSULTASI TATAP MUKA */}
          <div className="mb-6">
            <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-800 mb-2">
              I. Rekapitulasi Pertemuan Konsultasi Tatap Muka ({journals.length} Pertemuan)
            </h4>
            <table className="w-full text-[11px] font-sans border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-left">
                  <th className="p-2 border-r border-slate-400 w-10 text-center">No</th>
                  <th className="p-2 border-r border-slate-400 w-28">Tanggal</th>
                  <th className="p-2 border-r border-slate-400 w-28">Tempat</th>
                  <th className="p-2 border-r border-slate-400">Materi & Arahan Konsultasi</th>
                  <th className="p-2 text-center w-28">Paraf Pembimbing</th>
                </tr>
              </thead>
              <tbody>
                {journals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                      Belum ada catatan pertemuan tatap muka.
                    </td>
                  </tr>
                ) : (
                  journals.map((j, idx) => (
                    <tr key={j.id} className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300">
                        {new Date(j.meeting_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-2 border-r border-slate-300">{j.location}</td>
                      <td className="p-2 border-r border-slate-300">{j.discussion_summary}</td>
                      <td className="p-2 text-center font-semibold text-[10px]">
                        {j.is_verified ? (
                          <span className="text-emerald-700">✓ Tervalidasi</span>
                        ) : (
                          <span className="text-amber-700">Belum Paraf</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* BAGIAN 2: RIWAYAT BERKAS & ACC BAB */}
          <div className="mb-8">
            <h4 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-800 mb-2">
              II. Riwayat Naskah Bab & Status Persetujuan (ACC)
            </h4>
            <table className="w-full text-[11px] font-sans border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-left">
                  <th className="p-2 border-r border-slate-400 w-10 text-center">No</th>
                  <th className="p-2 border-r border-slate-400 w-36">Bagian / Bab</th>
                  <th className="p-2 border-r border-slate-400 w-28">Tanggal Unggah</th>
                  <th className="p-2 border-r border-slate-400">Catatan Perbaikan Pembimbing</th>
                  <th className="p-2 text-center w-28">Status Evaluasi</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                      Belum ada draf naskah yang diajukan.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s, idx) => (
                    <tr key={s.id} className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-semibold">{s.chapter}</td>
                      <td className="p-2 border-r border-slate-300">
                        {new Date(s.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-700">
                        {s.mentor_feedback || s.student_notes || '-'}
                      </td>
                      <td className="p-2 text-center font-bold text-[10px]">
                        {s.status === 'accepted' ? (
                          <span className="text-emerald-700">🟢 ACC Bab</span>
                        ) : s.status === 'needs_revision' ? (
                          <span className="text-rose-700">🔴 Revisi</span>
                        ) : (
                          <span className="text-amber-700">🟡 Review</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* KOTAK TANDA TANGAN PENGESAHAN */}
          <div className="pt-4 font-sans text-xs">
            <div className="flex justify-between items-start text-center">
              <div>
                <p className="text-slate-500">Mengetahui,</p>
                <p className="font-bold text-slate-800">Koordinator KTI SMA Nusaputera</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Cap]</span>
                </div>
                <p className="font-bold underline text-slate-900">TIM KTI SMA NUSAPUTERA</p>
                <p className="text-[10px] text-slate-500">NIP/Kode: ADM-0001</p>
              </div>

              <div>
                <p className="text-slate-500">Ditetapkan pada, {todayFormatted}</p>
                <p className="font-bold text-slate-800">Guru Pembimbing</p>
                <div className="h-20 flex items-center justify-center">
                  {thesis.mentor ? (
                    <span className="text-xs font-bold text-blue-700 font-mono border border-blue-300 px-3 py-1 rounded bg-blue-50/50">
                      Tervalidasi Digital
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300 italic">[Tanda Tangan]</span>
                  )}
                </div>
                <p className="font-bold underline text-slate-900">
                  {thesis.mentor?.name || '(.........................................)'}
                </p>
                <p className="text-[10px] text-slate-500">
                  Kode: {thesis.mentor?.identifier || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

