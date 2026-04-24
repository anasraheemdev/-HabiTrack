-- =========================================================================
-- HabiTrack AI - SYSTEM STABILIZATION PATCH V2 (Full Architecture Sync)
-- =========================================================================
-- The Next.js frontend has evolved significantly beyond the initial schema.sql.
-- The frontend relies extensively on "habit_templates", "salik_habit_assignments",
-- "chilla_records", "murabbi_report_notes", and "system_settings".
-- Please execute this ENTIRE block in the Supabase SQL Editor.

-- 1. Create missing System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reminder_time TIME DEFAULT '20:00',
    murrabi_alert_time TIME DEFAULT '21:00',
    performance_threshold NUMERIC(5,2) DEFAULT 65.0,
    consecutive_miss_threshold INTEGER DEFAULT 3,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Initialize settings if not exists
INSERT INTO system_settings (reminder_time) 
SELECT '20:00' WHERE NOT EXISTS (SELECT 1 FROM system_settings);


-- 2. Create Habit Templates (Frontend uses this instead of task_templates)
CREATE TABLE IF NOT EXISTS habit_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    input_type TEXT NOT NULL,
    count_options JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    murabbi_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. Create Habit Assignments for Saliks
CREATE TABLE IF NOT EXISTS salik_habit_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salik_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habit_templates(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(salik_id, habit_id)
);


-- 4. Create Chilla Records (Frontend uses this instead of chilla_summaries)
CREATE TABLE IF NOT EXISTS chilla_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salik_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    murabbi_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    chilla_number INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_submissions INTEGER DEFAULT 0,
    average_performance NUMERIC(5,2) DEFAULT 0,
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. Create Murrabi Report Notes (For private feedback on daily reports)
CREATE TABLE IF NOT EXISTS murabbi_report_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
    murabbi_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_id, murabbi_id)
);


-- 6. Modify Report Items to align with frontend types
-- We drop existing items because their schema is completely invalid for the new React App
TRUNCATE TABLE report_items;

-- Drop old columns that frontend no longer sends
ALTER TABLE report_items DROP COLUMN IF EXISTS template_id CASCADE;
ALTER TABLE report_items DROP COLUMN IF EXISTS is_completed CASCADE;
ALTER TABLE report_items DROP COLUMN IF EXISTS numeric_value CASCADE;

-- Add correct columns
ALTER TABLE report_items ADD COLUMN IF NOT EXISTS habit_id UUID REFERENCES habit_templates(id) ON DELETE CASCADE;
ALTER TABLE report_items ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unanswered';
ALTER TABLE report_items ADD COLUMN IF NOT EXISTS input_value JSONB;


-- 7. Add RLS Policies so the frontend can interact with these tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE salik_habit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chilla_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE murabbi_report_notes ENABLE ROW LEVEL SECURITY;

-- Settings Policies (Admins update, all read)
CREATE POLICY "system_settings_select" ON system_settings FOR SELECT USING (true);
CREATE POLICY "system_settings_update" ON system_settings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Habit Templates Policies (Murabbis manage, Saliks view)
CREATE POLICY "habit_templates_select" ON habit_templates FOR SELECT USING (true);
CREATE POLICY "habit_templates_insert" ON habit_templates FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'murabbi' OR role = 'admin'))
);
CREATE POLICY "habit_templates_update" ON habit_templates FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'murabbi' OR role = 'admin'))
);
CREATE POLICY "habit_templates_delete" ON habit_templates FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'murabbi' OR role = 'admin'))
);

-- Assignments Policies
CREATE POLICY "habit_assignments_select" ON salik_habit_assignments FOR SELECT USING (
    auth.uid() = salik_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'murabbi'))
);
CREATE POLICY "habit_assignments_insert" ON salik_habit_assignments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'murabbi'))
);
CREATE POLICY "habit_assignments_update" ON salik_habit_assignments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'murabbi'))
);

-- Chilla Records Policies
CREATE POLICY "chilla_records_select" ON chilla_records FOR SELECT USING (
    auth.uid() = salik_id OR auth.uid() = murabbi_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "chilla_records_insert" ON chilla_records FOR INSERT WITH CHECK (true);
CREATE POLICY "chilla_records_update" ON chilla_records FOR UPDATE USING (true);


-- Murabbi Notes Policies
CREATE POLICY "murabbi_notes_select" ON murabbi_report_notes FOR SELECT USING (
    auth.uid() = murabbi_id OR
    EXISTS (SELECT 1 FROM daily_reports WHERE id = report_id AND salik_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "murabbi_notes_insert" ON murabbi_report_notes FOR INSERT WITH CHECK (
    auth.uid() = murabbi_id
);
CREATE POLICY "murabbi_notes_update" ON murabbi_report_notes FOR UPDATE USING (
    auth.uid() = murabbi_id
);

-- Note: Ensure you have already executed the V1 patch as well (creating direct_messages and altering profiles).
-- Run: NOTIFY pgrst, 'reload schema'; to rebuild cache.
NOTIFY pgrst, 'reload schema';
