'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function assignMentorToThesis(formData: FormData) {
  const thesisId = formData.get('thesis_id') as string
  const mentorId = formData.get('mentor_id') as string

  if (!thesisId || !mentorId) {
    return { error: 'Kelompok dan Guru Pembimbing wajib dipilih.' }
  }

  const supabase = await createClient()

  const { error: updateError } = await supabase
    .from('theses')
    .update({
      mentor_id: mentorId,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', thesisId)

  if (updateError) {
    return { error: 'Gagal memplot guru pembimbing: ' + updateError.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function assignMemberToThesis(formData: FormData) {
  const thesisId = formData.get('thesis_id') as string
  const memberId = formData.get('member_id') as string

  if (!thesisId) {
    return { error: 'Kelompok tidak valid.' }
  }

  const supabase = await createClient()

  const { error: updateError } = await supabase
    .from('theses')
    .update({
      member_id: memberId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', thesisId)

  if (updateError) {
    return { error: 'Gagal memperbarui anggota kelompok: ' + updateError.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function adminCreateAccount(formData: FormData) {
  const username = (formData.get('username') as string)?.trim().toLowerCase()
  const name = (formData.get('name') as string)?.trim()
  const password = formData.get('password') as string
  const role = formData.get('role') as 'student' | 'mentor'
  const classOrDept = (formData.get('class_or_dept') as string)?.trim() || ''

  if (!username || !name || !password || !role) {
    return { error: 'Semua kolom wajib diisi.' }
  }

  const cleanUsername = username.replace(/[^a-z0-9_.]/g, '')
  if (cleanUsername.length < 3) {
    return { error: 'Username minimal 3 karakter.' }
  }

  if (password.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter.' }
  }

  const adminSupabase = createAdminClient()
  const authEmail = `${cleanUsername}@simbita.local`

  const { error: createError } = await adminSupabase.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role,
      class_or_dept: classOrDept,
      username: cleanUsername,
    },
  })

  if (createError) {
    if (createError.message.includes('already registered')) {
      return { error: `Username "${cleanUsername}" sudah digunakan.` }
    }
    return { error: 'Gagal membuat akun: ' + createError.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true, message: `Akun ${name} (${role}) berhasil dibuat!` }
}
