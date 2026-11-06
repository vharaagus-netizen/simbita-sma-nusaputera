'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reviewGuidanceSession(formData: FormData) {
  const sessionId = formData.get('session_id') as string
  const groupId = formData.get('group_id') as string
  const status = formData.get('status') as string
  const mentorFeedback = formData.get('mentor_feedback') as string

  if (!sessionId || !status) {
    return { error: 'Status evaluasi wajib dipilih.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir.' }
  }

  const { error: updateError } = await supabase
    .from('guidance_sessions')
    .update({
      status,
      mentor_feedback: mentorFeedback || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (updateError) {
    return { error: 'Gagal menyimpan evaluasi: ' + updateError.message }
  }

  revalidatePath(`/dashboard/mentor/group/${groupId}`)
  return { success: true }
}

export async function verifyGuidanceJournal(formData: FormData) {
  const journalId = formData.get('journal_id') as string
  const groupId = formData.get('group_id') as string

  if (!journalId) {
    return { error: 'ID jurnal tidak valid.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir.' }
  }

  const { error: updateError } = await supabase
    .from('guidance_journals')
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
    })
    .eq('id', journalId)

  if (updateError) {
    return { error: 'Gagal memvalidasi jurnal: ' + updateError.message }
  }

  revalidatePath(`/dashboard/mentor/group/${groupId}`)
  return { success: true }
}

export async function toggleDefenseReady(formData: FormData) {
  const groupId = formData.get('group_id') as string
  const targetStatus = (formData.get('status') as string) || 'completed'

  if (!groupId) {
    return { error: 'ID kelompok tidak valid.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir.' }
  }

  // Verifikasi otorisasi: hanya mentor kelompok atau admin yang bisa mengubah status
  const { data: thesis } = await supabase
    .from('theses')
    .select('mentor_id')
    .eq('id', groupId)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isMentor = thesis?.mentor_id === user.id
  const isAdmin = profile?.role === 'admin'

  if (!isMentor && !isAdmin) {
    return { error: 'Hanya Guru Pembimbing atau Admin yang berhak menyetujui Siap Sidang.' }
  }

  const { error: updateError } = await supabase
    .from('theses')
    .update({
      status: targetStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', groupId)

  if (updateError) {
    return { error: 'Gagal memperbarui status kesiapan sidang: ' + updateError.message }
  }

  revalidatePath(`/dashboard/mentor/group/${groupId}`)
  revalidatePath('/dashboard/mentor')
  revalidatePath('/dashboard/student')
  revalidatePath('/dashboard/student/journal')
  revalidatePath('/dashboard/admin')

  return { success: true }
}

export async function finalizeThesisACC(formData: FormData) {
  return toggleDefenseReady(formData)
}

