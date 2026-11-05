import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import {
  Users,
  LogOut,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  User,
  PlusCircle,
} from 'lucide-react'
import type { Thesis, Profile } from '@/types/database'
import PlottingRow from './plotting-row'
import AdminCreateForm from './admin-create-form'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cek apakah user adalah admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // 1. Ambil semua kelompok tugas akhir beserta data ketua, anggota, dan pembimbing
  const { data: thesesData } = await supabase
    .from('theses')
    .select(`
      *,
      leader:leader_id(*),
      member:member_id(*),
      mentor:mentor_id(*)
    `)
    .order('created_at', { ascending: false })

  const theses = (thesesData || []) as (Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
  })[]

  // 2. Ambil daftar semua guru pembimbing yang terdaftar
  const { data: mentorsData } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'mentor')
    .order('name', { ascending: true })

  const mentors = (mentorsData || []) as Profile[]

  // 3. Ambil daftar semua siswa yang terdaftar
  const { data: studentsData } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('name', { ascending: true })

  const students = (studentsData || []) as Profile[]

  // Statistik ringkas
  const totalTheses = theses.length
  const unassignedTheses = theses.filter((t) => !t.mentor_id).length
  const completedTheses = theses.filter((t) => t.status === 'completed').length

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-[#090d16] transition-colors duration-200">
      {/* HEADER ADMIN */}
      <header className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
                Administrator / Koordinator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="text-right hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-3">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {profile?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Panel Manajemen Sekolah</p>
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

      {/* ISI DASHBOARD KOORDINATOR */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6 animate-fade-in">
        {/* STATISTIK & TOMBOL TAMBAH AKUN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Panel Pengaturan Guru & Siswa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola alokasi pembimbing, data kelompok, dan akun pengguna sekolah
            </p>
          </div>

          <AdminCreateForm />
        </div>

        {/* RINGKASAN DATA */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs dark:shadow-none seamless-card">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kelompok Siswa</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{totalTheses}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Total terdaftar</p>
          </div>

          <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs dark:shadow-none seamless-card">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Belum Ada Pembimbing</span>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{unassignedTheses}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Menunggu di-plot</p>
          </div>

          <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs dark:shadow-none seamless-card">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Guru Pembimbing</span>
            <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-1">{mentors.length}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Guru aktif</p>
          </div>

          <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs dark:shadow-none seamless-card">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Siswa Terdaftar</span>
            <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">{students.length}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Peserta bimbingan</p>
          </div>
        </div>

        {/* TABEL PLOTTING MANUAL GURU KE KELOMPOK */}
        <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs dark:shadow-none overflow-hidden seamless-card">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Plotting Guru Pembimbing ke Kelompok Siswa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tugaskan 1 guru pembimbing untuk membimbing tiap kelompok (2 siswa)
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              {theses.length} Kelompok
            </span>
          </div>

          {theses.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500">
              Belum ada kelompok siswa yang mengajukan judul tugas akhir.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {theses.map((t) => (
                <div key={t.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm break-words break-all [overflow-wrap:anywhere]">
                          {t.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                            t.mentor_id
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50'
                          }`}
                        >
                          {t.mentor_id ? 'Sudah Ada Pembimbing' : 'Menunggu Plotting'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          <span>Siswa 1 (Ketua): </span>
                          <strong className="text-slate-800 dark:text-slate-200">{t.leader?.name}</strong>{' '}
                          <span className="text-blue-600 dark:text-blue-400 font-mono">({t.leader?.identifier})</span>
                        </div>
                        <span>•</span>
                        <div>
                          <span>Siswa 2 (Anggota): </span>
                          <strong className="text-slate-800 dark:text-slate-200">{t.member?.name || 'Belum ada'}</strong>{' '}
                          {t.member && (
                            <span className="text-blue-600 dark:text-blue-400 font-mono">({t.member?.identifier})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SELECTOR PLOTTING GURU */}
                    <div className="shrink-0">
                      <PlottingRow
                        thesisId={t.id}
                        currentMentorId={t.mentor_id}
                        mentors={mentors}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DAFTAR GURU & SISWA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DAFTAR GURU */}
          <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3 seamless-card">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Daftar Guru Pembimbing ({mentors.length})</span>
              </h3>
            </div>

            {mentors.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
                Belum ada guru yang terdaftar. Buat akun guru dengan tombol di atas.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                {mentors.map((m) => {
                  const assignedCount = theses.filter((t) => t.mentor_id === m.id).length
                  return (
                    <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {m.class_or_dept || 'Guru'} • Kode:{' '}
                          <span className="text-purple-600 dark:text-purple-400 font-semibold font-mono">{m.identifier}</span>
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-800/50">
                        {assignedCount} Kelompok
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* DAFTAR SISWA */}
          <div className="bg-white dark:bg-[#111927] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3 seamless-card">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Daftar Siswa Terdaftar ({students.length})</span>
              </h3>
            </div>

            {students.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
                Belum ada siswa yang mendaftar.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                {students.map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {s.class_or_dept || 'Siswa SMA'} • Kode:{' '}
                        <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">{s.identifier}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {s.identifier}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
