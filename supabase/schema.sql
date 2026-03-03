-- ════════════════════════════════════════════════════════════════════
-- HabiTrack AI – Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database.
-- ════════════════════════════════════════════════════════════════════

-- ── Enable UUID Extension ──
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enum Types ──
CREATE TYPE user_role AS ENUM ('admin', 'murabbi', 'salik');
CREATE TYPE task_category AS ENUM (
  'faraiz', 'nawafil', 'tasbeeh', 'tilawat',
  'habit_tracking', 'prohibitions', 'study', 'sleep_tracking'
);
CREATE TYPE notification_type AS ENUM ('reminder', 'alert', 'motivational', 'system');

-- ════════════════════════════════════════════════════════════════════
-- PROFILES TABLE
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'salik',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ════════════════════════════════════════════════════════════════════
-- SALIK–MURABBI MAPPING
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE salik_murabbi_map (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salik_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  murabbi_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(salik_id, murabbi_id)
);

CREATE INDEX idx_map_salik ON salik_murabbi_map(salik_id);
CREATE INDEX idx_map_murabbi ON salik_murabbi_map(murabbi_id);
CREATE INDEX idx_map_active ON salik_murabbi_map(is_active);

-- ════════════════════════════════════════════════════════════════════
-- TASK TEMPLATES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  murabbi_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category task_category NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  has_numeric_input BOOLEAN DEFAULT FALSE,
  numeric_label TEXT,
  weight NUMERIC(3,1) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_murabbi ON task_templates(murabbi_id);
CREATE INDEX idx_templates_category ON task_templates(category);
CREATE INDEX idx_templates_active ON task_templates(is_active);

-- ════════════════════════════════════════════════════════════════════
-- DAILY REPORTS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salik_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(salik_id, report_date)
);

CREATE INDEX idx_reports_salik ON daily_reports(salik_id);
CREATE INDEX idx_reports_date ON daily_reports(report_date);
CREATE INDEX idx_reports_salik_date ON daily_reports(salik_id, report_date);

-- ════════════════════════════════════════════════════════════════════
-- REPORT ITEMS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE report_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  numeric_value NUMERIC(10,2)
);

CREATE INDEX idx_items_report ON report_items(report_id);
CREATE INDEX idx_items_template ON report_items(template_id);

-- ════════════════════════════════════════════════════════════════════
-- AI CONVERSATIONS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_created ON ai_conversations(created_at);

-- ════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read);

-- ════════════════════════════════════════════════════════════════════
-- ACTIVITY LOGS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_created ON activity_logs(created_at DESC);

-- ════════════════════════════════════════════════════════════════════
-- CHILLA (40-DAY) SUMMARIES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE chilla_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salik_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  murabbi_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_submissions INTEGER DEFAULT 0,
  average_performance NUMERIC(5,2) DEFAULT 0,
  most_missed_task TEXT,
  streak_record INTEGER DEFAULT 0,
  ai_summary TEXT,
  murabbi_notes TEXT,
  is_finalized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chilla_salik ON chilla_summaries(salik_id);
CREATE INDEX idx_chilla_murabbi ON chilla_summaries(murabbi_id);

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salik_murabbi_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chilla_summaries ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);

-- Salik-Murabbi Map: viewable by involved parties and admins
CREATE POLICY "map_select" ON salik_murabbi_map FOR SELECT USING (
  auth.uid() = salik_id OR
  auth.uid() = murabbi_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "map_insert" ON salik_murabbi_map FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "map_update" ON salik_murabbi_map FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Task Templates: murabbi manages own, saliks can view their murabbi's
CREATE POLICY "templates_select" ON task_templates FOR SELECT USING (true);
CREATE POLICY "templates_insert" ON task_templates FOR INSERT WITH CHECK (
  auth.uid() = murabbi_id
);
CREATE POLICY "templates_update" ON task_templates FOR UPDATE USING (
  auth.uid() = murabbi_id
);
CREATE POLICY "templates_delete" ON task_templates FOR DELETE USING (
  auth.uid() = murabbi_id
);

-- Daily Reports: salik manages own, murabbi can view assigned
CREATE POLICY "reports_select" ON daily_reports FOR SELECT USING (
  auth.uid() = salik_id OR
  EXISTS (
    SELECT 1 FROM salik_murabbi_map
    WHERE salik_id = daily_reports.salik_id
    AND murabbi_id = auth.uid()
    AND is_active = true
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "reports_insert" ON daily_reports FOR INSERT WITH CHECK (
  auth.uid() = salik_id
);

-- Report Items: follow parent report access
CREATE POLICY "items_select" ON report_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM daily_reports
    WHERE daily_reports.id = report_items.report_id
    AND (
      daily_reports.salik_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM salik_murabbi_map
        WHERE salik_id = daily_reports.salik_id
        AND murabbi_id = auth.uid()
        AND is_active = true
      ) OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "items_insert" ON report_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM daily_reports
    WHERE daily_reports.id = report_items.report_id
    AND daily_reports.salik_id = auth.uid()
  )
);

-- AI Conversations: only own
CREATE POLICY "ai_select" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_insert" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: only own
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);

-- Activity Logs: admins can read all, others own
CREATE POLICY "logs_select" ON activity_logs FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "logs_insert" ON activity_logs FOR INSERT WITH CHECK (true);

-- Chilla Summaries: involved parties and admins
CREATE POLICY "chilla_select" ON chilla_summaries FOR SELECT USING (
  auth.uid() = salik_id OR
  auth.uid() = murabbi_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "chilla_insert" ON chilla_summaries FOR INSERT WITH CHECK (
  auth.uid() = murabbi_id
);
CREATE POLICY "chilla_update" ON chilla_summaries FOR UPDATE USING (
  auth.uid() = murabbi_id
);

-- ════════════════════════════════════════════════════════════════════
-- TRIGGER: Auto-update updated_at timestamp
-- ════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_templates
  BEFORE UPDATE ON task_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_chilla
  BEFORE UPDATE ON chilla_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- TRIGGER: Auto-create profile on auth signup
-- ════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'salik')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
