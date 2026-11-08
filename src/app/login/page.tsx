'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { LogIn, AlertCircle, ArrowLeft, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await login(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Login submit error:', err)
      setError(
        err?.message ||
          'Terjadi kendala saat menghubungi server. Pastikan koneksi internet stabil dan coba lagi.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white dark:bg-[#0F0F12] text-[#0F172A] dark:text-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Floating Theme Toggle in corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#E11D48] dark:hover:text-[#FF80AB] mb-6 transition-colors"
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
          <span className="font-bold text-2xl text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            SIMBITA NUSAPUTERA
          </span>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Masukkan Username dan Kata Sandi Anda
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md animate-scale-up">
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] py-8 px-5 sm:px-10 shadow-xs dark:shadow-none rounded-2xl border border-pink-200/80 dark:border-[#2E2838] transition-colors duration-200">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Contoh: ahmad_xii atau bu_siti"
                  className="block w-full rounded-xl border border-pink-200/80 dark:border-[#2E2838] bg-white dark:bg-[#0F0F12] pl-9 pr-3 py-2 text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#FF80AB] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#FF80AB]/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Kata Sandi
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-pink-200/80 dark:border-[#2E2838] bg-white dark:bg-[#0F0F12] px-3 py-2 text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#FF80AB] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#FF80AB]/20 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] px-4 py-2.5 text-sm font-semibold shadow-xs disabled:opacity-60 seamless-btn transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-pink-200/60 dark:border-[#2E2838] text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum memiliki akun bimbingan? Silakan hubungi Administrator / Koordinator sekolah.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
