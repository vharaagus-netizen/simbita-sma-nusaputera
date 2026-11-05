'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGuidanceJournal(formData: FormData) {
  const thesisId = formData.get('thesis_id') as string
  const meetingDate = formData.get('meeting_date') as string
  const location = formData.get('location') as string
  const discussionSummary = formData.get('discussion_summary') as string

  if (!thesisId || !meetingDate || !location || !discussionSummary) {
    return { error: 'Semua kolom wajib diisi.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sesi login telah berakhir.' }
  }

  const { error: insertError } = await supabase.from('guidance_journals').insert({
    thesis_id: thesisId,
    meeting_date: meetingDate,
    location,
    discussion_summary: discussionSummary,
    is_verified: false,
  })

  if (insertError) {
    return { error: 'Gagal mencatat jurnal: ' + insertError.message }
  }

  revalidatePath('/dashboard/student/journal')
  return { success: true }
}

