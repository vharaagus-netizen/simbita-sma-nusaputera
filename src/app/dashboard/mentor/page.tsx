import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import {
  Users,
  LogOut,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import type { Thesis, Profile } from '@/types/database'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

export default async function MentorDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil profil guru
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const mentorProfile = profile as Profile

  // Ambil semua kelompok tugas akhir yang dibimbing oleh guru ini
  const { data: thesesData } = await supabase
    .from('theses')
    .select(`
      *,
      leader:leader_id(*),
      member:member_id(*)
    `)
    .eq('mentor_id', user.id)
    .order('created_at', { ascending: false })

  const assignedGroups = (thesesData || []) as (Thesis & {
    leader?: Profile
    member?: Profile
  })[]

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-[#090d16] transition-colors duration-200">
      {/* HEADER DASHBOARD GURU */}
      <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nusaputera.png"
              alt="Logo SMA Nusaputera"
              className="w-9 h-9 object-contain shrink-0 drop-shadow-2xs"
            />
            <div>
              <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                SIMBITA NUSAPUTERA
              </span>
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                Guru Pembimbing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="text-right hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {mentorProfile?.name || user.email}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {mentorProfile?.class_or_dept || 'Guru Pembimbing'}
              </p>
            </div>

            <form action={logout}>
              <button
                type="submit"
                title="Keluar dari Akun"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl seamless-btn transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ISI DASHBOARD */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6 animate-fade-in">
        {/* IDENTITAS GURU */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs dark:shadow-none seamless-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center font-extrabold text-indigo-700 dark:text-indigo-300 text-lg shadow-2xs">
              {mentorProfile?.name?.charAt(0) || 'G'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {mentorProfile?.name || 'Guru Pembimbing'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{mentorProfile?.identifier || 'GUR-XXXX'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rumpun: {mentorProfile?.class_or_dept || '-'} • Anda membimbing{' '}
                <strong className="text-slate-700 dark:text-slate-200">{assignedGroups.length} kelompok siswa</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* DAFTAR KELOMPOK SISWA BIMBINGAN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Daftar Kelompok Siswa Bimbingan
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total: {assignedGroups.length} Kelompok
            </span>
          </div>

          {assignedGroups.length === 0 ? (
            <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 text-center shadow-xs dark:shadow-none seamless-card">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Belum Ada Kelompok yang Dialokasikan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Koordinator/Admin belum memplot kelompok siswa bimbingan kepada Anda. Kelompok akan otomatis muncul di sini setelah di-plot.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignedGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs dark:shadow-none hover:border-indigo-400 dark:hover:border-indigo-500 seamless-card transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base break-words break-all [overflow-wrap:anywhere]">
                        {group.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 break-all [overflow-wrap:anywhere]">
                        {group.description || 'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>

                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50 shrink-0 self-start sm:self-auto">
                      {group.status === 'pending_mentor'
                        ? 'Menunggu Review Judul'
                        : group.status === 'in_progress'
                        ? 'Sedang Bimbingan'
                        : group.status === 'completed'
                        ? 'ACC Final'
                        : group.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">Siswa 1: </span>
                        <strong className="text-slate-800 dark:text-slate-200">{group.leader?.name}</strong>{' '}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          ({group.leader?.identifier})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">Siswa 2: </span>
                        <strong className="text-slate-800 dark:text-slate-200">{group.member?.name || 'Belum ada'}</strong>{' '}
                        {group.member && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            ({group.member?.identifier})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/mentor/group/${group.id}`}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 seamless-btn shadow-xs transition-colors"
                      >
                        <span>Buka Lembar Bimbingan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
