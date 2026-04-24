-- =========================================================================
-- SYSTEM STABILIZATION PATCH (Issues #1 and #2)
-- Please copy and run this entire file in your Supabase SQL Editor.
-- =========================================================================

-- 1. FIX ISSUE #2: Missing Profile Columns (Complete Profile breaking)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS university TEXT,
ADD COLUMN IF NOT EXISTS degree TEXT,
ADD COLUMN IF NOT EXISTS mobile_number TEXT;


-- 2. FIX ISSUE #1: Create Missing `direct_messages` table
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for Chat performance
CREATE INDEX IF NOT EXISTS idx_dm_participants ON direct_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_created_at ON direct_messages(created_at);

-- Enable RLS
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for direct_messages
CREATE POLICY "Users can view messages they sent or received" 
ON direct_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages as themselves" 
ON direct_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages or mark received as read"
ON direct_messages FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 4. Reload PostgREST Cache (prevents "Table not found in schema cache" error)
NOTIFY pgrst, 'reload schema';
