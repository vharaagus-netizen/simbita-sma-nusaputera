-- ==============================================================================
-- SIMBITA SMA NUSAPUTERA - FITUR TAMBAHAN
-- 1. Pengaturan Fitur (Feature Flags: On/Off Jadwal Sidang & Penilaian)
-- 2. Kolom Penjadwalan Sidang pada tabel theses
-- 3. Tabel Penilaian / Rubrik Nilai Sidang (defense_scores)
-- 4. Kolom No HP / WhatsApp pada profiles
-- ==============================================================================

-- 1. TABEL PENGATURAN APLIKASI (FEATURE FLAGS)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Masukkan pengaturan awal (Default: OFF / false untuk jadwal sidang dan rubrik nilai)
INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('feature_defense_scheduling', 'false'::jsonb, 'Saklar On/Off Fitur Penjadwalan Sidang KTI'),
    ('feature_defense_scoring', 'false'::jsonb, 'Saklar On/Off Fitur Form & Rubrik Penilaian Sidang Online')
ON CONFLICT (key) DO NOTHING;

-- 2. TAMBAH KOLOM JADWAL SIDANG PADA TABEL THESES (JIKA BELUM ADA)
ALTER TABLE public.theses
    ADD COLUMN IF NOT EXISTS defense_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS defense_location TEXT,
    ADD COLUMN IF NOT EXISTS examiner1_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS examiner2_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_published_to_repo BOOLEAN DEFAULT TRUE;

-- 3. TAMBAH KOLOM NO HP / WHATSAPP PADA PROFILES (UNTUK TEMPLATE WA CEPAT)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 4. TABEL RUBRIK & FORM PENILAIAN SIDANG
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

-- 5. RLS POLICIES FOR NEW TABLES
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defense_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow public read app_settings" ON public.app_settings
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow admin to manage app_settings" ON public.app_settings
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated read defense_scores" ON public.defense_scores
        FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow mentor/admin to insert/update defense_scores" ON public.defense_scores
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() AND profiles.role IN ('mentor', 'admin')
            )
        );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
