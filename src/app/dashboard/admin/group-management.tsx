'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  UserCheck,
  BookOpen,
  Filter,
} from 'lucide-react'
import type { Thesis, Profile } from '@/types/database'
import {
  adminCreateThesisGroup,
  adminUpdateThesisGroup,
  adminDeleteThesisGroup,
  assignMentorToThesis,
} from './actions'

interface GroupManagementProps {
  initialTheses: (Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
  })[]
  students: Profile[]
  mentors: Profile[]
}

export default function GroupManagement({
  initialTheses,
  students,
  mentors,
}: GroupManagementProps) {
  const [theses, setTheses] = useState(initialTheses)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [mentorFilter, setMentorFilter] = useState<string>('all')

  // State Modal Buat Kelompok Baru
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newLeaderId, setNewLeaderId] = useState('')
  const [newMemberId, setNewMemberId] = useState('')
  const [newMentorId, setNewMentorId] = useState('')
  const [newStatus, setNewStatus] = useState('in_progress')

  // State Modal Edit Kelompok
  const [editingThesis, setEditingThesis] = useState<(Thesis & {
    leader?: Profile
    member?: Profile
    mentor?: Profile
  }) | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLeaderId, setEditLeaderId] = useState('')
  const [editMemberId, setEditMemberId] = useState('')
  const [editMentorId, setEditMentorId] = useState('')
  const [editStatus, setEditStatus] = useState('in_progress')

  // State Modal Konfirmasi Hapus
  const [deletingThesis, setDeletingThesis] = useState<Thesis | null>(null)

  // State Loading & Feedback
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  // Filter kelompok
  const filteredTheses = theses.filter((t) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      t.title.toLowerCase().includes(term) ||
      (t.description || '').toLowerCase().includes(term) ||
      (t.leader?.name || '').toLowerCase().includes(term) ||
      (t.leader?.identifier || '').toLowerCase().includes(term) ||
      (t.member?.name || '').toLowerCase().includes(term) ||
      (t.member?.identifier || '').toLowerCase().includes(term) ||
      (t.mentor?.name || '').toLowerCase().includes(term)

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter

    const matchesMentor =
      mentorFilter === 'all' ||
      (mentorFilter === 'unassigned' && !t.mentor_id) ||
      (mentorFilter === 'assigned' && !!t.mentor_id) ||
      t.mentor_id === mentorFilter

    return matchesSearch && matchesStatus && matchesMentor
  })

  // Open Edit Modal
  function openEditModal(t: Thesis & { leader?: Profile; member?: Profile; mentor?: Profile }) {
    setEditingThesis(t)
    setEditTitle(t.title)
    setEditDescription(t.description || '')
    setEditLeaderId(t.leader_id)
    setEditMemberId(t.member_id || '')
    setEditMentorId(t.mentor_id || '')
    setEditStatus(t.status)
    setFeedback(null)
  }

  // Handle Buat Kelompok Baru
  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const formData = new FormData()
    formData.set('title', newTitle)
    formData.set('description', newDescription)
    formData.set('leader_id', newLeaderId)
    formData.set('member_id', newMemberId)
    formData.set('mentor_id', newMentorId)
    formData.set('status', newStatus)

    const res = await adminCreateThesisGroup(formData)
    setLoading(false)

    if (res?.error) {
      setFeedback({ type: 'error', message: res.error })
      return
    }

    setFeedback({ type: 'success', message: 'Kelompok baru berhasil dibuat!' })
    setIsCreateOpen(false)
    setNewTitle('')
    setNewDescription('')
    setNewLeaderId('')
    setNewMemberId('')
    setNewMentorId('')
    setTimeout(() => {
      setFeedback(null)
      window.location.reload()
    }, 1200)
  }

  // Handle Simpan Edit Kelompok
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingThesis) return

    setLoading(true)
    setFeedback(null)

    const formData = new FormData()
    formData.set('thesis_id', editingThesis.id)
    formData.set('title', editTitle)
    formData.set('description', editDescription)
    formData.set('leader_id', editLeaderId)
    formData.set('member_id', editMemberId)
    formData.set('mentor_id', editMentorId)
    formData.set('status', editStatus)

    const res = await adminUpdateThesisGroup(formData)
    setLoading(false)

    if (res?.error) {
      setFeedback({ type: 'error', message: res.error })
      return
    }

    // Update state lokal
    setTheses((prev) =>
      prev.map((item) =>
        item.id === editingThesis.id
          ? {
              ...item,
              title: editTitle,
              description: editDescription,
              leader_id: editLeaderId,
              member_id: editMemberId || null,
              mentor_id: editMentorId || null,
              status: editStatus as any,
              leader: students.find((s) => s.id === editLeaderId) || item.leader,
              member: students.find((s) => s.id === editMemberId) || undefined,
              mentor: mentors.find((m) => m.id === editMentorId) || undefined,
            }
          : item
      )
    )

    setFeedback({ type: 'success', message: 'Data kelompok berhasil diperbarui!' })
    setTimeout(() => {
      setEditingThesis(null)
      setFeedback(null)
    }, 1200)
  }

  // Handle Hapus Kelompok
  async function handleDeleteGroup(thesisId: string) {
    setLoading(true)
    setFeedback(null)

    const res = await adminDeleteThesisGroup(thesisId)
    setLoading(false)

    if (res?.error) {
      setFeedback({ type: 'error', message: res.error })
      setDeletingThesis(null)
      return
    }

    setTheses((prev) => prev.filter((item) => item.id !== thesisId))
    setDeletingThesis(null)
    setFeedback({ type: 'success', message: 'Kelompok berhasil dihapus.' })
    setTimeout(() => setFeedback(null), 3000)
  }

  // Quick Plot Mentor directly from row
  async function handleQuickPlot(thesisId: string, mentorId: string) {
    const formData = new FormData()
    formData.set('thesis_id', thesisId)
    formData.set('mentor_id', mentorId)

    const res = await assignMentorToThesis(formData)
    if (res?.success) {
      setTheses((prev) =>
        prev.map((t) =>
          t.id === thesisId
            ? {
                ...t,
                mentor_id: mentorId,
                status: t.status === 'pending_mentor' ? 'in_progress' : t.status,
                mentor: mentors.find((m) => m.id === mentorId) || t.mentor,
              }
            : t
        )
      )
      setFeedback({ type: 'success', message: 'Guru pembimbing berhasil di-plot!' })
      setTimeout(() => setFeedback(null), 2500)
    } else if (res?.error) {
      setFeedback({ type: 'error', message: res.error })
    }
  }

  return (
    <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/80 dark:border-[#2E2838] rounded-2xl p-6 shadow-xs dark:shadow-none space-y-5 seamless-card">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-base">
              Pengatur Kelompok KTI & Plotting Pembimbing
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pasangkan siswa, kelola judul KTI, ganti anggota/ketua, ubah status, dan plot guru pembimbing
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreateOpen(true)
            setFeedback(null)
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] font-semibold text-xs transition-colors shadow-xs seamless-btn cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Kelompok Baru</span>
        </button>
      </div>

      {/* NOTIFIKASI FEEDBACK */}
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

      {/* FILTER & PENCARIAN KELOMPOK */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul KTI, nama siswa (ketua/anggota), atau pembimbing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          >
            <option value="all">Semua Status Bimbingan</option>
            <option value="pending_mentor">Menunggu Review Judul</option>
            <option value="in_progress">Sedang Bimbingan</option>
            <option value="completed">ACC Final (Siap Sidang)</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={mentorFilter}
            onChange={(e) => setMentorFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          >
            <option value="all">Semua Pembimbing</option>
            <option value="unassigned">⚠️ Belum Ada Pembimbing</option>
            <option value="assigned">✅ Sudah Ada Pembimbing</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DAFTAR KELOMPOK */}
      {filteredTheses.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          Tidak ada kelompok tugas akhir yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {filteredTheses.map((t) => (
            <div
              key={t.id}
              className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors space-y-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm break-words break-all [overflow-wrap:anywhere]">
                      {t.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        t.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50'
                          : t.status === 'in_progress'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50'
                          : t.status === 'rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50'
                      }`}
                    >
                      {t.status === 'completed'
                        ? 'ACC Final / Siap Sidang'
                        : t.status === 'in_progress'
                        ? 'Sedang Bimbingan'
                        : t.status === 'rejected'
                        ? 'Ditolak'
                        : 'Menunggu Review Judul'}
                    </span>
                  </div>

                  {t.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {t.description}
                    </p>
                  )}
                </div>

                {/* TOMBOL AKSI KELOMPOK */}
                <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                  <button
                    type="button"
                    onClick={() => openEditModal(t)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Kelompok</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingThesis(t)}
                    title="Hapus Kelompok"
                    className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BARIS DETAIL ANGGOTA & SELECTOR PEMBIMBING */}
              <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Siswa 1 (Ketua): </span>
                    <strong className="text-slate-800 dark:text-slate-200">{t.leader?.name}</strong>{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                      ({t.leader?.identifier})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Siswa 2 (Anggota): </span>
                    {t.member ? (
                      <>
                        <strong className="text-slate-800 dark:text-slate-200">{t.member?.name}</strong>{' '}
                        <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                          ({t.member?.identifier})
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 italic">
                        Belum ada anggota (Individu)
                      </span>
                    )}
                  </div>
                </div>

                {/* SELECTOR PLOTTING PEMBIMBING CEPAT */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">Pembimbing:</span>
                  <select
                    value={t.mentor_id || ''}
                    onChange={(e) => handleQuickPlot(t.id, e.target.value)}
                    className="py-1 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 max-w-xs"
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.identifier})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: BUAT KELOMPOK BARU MANUAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Buat Kelompok Tugas Akhir Baru (Manual)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Tugas Akhir / KTI:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rancang Bangun Pengolahan Limbah Sampah Organik..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Rangkuman Rencana Penelitian:
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat topik riset..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Siswa 1 (Ketua Kelompok):
                  </label>
                  <select
                    required
                    value={newLeaderId}
                    onChange={(e) => setNewLeaderId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="">-- Pilih Siswa Ketua --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.identifier}) {s.class_or_dept ? `[${s.class_or_dept}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Siswa 2 (Anggota):
                  </label>
                  <select
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="">-- Tidak Ada Anggota (Individu) --</option>
                    {students
                      .filter((s) => s.id !== newLeaderId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.identifier}) {s.class_or_dept ? `[${s.class_or_dept}]` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Guru Pembimbing:
                  </label>
                  <select
                    value={newMentorId}
                    onChange={(e) => setNewMentorId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.identifier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Bimbingan:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="in_progress">Sedang Bimbingan</option>
                    <option value="pending_mentor">Menunggu Review Judul</option>
                    <option value="completed">ACC Final (Siap Sidang)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Menyimpan...' : 'Buat Kelompok'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ANGGOTA, JUDUL, DESKRIPSI & STATUS KELOMPOK */}
      {editingThesis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Edit Kelompok & Anggota Tugas Akhir
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingThesis(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Tugas Akhir / KTI:
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Penelitian:
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Siswa 1 (Ketua):
                  </label>
                  <select
                    required
                    value={editLeaderId}
                    onChange={(e) => setEditLeaderId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.identifier}) {s.class_or_dept ? `[${s.class_or_dept}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Siswa 2 (Anggota / Pasangan):
                  </label>
                  <select
                    value={editMemberId}
                    onChange={(e) => setEditMemberId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="">-- Lepas Anggota (Individu) --</option>
                    {students
                      .filter((s) => s.id !== editLeaderId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.identifier}) {s.class_or_dept ? `[${s.class_or_dept}]` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Guru Pembimbing:
                  </label>
                  <select
                    value={editMentorId}
                    onChange={(e) => setEditMentorId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="">-- Belum Ditugaskan --</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.identifier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Bimbingan:
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value="in_progress">Sedang Bimbingan</option>
                    <option value="pending_mentor">Menunggu Review Judul</option>
                    <option value="completed">ACC Final (Siap Sidang)</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingThesis(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS KELOMPOK */}
      {deletingThesis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111927] border border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Konfirmasi Hapus Kelompok KTI
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Anda akan menghapus kelompok KTI: <br />
                <strong className="text-slate-900 dark:text-slate-100 font-bold">
                  &quot;{deletingThesis.title}&quot;
                </strong>
              </p>
              <p className="text-rose-600 dark:text-rose-400 font-medium">
                Perhatian: Tindakan ini akan menghapus seluruh data naskah bab, logbook tatap muka,
                dan rekam nilai kelompok ini secara permanen.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingThesis(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDeleteGroup(deletingThesis.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-xs"
              >
                {loading ? 'Menghapus...' : 'Ya, Hapus Kelompok'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

