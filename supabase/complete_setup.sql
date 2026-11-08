-- ==============================================================================
-- SIMBITA SMA NUSAPUTERA SEMARANG - MASTER DATABASE SETUP
-- Jalankan skrip ini sekaligus di SQL Editor Supabase Project Baru Anda
-- Region: Southeast Asia (Singapore)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE thesis_status AS ENUM (
        'draft',
        'pending_mentor',
        'title_approved',
        'in_progress',
        'completed',
        'rejected'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM (
        'pending',
        'needs_revision',
        'accepted'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. FUNCTION GENERATE RANDOM UNIQUE IDENTIFIER (SIS-XXXX / GUR-XXXX)
CREATE OR REPLACE FUNCTION public.generate_unique_identifier(p_role public.user_role)
RETURNS TEXT 
LANGUAGE plpgsql VOLATILE
SET search_path = public, auth
AS $$
DECLARE
    v_prefix TEXT;
    v_identifier TEXT;
    v_exists BOOLEAN;
BEGIN
    IF p_role = 'student' THEN
        v_prefix := 'SIS-';
    ELSIF p_role = 'mentor' THEN
        v_prefix := 'GUR-';
    ELSE
        v_prefix := 'ADM-';
    END IF;

    LOOP
        v_identifier := v_prefix || LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0');
        SELECT EXISTS (
            SELECT 1 FROM public.profiles WHERE identifier = v_identifier
        ) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;

    RETURN v_identifier;
END;
$$;

-- 4. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    identifier TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    class_or_dept TEXT,
    phone TEXT,
    phone_number TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_identifier ON public.profiles(identifier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 5. TRIGGER ON AUTH.USERS TO AUTOMATICALLY CREATE PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_role public.user_role;
    v_name TEXT;
    v_class_or_dept TEXT;
    v_identifier TEXT;
BEGIN
    v_role := COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role);
    v_name := COALESCE(new.raw_user_meta_data->>'name', 'Pengguna Baru');
    v_class_or_dept := new.raw_user_meta_data->>'class_or_dept';
    v_identifier := public.generate_unique_identifier(v_role);

    INSERT INTO public.profiles (id, name, identifier, role, class_or_dept, phone_number, is_active)
    VALUES (new.id, v_name, v_identifier, v_role, v_class_or_dept, null, true)
    ON CONFLICT (id) DO UPDATE 
    SET name = EXCLUDED.name,
        role = EXCLUDED.role,
        class_or_dept = EXCLUDED.class_or_dept;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. THESES TABLE
CREATE TABLE IF NOT EXISTS public.theses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status thesis_status DEFAULT 'pending_mentor',
    defense_date TIMESTAMPTZ,
    defense_location TEXT,
    examiner1_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    examiner2_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published_to_repo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_different_members CHECK (leader_id != member_id)
);

CREATE INDEX IF NOT EXISTS idx_theses_leader ON public.theses(leader_id);
CREATE INDEX IF NOT EXISTS idx_theses_member ON public.theses(member_id);
CREATE INDEX IF NOT EXISTS idx_theses_mentor ON public.theses(mentor_id);

-- 7. GUIDANCE SESSIONS (BERKAS NASKAH BAB)
CREATE TABLE IF NOT EXISTS public.guidance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    chapter TEXT NOT NULL,
    student_notes TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mentor_feedback TEXT,
    status session_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_thesis ON public.guidance_sessions(thesis_id);

-- 8. GUIDANCE JOURNALS (LOGBOOK TATAP MUKA)
CREATE TABLE IF NOT EXISTS public.guidance_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
    meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location TEXT NOT NULL,
    discussion_summary TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journals_thesis ON public.guidance_journals(thesis_id);

-- 9. MILESTONES TABLE
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    deadline_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    stage_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- 11. APP SETTINGS (FEATURE FLAGS: ON/OFF JADWAL & PENILAIAN)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('feature_defense_scheduling', 'false'::jsonb, 'Saklar On/Off Fitur Penjadwalan Sidang KTI'),
    ('feature_defense_scoring', 'false'::jsonb, 'Saklar On/Off Fitur Form & Rubrik Penilaian Sidang Online')
ON CONFLICT (key) DO NOTHING;

-- 12. DEFENSE SCORES (RUBRIK PENILAIAN BERBOBOT 30/35/35)
CREATE TABLE IF NOT EXISTS public.defense_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
    examiner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    examiner_role TEXT NOT NULL DEFAULT 'penguji',
    score_presentation NUMERIC(5,2) NOT NULL DEFAULT 0,
    score_content NUMERIC(5,2) NOT NULL DEFAULT 0,
    score_mastery NUMERIC(5,2) NOT NULL DEFAULT 0,
    final_score NUMERIC(5,2) GENERATED ALWAYS AS (
        ROUND((score_presentation * 0.3) + (score_content * 0.35) + (score_mastery * 0.35), 2)
    ) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(thesis_id, examiner_id)
);

-- 13. STORAGE BUCKET UNTUK DOKUMEN TUGAS AKHIR
INSERT INTO storage.buckets (id, name, public)
VALUES ('thesis-documents', 'thesis-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defense_scores ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles read access" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Profiles update own or admin" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Policies for theses (public read for completed in repository, authenticated for dashboard)
CREATE POLICY "Theses select access" ON public.theses
    FOR SELECT USING (
        status = 'completed' OR
        auth.uid() = leader_id OR 
        auth.uid() = member_id OR 
        auth.uid() = mentor_id OR
        auth.uid() = examiner1_id OR
        auth.uid() = examiner2_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Theses insert access" ON public.theses
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() = leader_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Theses update access" ON public.theses
    FOR UPDATE TO authenticated USING (
        auth.uid() = leader_id OR 
        auth.uid() = mentor_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Policies for guidance sessions
CREATE POLICY "Guidance sessions select" ON public.guidance_sessions
    FOR SELECT USING (true);

CREATE POLICY "Guidance sessions insert" ON public.guidance_sessions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Guidance sessions update" ON public.guidance_sessions
    FOR UPDATE TO authenticated USING (true);

-- Policies for journals
CREATE POLICY "Journals select" ON public.guidance_journals
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Journals insert" ON public.guidance_journals
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Journals update" ON public.guidance_journals
    FOR UPDATE TO authenticated USING (true);

-- Policies for milestones
CREATE POLICY "Milestones select all" ON public.milestones
    FOR SELECT USING (true);

CREATE POLICY "Milestones manage admin" ON public.milestones
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Policies for notifications
CREATE POLICY "Notifications view own" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Notifications update own" ON public.notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policies for app_settings
CREATE POLICY "Allow public read app_settings" ON public.app_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin to manage app_settings" ON public.app_settings
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

-- Policies for defense_scores
CREATE POLICY "Allow read defense_scores" ON public.defense_scores
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow mentor/admin to insert/update defense_scores" ON public.defense_scores
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('mentor', 'admin'))
    );

-- Storage policies for thesis-documents
CREATE POLICY "Allow public read thesis documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'thesis-documents');

CREATE POLICY "Allow authenticated upload thesis documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'thesis-documents');

-- 15. SEED DATA MILESTONES (JADWAL TAHAPAN TUGAS AKHIR SEKOLAH)
INSERT INTO public.milestones (title, deadline_date, description, stage_order)
VALUES 
    ('Pendaftaran Judul & Pembentukan Kelompok', NOW() + INTERVAL '14 days', 'Batas akhir pengajuan judul dan memasukkan rekan kelompok.', 1),
    ('Batas ACC Bab 1 (Pendahuluan)', NOW() + INTERVAL '45 days', 'Latar belakang, rumusan masalah, dan tujuan penelitian telah di-ACC guru.', 2),
    ('Batas ACC Bab 2 & 3 (Kajian Pustaka & Metodologi)', NOW() + INTERVAL '90 days', 'Kajian teori dan instrumen penelitian telah selesai disetujui.', 3),
    ('Batas ACC Bab 4 & 5 (Hasil & Pembahasan)', NOW() + INTERVAL '135 days', 'Pengambilan data lapangan dan analisis hasil penelitian.', 4),
    ('Batas ACC Final & Pendaftaran Sidang', NOW() + INTERVAL '160 days', 'Naskah lengkap siap uji dan kartu bimbingan telah memenuhi syarat minimal.', 5)
ON CONFLICT DO NOTHING;

