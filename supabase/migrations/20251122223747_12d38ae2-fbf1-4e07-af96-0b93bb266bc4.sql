-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  caption TEXT,
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active stories"
  ON stories FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Users can create stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- Story Views
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story owners view story views"
  ON story_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users add story views"
  ON story_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  cover_image TEXT,
  is_public BOOLEAN DEFAULT true,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View public events"
  ON events FOR SELECT
  USING (is_public = true);

CREATE POLICY "Create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Update own events"
  ON events FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Delete own events"
  ON events FOR DELETE
  USING (auth.uid() = creator_id);

-- Event Attendees
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'going',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View event attendees"
  ON event_attendees FOR SELECT
  USING (true);

CREATE POLICY "Join events"
  ON event_attendees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update attendance"
  ON event_attendees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Leave events"
  ON event_attendees FOR DELETE
  USING (auth.uid() = user_id);

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  creator_id UUID NOT NULL,
  is_private BOOLEAN DEFAULT false,
  members_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group Members (create first before policies that reference it)
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Now add RLS for groups
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View public or member groups"
  ON groups FOR SELECT
  USING (is_private = false OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
  ));

CREATE POLICY "Create groups policy"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group admins update groups"
  ON groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('admin', 'moderator')
    )
  );

-- RLS for group_members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View group members list"
  ON group_members FOR SELECT
  USING (true);

CREATE POLICY "Join public groups policy"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leave groups policy"
  ON group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Photo Albums
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_photo TEXT,
  is_public BOOLEAN DEFAULT true,
  photos_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View public or own albums"
  ON photo_albums FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Create own albums"
  ON photo_albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own albums policy"
  ON photo_albums FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own albums policy"
  ON photo_albums FOR DELETE
  USING (auth.uid() = user_id);

-- Album Photos
CREATE TABLE IF NOT EXISTS album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View public album photos policy"
  ON album_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM photo_albums
      WHERE photo_albums.id = album_id
      AND (photo_albums.is_public = true OR photo_albums.user_id = auth.uid())
    )
  );

CREATE POLICY "Album owners add photos"
  ON album_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM photo_albums
      WHERE photo_albums.id = album_id
      AND photo_albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Album owners delete photos policy"
  ON album_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM photo_albums
      WHERE photo_albums.id = album_id
      AND photo_albums.user_id = auth.uid()
    )
  );

-- User Badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View user badges policy"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "System creates badges"
  ON user_badges FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_user ON photo_albums(user_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_album ON album_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);