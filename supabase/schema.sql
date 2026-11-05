-- ==============================================================================
-- SISTEM INFORMASI BIMBINGAN TUGAS AKHIR SISWA SMA (SIMBITA)
-- Database Schema for Supabase PostgreSQL
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM (
        'pending',
        'needs_revision',
        'accepted'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. FUNCTION TO GENERATE RANDOM UNIQUE IDENTIFIER (SIS-XXXX / GUR-XXXX)
CREATE OR REPLACE FUNCTION generate_unique_identifier(p_role user_role)
RETURNS TEXT AS $$
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
        -- Buat 4 digit angka acak (1000 - 9999)
        v_identifier := v_prefix || LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0');
        
        -- Cek apakah kode sudah pernah dipakai
        SELECT EXISTS (
            SELECT 1 FROM public.profiles WHERE identifier = v_identifier
        ) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;

    RETURN v_identifier;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 4. PROFILES TABLE (Terhubung ke Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    identifier TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    class_or_dept TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk mempercepat pencarian pasangan kelompok via kode acak
CREATE INDEX IF NOT EXISTS idx_profiles_identifier ON public.profiles(identifier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 5. TRIGGER UNTUK OTOMATIS MEMBUAT PROFIL SAAT USER DAFTAR
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role user_role;
    v_name TEXT;
    v_class_or_dept TEXT;
    v_identifier TEXT;
BEGIN
    -- Ambil metadata dari signup (default: student)
    v_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student');
    v_name := COALESCE(new.raw_user_meta_data->>'name', 'Pengguna Baru');
    v_class_or_dept := new.raw_user_meta_data->>'class_or_dept';
    
    -- Generate kode acak unik (SIS-XXXX / GUR-XXXX)
    v_identifier := generate_unique_identifier(v_role);

    INSERT INTO public.profiles (id, name, identifier, role, class_or_dept)
    VALUES (new.id, v_name, v_identifier, v_role, v_class_or_dept)
    ON CONFLICT (id) DO UPDATE 
    SET name = EXCLUDED.name,
        role = EXCLUDED.role,
        class_or_dept = EXCLUDED.class_or_dept;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. THESES TABLE (Kelompok Tugas Akhir: 2 Siswa + 1 Guru)
CREATE TABLE IF NOT EXISTS public.theses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status thesis_status DEFAULT 'pending_mentor',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_different_members CHECK (leader_id != member_id)
);

CREATE INDEX IF NOT EXISTS idx_theses_leader ON public.theses(leader_id);
CREATE INDEX IF NOT EXISTS idx_theses_member ON public.theses(member_id);
CREATE INDEX IF NOT EXISTS idx_theses_mentor ON public.theses(mentor_id);

-- 7. GUIDANCE SESSIONS TABLE (Revisi Naskah Bab & Unggah Dokumen PDF/Word)
CREATE TABLE IF NOT EXISTS public.guidance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    chapter TEXT NOT NULL,
    student_notes TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf' atau 'docx'
    mentor_feedback TEXT,
    status session_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_thesis ON public.guidance_sessions(thesis_id);

-- 8. GUIDANCE JOURNALS TABLE (Jurnal Konsultasi Tatap Muka / Logbook Offline)
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

-- 9. MILESTONES TABLE (Target Tenggat Waktu Sekolah)
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    deadline_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    stage_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE (Lonceng Notifikasi Aplikasi)
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

-- 11. STORAGE BUCKET UNTUK DOKUMEN TUGAS AKHIR
INSERT INTO storage.buckets (id, name, public)
VALUES ('thesis-documents', 'thesis-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy Profiles: Semua user terautentikasi bisa membaca profil (untuk cari partner via SIS-XXXX)
DROP POLICY IF EXISTS "Profiles read access" ON public.profiles;
CREATE POLICY "Profiles read access" ON public.profiles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
CREATE POLICY "Profiles update own" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policy Theses:
DROP POLICY IF EXISTS "Theses select access" ON public.theses;
CREATE POLICY "Theses select access" ON public.theses
    FOR SELECT TO authenticated USING (
        auth.uid() = leader_id OR 
        auth.uid() = member_id OR 
        auth.uid() = mentor_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Theses insert access" ON public.theses;
CREATE POLICY "Theses insert access" ON public.theses
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() = leader_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Theses update access" ON public.theses;
CREATE POLICY "Theses update access" ON public.theses
    FOR UPDATE TO authenticated USING (
        auth.uid() = leader_id OR 
        auth.uid() = mentor_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Policy Guidance Sessions:
DROP POLICY IF EXISTS "Guidance sessions select" ON public.guidance_sessions;
CREATE POLICY "Guidance sessions select" ON public.guidance_sessions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.theses t
            WHERE t.id = guidance_sessions.thesis_id AND (
                t.leader_id = auth.uid() OR
                t.member_id = auth.uid() OR
                t.mentor_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            )
        )
    );

DROP POLICY IF EXISTS "Guidance sessions insert" ON public.guidance_sessions;
CREATE POLICY "Guidance sessions insert" ON public.guidance_sessions
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.theses t
            WHERE t.id = guidance_sessions.thesis_id AND (
                t.leader_id = auth.uid() OR
                t.member_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            )
        )
    );

DROP POLICY IF EXISTS "Guidance sessions update" ON public.guidance_sessions;
CREATE POLICY "Guidance sessions update" ON public.guidance_sessions
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.theses t
            WHERE t.id = guidance_sessions.thesis_id AND (
                t.mentor_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            )
        )
    );

-- Policy Guidance Journals:
DROP POLICY IF EXISTS "Journals select" ON public.guidance_journals;
CREATE POLICY "Journals select" ON public.guidance_journals
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.theses t
            WHERE t.id = guidance_journals.thesis_id AND (
                t.leader_id = auth.uid() OR
                t.member_id = auth.uid() OR
                t.mentor_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            )
        )
    );

DROP POLICY IF EXISTS "Journals insert" ON public.guidance_journals;
CREATE POLICY "Journals insert" ON public.guidance_journals
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.theses t
            WHERE t.id = guidance_journals.thesis_id AND (
                t.leader_id = auth.uid() OR
                t.member_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Journals update" ON public.guidance_journals;
CREATE POLICY "Journals update" ON public.guidance_journals
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.theses t
            WHERE t.id = guidance_journals.thesis_id AND (
                t.mentor_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            )
        )
    );

-- Policy Milestones:
DROP POLICY IF EXISTS "Milestones select all" ON public.milestones;
CREATE POLICY "Milestones select all" ON public.milestones
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Milestones manage admin" ON public.milestones;
CREATE POLICY "Milestones manage admin" ON public.milestones
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Policy Notifications:
DROP POLICY IF EXISTS "Notifications view own" ON public.notifications;
CREATE POLICY "Notifications view own" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Notifications update own" ON public.notifications;
CREATE POLICY "Notifications update own" ON public.notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 13. SEED DATA MILESTONES (CONTOH JADWAL TUGAS AKHIR SMA)
INSERT INTO public.milestones (title, deadline_date, description, stage_order)
VALUES 
    ('Pendaftaran Judul & Pembentukan Kelompok', NOW() + INTERVAL '14 days', 'Batas akhir pengajuan judul dan memasukkan rekan kelompok.', 1),
    ('Batas ACC Bab 1 (Pendahuluan)', NOW() + INTERVAL '45 days', 'Latar belakang, rumusan masalah, dan tujuan penelitian telah di-ACC guru.', 2),
    ('Batas ACC Bab 2 & 3 (Kajian Pustaka & Metodologi)', NOW() + INTERVAL '90 days', 'Kajian teori dan instrumen penelitian telah selesai disetujui.', 3),
    ('Batas ACC Bab 4 & 5 (Hasil & Pembahasan)', NOW() + INTERVAL '135 days', 'Pengambilan data lapangan dan analisis hasil penelitian.', 4),
    ('Batas ACC Final & Pendaftaran Sidang', NOW() + INTERVAL '160 days', 'Naskah lengkap siap uji dan kartu bimbingan telah memenuhi syarat minimal.', 5)
ON CONFLICT DO NOTHING;

