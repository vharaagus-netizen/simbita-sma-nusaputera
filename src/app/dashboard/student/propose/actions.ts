'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitThesisProposal(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const partnerIdentifier = (formData.get('partner_identifier') as string)?.trim().toUpperCase()

  if (!title) {
    return { error: 'Judul tugas akhir wajib diisi.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir. Silakan login kembali.' }
  }

  // Cek apakah siswa ini sudah memiliki judul tugas akhir yang aktif
  const { data: existingThesis } = await supabase
    .from('theses')
    .select('id')
    .or(`leader_id.eq.${user.id},member_id.eq.${user.id}`)
    .maybeSingle()

  if (existingThesis) {
    return { error: 'Anda sudah terdaftar dalam judul tugas akhir lain.' }
  }

  let memberId: string | null = null

  // Jika memasukkan kode rekan kelompok (SIS-XXXX)
  if (partnerIdentifier) {
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('identifier', partnerIdentifier)
      .eq('role', 'student')
      .maybeSingle()

    if (!partnerProfile) {
      return {
        error: `Rekan dengan kode "${partnerIdentifier}" tidak ditemukan. Pastikan rekan Anda sudah mendaftar dan memberikan kodenya.`,
      }
    }

    if (partnerProfile.id === user.id) {
      return { error: 'Anda tidak dapat memasukkan kode unik Anda sendiri.' }
    }

    // Pastikan rekan belum terdaftar di kelompok lain
    const { data: partnerExisting } = await supabase
      .from('theses')
      .select('id')
      .or(`leader_id.eq.${partnerProfile.id},member_id.eq.${partnerProfile.id}`)
      .maybeSingle()

    if (partnerExisting) {
      return {
        error: `Rekan (${partnerProfile.name}) sudah terdaftar di kelompok tugas akhir lain.`,
      }
    }

    memberId = partnerProfile.id
  }

  // Simpan pengajuan tugas akhir ke database
  const { error: insertError } = await supabase.from('theses').insert({
    leader_id: user.id,
    member_id: memberId,
    title,
    description: description || null,
    status: 'pending_mentor',
  })

  if (insertError) {
    return { error: 'Gagal mengajukan judul: ' + insertError.message }
  }

  redirect('/dashboard/student')
}

