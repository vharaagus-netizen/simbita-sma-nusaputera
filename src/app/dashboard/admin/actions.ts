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
  return { success: true, message: `Akun "${cleanUsername}" berhasil dibuat!` }
}

// TOGGLE FEATURE FLAG (SAKLAR ON/OFF FITUR)
export async function toggleAdminFeature(key: 'feature_defense_scheduling' | 'feature_defense_scoring', value: boolean) {
  try {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('app_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      return { error: 'Gagal menyimpan status saklar fitur: ' + error.message }
    }

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard/student')
    revalidatePath('/dashboard/mentor')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem' }
  }
}

// ATUR JADWAL SIDANG (DEFENSE SCHEDULING)
export async function scheduleThesisDefense(formData: FormData) {
  const thesisId = formData.get('thesis_id') as string
  const defenseDate = formData.get('defense_date') as string
  const defenseLocation = (formData.get('defense_location') as string)?.trim()
  const examiner1Id = (formData.get('examiner1_id') as string) || null
  const examiner2Id = (formData.get('examiner2_id') as string) || null

  if (!thesisId || !defenseDate) {
    return { error: 'Kelompok dan Tanggal Sidang wajib diisi.' }
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('theses')
    .update({
      defense_date: defenseDate,
      defense_location: defenseLocation || null,
      examiner1_id: examiner1Id,
      examiner2_id: examiner2Id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', thesisId)

  if (error) {
    return { error: 'Gagal menjadwalkan sidang: ' + error.message }
  }

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/student')
  revalidatePath('/dashboard/mentor')
  return { success: true }
}

// INPUT NILAI RUBRIK SIDANG (DEFENSE SCORING)
export async function submitDefenseScore(formData: FormData) {
  const thesisId = formData.get('thesis_id') as string
  const examinerRole = (formData.get('examiner_role') as string) || 'penguji'
  const scorePresentation = parseFloat(formData.get('score_presentation') as string) || 0
  const scoreContent = parseFloat(formData.get('score_content') as string) || 0
  const scoreMastery = parseFloat(formData.get('score_mastery') as string) || 0
  const notes = (formData.get('notes') as string)?.trim() || null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir.' }
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('defense_scores')
    .upsert(
      {
        thesis_id: thesisId,
        examiner_id: user.id,
        examiner_role: examinerRole,
        score_presentation: scorePresentation,
        score_content: scoreContent,
        score_mastery: scoreMastery,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'thesis_id,examiner_id' }
    )

  if (error) {
    return { error: 'Gagal menyimpan skor ujian: ' + error.message }
  }

  revalidatePath('/dashboard/admin')
  revalidatePath(`/dashboard/mentor/group/${thesisId}`)
  return { success: true }
}

// -------------------------------------------------------------
// MANAJEMEN PENGGUNA (EDIT, RESET PASSWORD, NONAKTIFKAN, HAPUS)
// -------------------------------------------------------------

// 1. UPDATE DATA PENGGUNA
export async function updateUserProfile(formData: FormData) {
  const userId = formData.get('user_id') as string
  const name = (formData.get('name') as string)?.trim()
  const classOrDept = (formData.get('class_or_dept') as string)?.trim() || null
  const phone = (formData.get('phone_number') as string)?.trim() || null
  const role = formData.get('role') as 'student' | 'mentor' | 'admin'

  if (!userId || !name || !role) {
    return { error: 'ID Pengguna, Nama, dan Peran wajib diisi.' }
  }

  try {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('profiles')
      .update({
        name,
        class_or_dept: classOrDept,
        phone,
        phone_number: phone,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return { error: 'Gagal memperbarui profil pengguna: ' + error.message }
    }

    revalidatePath('/dashboard/admin')
    return { success: true, message: 'Data pengguna berhasil diperbarui.' }
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem.' }
  }
}

// 2. TOGGLE STATUS AKTIF / NONAKTIF (SOFT DEACTIVATE)
export async function toggleUserActiveStatus(userId: string, currentStatus: boolean) {
  if (!userId) {
    return { error: 'ID Pengguna tidak valid.' }
  }

  try {
    const adminSupabase = createAdminClient()
    const newStatus = !currentStatus

    const { error } = await adminSupabase
      .from('profiles')
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return { error: 'Gagal mengubah status pengguna: ' + error.message }
    }

    revalidatePath('/dashboard/admin')
    return {
      success: true,
      message: newStatus
        ? 'Akun pengguna berhasil diaktifkan kembali.'
        : 'Akun pengguna berhasil dinonaktifkan (arsip aman, KTI tidak hilang).',
    }
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem.' }
  }
}

// 3. RESET PASSWORD PENGGUNA OLEH ADMIN
export async function resetUserPassword(userId: string, newPassword: string) {
  if (!userId || !newPassword) {
    return { error: 'ID Pengguna dan Password baru wajib diisi.' }
  }

  if (newPassword.length < 6) {
    return { error: 'Kata sandi baru minimal 6 karakter.' }
  }

  try {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      return { error: 'Gagal mereset kata sandi: ' + error.message }
    }

    return { success: true, message: 'Kata sandi baru berhasil disimpan!' }
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem.' }
  }
}

// 4. HAPUS AKUN AMAN (DENGAN PROTEKSI DATA KTI)
export async function deleteUserAccount(userId: string) {
  if (!userId) {
    return { error: 'ID Pengguna tidak valid.' }
  }

  try {
    const adminSupabase = createAdminClient()

    // Cek apakah pengguna terhubung dengan karya KTI / bimbingan tugas akhir
    const { data: linkedTheses } = await adminSupabase
      .from('theses')
      .select('id, title')
      .or(`leader_id.eq.${userId},member_id.eq.${userId},mentor_id.eq.${userId}`)
      .limit(1)

    if (linkedTheses && linkedTheses.length > 0) {
      return {
        error: `TIDAK DAPAT DIHAPUS PERMANEN! Pengguna ini terdaftar sebagai penulis/pembimbing pada KTI: "${linkedTheses[0].title}". Silakan gunakan tombol "Nonaktifkan Akun" agar karya ilmiah di Repositori Publik tidak rusak atau hilang.`,
      }
    }

    // Jika akun tidak memiliki KTI (misal akun uji coba / salah daftar), hapus bersih dari auth.users
    const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      return { error: 'Gagal menghapus akun: ' + deleteAuthError.message }
    }

    revalidatePath('/dashboard/admin')
    return { success: true, message: 'Akun pengguna berhasil dihapus permanen.' }
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem.' }
  }
}
