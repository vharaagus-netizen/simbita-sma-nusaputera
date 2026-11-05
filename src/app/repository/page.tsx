import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  BookOpen,
  Search,
  ArrowLeft,
  Download,
  Users,
  GraduationCap,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Thesis, Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function RepositoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim().toLowerCase() || ''

  const supabase = await createClient()

  // Ambil semua karya akhir yang telah selesai/ACC (completed) atau dipublikasikan
  const { data: thesesData } = await supabase
    .from('theses')
    .select(`
      *,
      leader:leader_id(*),
      member:member_id(*),
      mentor:mentor_id(*),
      sessions:guidance_sessions(file_url, file_name, file_type, status, chapter)
    `)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })

  let theses = (thesesData || []) as (Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
    sessions?: any[]
  })[]

  // Filter pencarian jika ada kata kunci
  if (query) {
    theses = theses.filter((t) => {
      const titleMatch = t.title.toLowerCase().includes(query)
      const descMatch = (t.description || '').toLowerCase().includes(query)
      const leaderMatch = (t.leader?.name || '').toLowerCase().includes(query)
      const memberMatch = (t.member?.name || '').toLowerCase().includes(query)
      const mentorMatch = (t.mentor?.name || '').toLowerCase().includes(query)
      return titleMatch || descMatch || leaderMatch || memberMatch || mentorMatch
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-[#090d16] transition-colors duration-200">
      {/* HEADER NAVBAR */}
      <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-nusaputera.png"
                alt="Logo SMA Nusaputera"
                className="w-9 h-9 object-contain shrink-0 drop-shadow-2xs"
              />
              <div>
                <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  REPOSITORI KTI NUSAPUTERA
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-1">
                  Koleksi Karya Tulis Ilmiah & Tugas Akhir Siswa
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl seamless-btn shadow-xs transition-colors"
            >
              Masuk Portal
            </Link>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda Utama</span>
        </Link>

        {/* HERO BANNER & PENCARIAN */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-none space-y-4 seamless-card">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Perpustakaan Digital KTI</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Koleksi Karya Tulis Ilmiah Siswa
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Temukan referensi judul, topik penelitian, dan karya ilmiah tugas akhir yang telah dinyatakan lulus oleh Dewan Penguji SMA Nusaputera Semarang.
            </p>
          </div>

          {/* FORM PENCARIAN */}
          <form method="GET" className="pt-2">
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={q || ''}
                placeholder="Cari berdasarkan judul penelitian, topik, nama siswa, atau pembimbing..."
                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-24 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs seamless-btn"
              >
                Cari
              </button>
            </div>
          </form>
        </div>

        {/* DAFTAR KARYA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Menampilkan <strong>{theses.length}</strong> karya ilmiah lulus
              {query && ` untuk kata kunci "${query}"`}
            </span>
            {query && (
              <Link href="/repository" className="text-blue-600 dark:text-blue-400 hover:underline">
                Hapus Filter
              </Link>
            )}
          </div>

          {theses.length === 0 ? (
            <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center shadow-xs dark:shadow-none space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                Tidak Ditemukan Karya Ilmiah
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {query
                  ? 'Tidak ada naskah yang cocok dengan pencarian Anda. Coba kata kunci lain.'
                  : 'Belum ada karya ilmiah yang berstatus Lulus (ACC Final). Naskah yang telah tuntas sidang akan otomatis tampil di sini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {theses.map((item) => {
                // Cari berkas final yang disetujui jika ada
                const acceptedDraft = item.sessions?.find(
                  (s: any) => s.status === 'accepted'
                )

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs dark:shadow-none hover:border-blue-300 dark:hover:border-blue-500 seamless-card space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 uppercase">
                          Lulus Sidang KTI
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 break-words">
                          {item.title}
                        </h2>
                        {item.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {acceptedDraft && (
                        <a
                          href={acceptedDraft.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shrink-0 seamless-btn shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Naskah ({acceptedDraft.file_type?.toUpperCase()})</span>
                        </a>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <span>Penulis: </span>
                          <strong className="text-slate-800 dark:text-slate-200">
                            {item.leader?.name}
                          </strong>
                          {item.member && (
                            <span>
                              {' '}
                              & <strong className="text-slate-800 dark:text-slate-200">{item.member.name}</strong>
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {' '}
                            ({item.leader?.class_or_dept || 'SMA'})
                          </span>
                        </div>

                        <div>
                          <span>Pembimbing: </span>
                          <strong className="text-slate-800 dark:text-slate-200">
                            {item.mentor?.name || 'Guru Pembimbing'}
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(item.updated_at).toLocaleDateString('id-ID', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 transition-colors duration-200">
        <p className="font-bold text-slate-700 dark:text-slate-200">SMA NUSAPUTERA SEMARANG</p>
        <p>Jl. Ki Mangunsarkoro No.59, Semarang Tengah • Telp: (024) 3542444</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          © 2026 SIMBITA • Repositori Karya Tulis Ilmiah Siswa
        </p>
      </footer>
    </div>
  )
}
