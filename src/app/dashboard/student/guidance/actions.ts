'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 1. Menyiapkan Signed Upload URL aman untuk unggah langsung (Direct Upload)
 * dari browser ke Supabase Storage (Singapura) tanpa melalui server Vercel di AS.
 * Ini memangkas waktu unggah dari puluhan detik menjadi < 2 detik.
 */
export async function prepareGuidanceUpload(
  thesisId: string,
  fileName: string,
  fileSize: number
) {
  if (!thesisId || !fileName) {
    return { error: 'Data tugas akhir atau nama berkas tidak valid.' }
  }

  const MAX_SIZE = 15 * 1024 * 1024
  if (fileSize > MAX_SIZE) {
    return { error: 'Ukuran berkas maksimal 15 MB.' }
  }

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: 'Konfigurasi Supabase Storage belum lengkap di server.' }
  }

  const timestamp = Date.now()
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${thesisId}/${timestamp}_${sanitizedName}`

  try {
    const res = await fetch(
      `${supabaseUrl}/storage/v1/object/upload/sign/thesis-documents/${storagePath}`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 300 }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return { error: 'Gagal membuat URL unggah: ' + errText }
    }

    const data = await res.json()
    const uploadUrl = `${supabaseUrl}/storage/v1${data.url}`
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/thesis-documents/${storagePath}`

    return {
      uploadUrl,
      storagePath,
      publicUrl,
      fileName,
      fileExt: fileExt === 'pdf' ? ('pdf' as const) : ('docx' as const),
    }
  } catch (err: any) {
    return { error: 'Terjadi kendala saat menyiapkan unggahan: ' + err?.message }
  }
}

/**
 * 2. Mencatat sesi bimbingan ke database setelah berkas sukses terunggah ke Supabase Storage.
 */
export async function finalizeGuidanceUpload(data: {
  thesisId: string
  chapter: string
  studentNotes?: string
  storagePath: string
  publicUrl: string
  fileName: string
  fileExt: 'pdf' | 'docx'
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan login kembali.' }
  }

  // Simpan riwayat bimbingan ke tabel guidance_sessions
  const { error: insertError } = await supabase.from('guidance_sessions').insert({
    thesis_id: data.thesisId,
    submitted_by: user.id,
    chapter: data.chapter,
    student_notes: data.studentNotes || null,
    file_url: data.publicUrl,
    file_name: data.fileName,
    file_type: data.fileExt,
    status: 'pending',
  })

  if (insertError) {
    return { error: 'Gagal mencatat bimbingan: ' + insertError.message }
  }

  // Perbarui status tugas akhir menjadi 'in_progress'
  await supabase
    .from('theses')
    .update({ status: 'in_progress', updated_at: new Date().toISOString() })
    .eq('id', data.thesisId)

  revalidatePath('/dashboard/student/guidance')
  return { success: true }
}

/**
 * Fallback: Unggah standar via FormData (jika direct upload tidak didukung oleh browser jadul)
 */
export async function uploadGuidanceDraft(formData: FormData) {
  const thesisId = formData.get('thesis_id') as string
  const chapter = formData.get('chapter') as string
  const studentNotes = formData.get('student_notes') as string
  const file = formData.get('file') as File

  if (!thesisId || !chapter || !file || file.size === 0) {
    return { error: 'Bab dan berkas naskah wajib dipilih.' }
  }

  const prep = await prepareGuidanceUpload(thesisId, file.name, file.size)
  if (prep.error || !prep.uploadUrl) {
    return { error: prep.error || 'Gagal menyiapkan unggahan berkas.' }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const putRes = await fetch(prep.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: arrayBuffer,
    })

    if (!putRes.ok) {
      return { error: 'Gagal mengunggah berkas ke penyimpanan.' }
    }

    return await finalizeGuidanceUpload({
      thesisId,
      chapter,
      studentNotes,
      storagePath: prep.storagePath!,
      publicUrl: prep.publicUrl!,
      fileName: prep.fileName!,
      fileExt: prep.fileExt!,
    })
  } catch (err: any) {
    return { error: 'Gagal memproses unggahan: ' + err?.message }
  }
}
