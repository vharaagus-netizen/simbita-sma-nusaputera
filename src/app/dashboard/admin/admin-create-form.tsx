'use client'

import { useState } from 'react'
import { adminCreateAccount } from './actions'
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminCreateForm() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<'mentor' | 'student'>('mentor')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('role', role)

    const result = await adminCreateAccount(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(result?.message || 'Akun berhasil dibuat!')
      form.reset()
      setTimeout(() => {
        setSuccess(null)
        setOpen(false)
      }, 2500)
    }
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] font-semibold text-xs shadow-xs transition-colors seamless-btn"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Guru / Siswa Baru</span>
        </button>
      ) : (
        <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200 dark:border-[#2E2838] rounded-2xl p-5 shadow-xs dark:shadow-none space-y-4 animate-scale-up">
          <div className="flex items-center justify-between pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
            <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#E11D48] dark:text-[#FF80AB]" />
              <span>Formulir Pembuatan Akun oleh Admin</span>
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-semibold"
            >
              Tutup Form
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="admin_role_select"
                  checked={role === 'mentor'}
                  onChange={() => setRole('mentor')}
                  className="text-[#E11D48] focus:ring-[#E11D48]"
                />
                <span className="text-[#E11D48] dark:text-[#FF80AB]">Guru Pembimbing</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="admin_role_select"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                  className="text-[#E11D48] focus:ring-[#E11D48]"
                />
                <span className="text-[#E11D48] dark:text-[#FF80AB]">Siswa</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Contoh: pak_budi atau rina_xii"
                  className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] bg-white dark:bg-[#15131C] px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Sementara *
                </label>
                <input
                  type="text"
                  name="password"
                  required
                  defaultValue="123456"
                  className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] bg-white dark:bg-[#15131C] px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Budi Santoso, S.Pd"
                  className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] bg-white dark:bg-[#15131C] px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {role === 'mentor' ? 'Rumpun Pelajaran' : 'Kelas / Jurusan'}
                </label>
                <input
                  type="text"
                  name="class_or_dept"
                  placeholder={role === 'mentor' ? 'Contoh: IPA / Matematika' : 'Contoh: XII MIPA 1'}
                  className="block w-full rounded-xl border border-pink-200 dark:border-[#2E2838] bg-white dark:bg-[#15131C] px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#E11D48] dark:focus:border-[#F472B6] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 dark:focus:ring-[#F472B6]/20 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-pink-200/60 dark:border-[#2E2838]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] font-semibold text-xs shadow-xs disabled:opacity-60 seamless-btn transition-colors"
              >
                {loading ? 'Menyimpan Akun...' : 'Simpan Akun Baru'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
