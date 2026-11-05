'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function uploadGuidanceDraft(formData: FormData) {
  const thesisId = formData.get('thesis_id') as string
  const chapter = formData.get('chapter') as string
  const studentNotes = formData.get('student_notes') as string
  const file = formData.get('file') as File

  if (!thesisId || !chapter || !file || file.size === 0) {
    return { error: 'Bab dan berkas naskah wajib dipilih.' }
  }

  // Validasi ukuran berkas (maksimal 15 MB)
  const MAX_SIZE = 15 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return { error: 'Ukuran berkas maksimal 15 MB.' }
  }

  // Validasi format berkas
  const fileName = file.name
  const fileExt = fileName.split('.').pop()?.toLowerCase()
  if (!fileExt || !['pdf', 'docx', 'doc'].includes(fileExt)) {
    return { error: 'Format berkas hanya boleh PDF (.pdf) atau Word (.docx / .doc).' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan login kembali.' }
  }

  // Simpan file ke Supabase Storage menggunakan Admin Client (bypass Storage RLS)
  const timestamp = Date.now()
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${thesisId}/${timestamp}_${sanitizedName}`

  const adminSupabase = createAdminClient()

  // Pastikan bucket thesis-documents ada
  await adminSupabase.storage.createBucket('thesis-documents', {
    public: true,
  })

  const { error: storageError } = await adminSupabase.storage
    .from('thesis-documents')
    .upload(storagePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    })

  if (storageError) {
    return { error: 'Gagal mengunggah berkas ke penyimpanan: ' + storageError.message }
  }

  const {
    data: { publicUrl },
  } = adminSupabase.storage.from('thesis-documents').getPublicUrl(storagePath)

  // Simpan riwayat bimbingan ke tabel guidance_sessions
  const { error: insertError } = await supabase.from('guidance_sessions').insert({
    thesis_id: thesisId,
    submitted_by: user.id,
    chapter,
    student_notes: studentNotes || null,
    file_url: publicUrl,
    file_name: fileName,
    file_type: fileExt === 'pdf' ? 'pdf' : 'docx',
    status: 'pending',
  })

  if (insertError) {
    return { error: 'Gagal mencatat bimbingan: ' + insertError.message }
  }

  // Perbarui status tugas akhir menjadi 'in_progress'
  await supabase
    .from('theses')
    .update({ status: 'in_progress', updated_at: new Date().toISOString() })
    .eq('id', thesisId)

  revalidatePath('/dashboard/student/guidance')
  return { success: true }
}
