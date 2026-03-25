-- Mural Posts table
CREATE TABLE IF NOT EXISTS mural_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  category TEXT DEFAULT 'neighbor' CHECK (category IN ('announcement', 'lost-found', 'neighbor')), -- announcement, lost-found, neighbor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mural_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view posts from their condo"
  ON mural_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.condominio_id = mural_posts.condominio_id
    )
  );

CREATE POLICY "Users can create posts in their condo"
  ON mural_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.condominio_id = condominio_id
    )
    AND auth.uid() = author_id
  );

CREATE POLICY "Users can update their own posts or increment likes"
  ON mural_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.condominio_id = mural_posts.condominio_id
    )
  )
  WITH CHECK (
    auth.uid() = author_id OR 
    -- Allow any user from same condo to update likes_count (simplified for now)
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.condominio_id = mural_posts.condominio_id
    )
  );

CREATE POLICY "Users can delete their own posts"
  ON mural_posts FOR DELETE
  USING (auth.uid() = author_id);
