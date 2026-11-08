'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  ShieldCheck,
  UserCheck,
  UserX,
  Phone,
  Power,
} from 'lucide-react'
import type { Profile } from '@/types/database'
import {
  updateUserProfile,
  toggleUserActiveStatus,
  resetUserPassword,
  deleteUserAccount,
} from './actions'

interface UserManagementProps {
  initialUsers: Profile[]
}

export default function UserManagement({ initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'mentor' | 'admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // State untuk modal Edit & Reset Password
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [editName, setEditName] = useState('')
  const [editClass, setEditClass] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState<'student' | 'mentor' | 'admin'>('student')
  const [newPassword, setNewPassword] = useState('')

  // State proses & feedback
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  // State modal konfirmasi hapus
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null)

  // Filter daftar user
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      u.identifier.toLowerCase().includes(term) ||
      (u.class_or_dept || '').toLowerCase().includes(term) ||
      (u.phone_number || u.phone || '').includes(term)

    const matchesRole = roleFilter === 'all' || u.role === roleFilter

    const isActive = u.is_active !== false // default true
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  function openEditModal(user: Profile) {
    setEditingUser(user)
    setEditName(user.name)
    setEditClass(user.class_or_dept || '')
    setEditPhone(user.phone_number || user.phone || '')
    setEditRole(user.role)
    setNewPassword('')
    setFeedback(null)
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    setFeedback(null)

    const formData = new FormData()
    formData.set('user_id', editingUser.id)
    formData.set('name', editName)
    formData.set('class_or_dept', editClass)
    formData.set('phone_number', editPhone)
    formData.set('role', editRole)

    const res = await updateUserProfile(formData)

    if (res?.error) {
      setFeedback({ type: 'error', message: res.error })
      setLoading(false)
      return
    }

    // Jika admin juga memasukkan password baru untuk di-reset
    if (newPassword.trim()) {
      const passRes = await resetUserPassword(editingUser.id, newPassword.trim())
      if (passRes?.error) {
        setFeedback({
          type: 'error',
          message: `Profil tersimpan, tetapi reset password gagal: ${passRes.error}`,
        })
        setLoading(false)
        return
      }
    }

    // Update state lokal
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: editName,
              class_or_dept: editClass || null,
              phone_number: editPhone || null,
              role: editRole,
            }
          : u
      )
    )

    setFeedback({ type: 'success', message: 'Data pengguna dan kata sandi berhasil diperbarui!' })
    setLoading(false)
    setTimeout(() => {
      setEditingUser(null)
      setFeedback(null)
    }, 1200)
  }

  async function handleToggleStatus(user: Profile) {
    const currentStatus = user.is_active !== false
    setLoading(true)
    setFeedback(null)

    const res = await toggleUserActiveStatus(user.id, currentStatus)
    setLoading(false)

    if (res?.error) {
      setFeedback({ type: 'error', message: res.error })
      return
    }

    // Update state lokal
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, is_active: !currentStatus } : u))
    )

    setFeedback({
      type: 'success',
      message: !currentStatus
        ? `Akun ${user.name} telah diaktifkan kembali.`
        : `Akun ${user.name} berhasil dinonaktifkan (arsip KTI tetap aman).`,
    })

    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleDelete(user: Profile) {
    setLoading(true)
    setFeedback(null)

    const res = await deleteUserAccount(user.id)
    setLoading(false)

    if (res?.error) {
      setFeedback({ type: 'error', message: res.error })
      setDeletingUser(null)
      return
    }

    // Hapus dari state lokal
    setUsers((prev) => prev.filter((u) => u.id !== user.id))
    setDeletingUser(null)
    setFeedback({ type: 'success', message: res.message || 'Akun berhasil dihapus.' })
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none space-y-5 seamless-card">
      {/* HEADER MANAJEMEN PENGGUNA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base">
              Manajemen Pengguna (Siswa & Guru)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Edit profil, reset kata sandi, nonaktifkan akun alumni/pensiun, atau hapus akun aman
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Total Pengguna: <strong>{users.length}</strong>
        </span>
      </div>

      {/* ALERT FEEDBACK NOTIFIKASI */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 text-rose-700 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* FILTER & PENCARIAN */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, SIS-XXXX, kelas, atau nomor WA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">Semua Peran (Siswa, Guru, Admin)</option>
            <option value="student">Hanya Siswa</option>
            <option value="mentor">Hanya Guru Pembimbing</option>
            <option value="admin">Hanya Administrator</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="all">Semua Status (Aktif & Nonaktif)</option>
            <option value="active">Hanya Akun Aktif</option>
            <option value="inactive">Hanya Akun Nonaktif (Alumni)</option>
          </select>
        </div>
      </div>

      {/* TABEL DAFTAR PENGGUNA */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
            <tr>
              <th className="py-3 px-4">Nama Pengguna</th>
              <th className="py-3 px-3">Kode Unik</th>
              <th className="py-3 px-3">Peran</th>
              <th className="py-3 px-3">Kelas / Rumpun</th>
              <th className="py-3 px-3">WhatsApp</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 dark:text-slate-500">
                  Tidak ada data pengguna yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isActive = u.is_active !== false
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors ${
                      !isActive ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                          {u.name.charAt(0)}
                        </span>
                        <span>{u.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {u.identifier}
                    </td>

                    <td className="py-3 px-3">
                      {u.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                          Admin
                        </span>
                      ) : u.role === 'mentor' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          Guru
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          Siswa
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {u.class_or_dept || '-'}
                    </td>

                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">
                      {u.phone_number || u.phone || '-'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                          <UserCheck className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <UserX className="w-3 h-3" />
                          <span>Nonaktif</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* TOMBOL EDIT & RESET PASSWORD */}
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          title="Edit Data & Reset Password"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* TOMBOL TOGGLE STATUS (NONAKTIFKAN / AKTIFKAN) */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          title={
                            isActive
                              ? 'Nonaktifkan Akun (Arsip KTI tetap aman)'
                              : 'Aktifkan Akun Kembali'
                          }
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isActive
                              ? 'border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                              : 'border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* TOMBOL HAPUS AKUN AMAN */}
                        <button
                          type="button"
                          onClick={() => setDeletingUser(u)}
                          title="Hapus Akun Permanen"
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: EDIT DATA & RESET PASSWORD */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Edit Data & Reset Password Pengguna
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap:
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Peran (Role):
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  >
                    <option value="student">Siswa</option>
                    <option value="mentor">Guru Pembimbing</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas / Rumpun:
                  </label>
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    placeholder="XII MIPA 1"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp (Aktif):
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reset Kata Sandi Baru (Opsional):</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kosongkan jika sandi tidak diubah"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Isi kolom ini jika siswa/guru lupa password dan meminta reset.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KONFIRMASI HAPUS AKUN AMAN */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111927] border border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Konfirmasi Hapus Akun
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Anda akan menghapus akun: <strong>{deletingUser.name}</strong> (
                {deletingUser.identifier}).
              </p>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Proteksi Repositori KTI:</span>
                </div>
                <p>
                  Jika akun ini sudah memiliki karya KTI di sistem, penghapusan permanen akan
                  ditolak secara otomatis agar arsip repositori sekolah tidak rusak.
                </p>
                <p className="font-semibold pt-1">
                  💡 Tips: Untuk siswa yang sudah lulus / alumni, gunakan tombol &quot;Nonaktifkan
                  Akun&quot; agar akun tidak bisa login tapi karyanya tetap abadi.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDelete(deletingUser)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-xs"
              >
                {loading ? 'Menghapus...' : 'Ya, Hapus Akun Ini'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

