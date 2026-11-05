export type UserRole = 'student' | 'mentor' | 'admin'

export type ThesisStatus =
  | 'draft'
  | 'pending_mentor'
  | 'title_approved'
  | 'in_progress'
  | 'completed'
  | 'rejected'

export type SessionStatus = 'pending' | 'needs_revision' | 'accepted'

export interface Profile {
  id: string
  name: string
  identifier: string // SIS-XXXX atau GUR-XXXX
  role: UserRole
  class_or_dept: string | null
  phone: string | null
  phone_number?: string | null
  created_at: string
  updated_at: string
}

export interface Thesis {
  id: string
  leader_id: string
  member_id: string | null
  mentor_id: string | null
  title: string
  description: string | null
  status: ThesisStatus
  defense_date?: string | null
  defense_location?: string | null
  examiner1_id?: string | null
  examiner2_id?: string | null
  is_published_to_repo?: boolean
  created_at: string
  updated_at: string
  leader?: Profile
  member?: Profile
  mentor?: Profile
  examiner1?: Profile
  examiner2?: Profile
  scores?: DefenseScore[]
}

export interface GuidanceSession {
  id: string
  thesis_id: string
  submitted_by: string
  chapter: string
  student_notes: string | null
  file_url: string
  file_name: string
  file_type: 'pdf' | 'docx'
  mentor_feedback: string | null
  status: SessionStatus
  created_at: string
  reviewed_at: string | null
  submitter?: Profile
}

export interface GuidanceJournal {
  id: string
  thesis_id: string
  meeting_date: string
  location: string
  discussion_summary: string
  is_verified: boolean
  verified_at: string | null
  created_at: string
}

export interface Milestone {
  id: string
  title: string
  deadline_date: string
  description: string | null
  stage_order: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  link_url: string | null
  is_read: boolean
  created_at: string
}

export interface AppSetting {
  key: string
  value: any
  description: string | null
  updated_at: string
}

export interface DefenseScore {
  id: string
  thesis_id: string
  examiner_id: string
  examiner_role: 'pembimbing' | 'penguji1' | 'penguji2' | string
  score_presentation: number
  score_content: number
  score_mastery: number
  final_score: number
  notes: string | null
  created_at: string
  updated_at: string
  examiner?: Profile
}
