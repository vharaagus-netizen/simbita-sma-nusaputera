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
  Sparkles,
} from 'lucide-react'
import type { Thesis, Profile } from '@/types/database'
import AdminCreateForm from './admin-create-form'
import ExportExcelButton from './export-button'
import FeatureToggles from './feature-toggles'
import DefenseScheduleSection from './defense-schedule-section'
import GroupManagement from './group-management'
import UserManagement from './user-management'
import { getFeatureSettings } from '@/lib/settings'
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

  // Ambil pengaturan fitur On / Off
  const featureSettings = await getFeatureSettings()

  // 1. Ambil semua kelompok tugas akhir beserta data ketua, anggota, pembimbing, dan penguji
  const { data: thesesData } = await supabase
    .from('theses')
    .select(`
      *,
      leader:leader_id(*),
      member:member_id(*),
      mentor:mentor_id(*),
      examiner1:examiner1_id(*),
      examiner2:examiner2_id(*)
    `)
    .order('created_at', { ascending: false })

  const theses = (thesesData || []) as (Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
    examiner1?: Profile
    examiner2?: Profile
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

  // 4. Ambil semua akun pengguna untuk Manajemen Pengguna
  const { data: allUsersData } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const allUsers = (allUsersData || []) as Profile[]

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
            <Link
              href="/repository"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Repositori KTI</span>
            </Link>

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
        {/* STATISTIK & TOMBOL AKSI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Panel Pengaturan Guru & Siswa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola alokasi pembimbing, jadwal sidang, data kelompok, dan akun pengguna sekolah
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* FITUR 2: EKSPOR REKAP EXCEL (CSV) */}
            <ExportExcelButton theses={theses} />
            <AdminCreateForm />
          </div>
        </div>

        {/* SAKLAR FITUR TAMBAHAN (ON/OFF) */}
        <FeatureToggles
          initialScheduling={featureSettings.defense_scheduling}
          initialScoring={featureSettings.defense_scoring}
        />

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

        {/* FITUR 1 (JIKA SAKLAR ON): PENJADWALAN SIDANG */}
        {featureSettings.defense_scheduling && (
          <DefenseScheduleSection theses={theses} mentors={mentors} />
        )}

        {/* FITUR PENGATUR KELOMPOK KTI & PLOTTING PEMBIMBING */}
        <GroupManagement initialTheses={theses} students={students} mentors={mentors} />

        {/* MANAJEMEN PENGGUNA (SISWA & GURU) */}
        <UserManagement initialUsers={allUsers} />
      </main>
    </div>
  )
}
