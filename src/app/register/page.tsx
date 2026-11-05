'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/app/auth/actions'
import {
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  User,
  BookOpen,
  AtSign,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'mentor'>('student')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    formData.set('role', role)

    const result = await register(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(result.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-100/70 dark:bg-[#090d16] py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Floating Theme Toggle in corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Depan</span>
        </Link>

        <div className="flex items-center justify-center gap-3 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-nusaputera.png"
            alt="Logo SMA Nusaputera"
            className="w-12 h-12 object-contain shrink-0 drop-shadow-2xs"
          />
          <span className="font-bold text-2xl text-slate-900 dark:text-slate-100 tracking-tight">
            SIMBITA NUSAPUTERA
          </span>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Pendaftaran Akun Baru
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Buat akun dengan Username tanpa perlu email
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md animate-scale-up">
        <div className="bg-white dark:bg-[#111927] py-8 px-5 sm:px-10 shadow-xs dark:shadow-none rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
          {/* TAB PILIHAN PERAN (SISWA / GURU) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('mentor')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'mentor'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guru Pembimbing</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{success}</p>
              <Link
                href="/login"
                className="inline-block mt-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs seamless-btn transition-colors"
              >
                Klik di Sini untuk Masuk
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Username (Untuk Masuk ke Akun) *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder={
                      role === 'student'
                        ? 'Contoh: ahmad_xii'
                        : 'Contoh: siti_rahma'
                    }
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Gunakan huruf kecil, angka, atau underscore (_) tanpa spasi.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {role === 'student'
                    ? 'Nama Lengkap Siswa *'
                    : 'Nama Lengkap Guru & Gelar *'}
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder={
                      role === 'student'
                        ? 'Contoh: Ahmad Rizki'
                        : 'Contoh: Dra. Siti Rahma, M.Pd'
                    }
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="class_or_dept"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {role === 'student'
                    ? 'Kelas / Jurusan *'
                    : 'Rumpun Mata Pelajaran *'}
                </label>
                <div className="mt-1">
                  <input
                    id="class_or_dept"
                    name="class_or_dept"
                    type="text"
                    required
                    placeholder={
                      role === 'student'
                        ? 'Contoh: XII MIPA 2'
                        : 'Contoh: Bahasa & Sastra Indonesia / IPA'
                    }
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Kata Sandi (Minimal 6 karakter) *
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              {/* CATATAN PRIVASI IDENTITAS ACAK */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Sistem otomatis memberikan{' '}
                  <strong>
                    Kode Acak ({role === 'student' ? 'SIS-XXXX' : 'GUR-XXXX'})
                  </strong>{' '}
                  sebagai nomor identitas unik bimbingan Anda.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-60 seamless-btn transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'Mendaftarkan Akun...'
                      : `Daftar sebagai ${
                          role === 'student' ? 'Siswa' : 'Guru Pembimbing'
                        }`}
                  </span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sudah memiliki akun?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
