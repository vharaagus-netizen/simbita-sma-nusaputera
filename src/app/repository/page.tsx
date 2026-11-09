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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F0F12] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* HEADER NAVBAR */}
      <header className="bg-[#FFF0F6]/90 dark:bg-[#1E1B24]/90 backdrop-blur-md border-b border-pink-200/80 dark:border-[#2E2838] sticky top-0 z-20 transition-colors duration-200">
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
                <span className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
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
              className="px-4 py-2 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] dark:text-[#0F0F12] rounded-xl seamless-btn shadow-xs transition-colors"
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
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#E11D48] dark:hover:text-[#FF80AB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda Utama</span>
        </Link>

        {/* HERO BANNER & PENCARIAN */}
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-3xl p-6 sm:p-10 shadow-xs dark:shadow-none space-y-5 seamless-card">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1 rounded-full bg-white/80 dark:bg-[#15131C] text-[#E11D48] dark:text-[#FF80AB] border border-pink-200 dark:border-[#2E2838] mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Repositori KTI SMA Nusaputera</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Koleksi Karya Tulis Ilmiah Siswa
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Koleksi judul penelitian, metodologi, dan dokumen karya tulis ilmiah yang telah lulus sidang dan disetujui Dewan Penguji SMA Nusaputera Semarang.
            </p>
          </div>

          {/* FORM PENCARIAN ELEGAN */}
          <form method="GET" className="pt-1">
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={q || ''}
                placeholder="Cari berdasarkan judul penelitian, topik, nama siswa, atau pembimbing..."
                className="block w-full rounded-2xl border border-pink-200/90 dark:border-[#2E2838] bg-white dark:bg-[#0F0F12] pl-10 pr-28 py-3 text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-slate-400 focus:bg-white dark:focus:bg-[#0F0F12] focus:border-[#E11D48] dark:focus:border-[#FF80AB] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 transition-all shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] font-bold text-xs seamless-btn cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>Cari KTI</span>
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
              <Link href="/repository" className="text-[#E11D48] dark:text-[#FF80AB] hover:underline font-semibold">
                Hapus Filter
              </Link>
            )}
          </div>

          {theses.length === 0 ? (
            <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-12 text-center shadow-xs dark:shadow-none space-y-3">
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
                    className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none hover:border-[#E11D48]/50 dark:hover:border-[#FF80AB]/50 seamless-card space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 uppercase">
                          Lulus Sidang KTI
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-2 break-words">
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] text-xs font-bold shrink-0 seamless-btn shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Naskah ({acceptedDraft.file_type?.toUpperCase()})</span>
                        </a>
                      )}
                    </div>

                    <div className="pt-3 border-t border-pink-200/60 dark:border-[#2E2838] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
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
      <footer className="border-t border-pink-200/80 dark:border-[#2E2838] bg-white dark:bg-[#0F0F12] py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 transition-colors duration-200">
        <p className="font-bold text-slate-700 dark:text-slate-200">SMA NUSAPUTERA SEMARANG</p>
        <p>Jl. Ki Mangunsarkoro No.59, Semarang Tengah • Telp: (024) 3542444</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          © 2026 SIMBITA • Repositori Karya Tulis Ilmiah Siswa
        </p>
      </footer>
    </div>
  )
}

