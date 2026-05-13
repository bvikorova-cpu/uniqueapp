/**
 * Robust TypeScript types for main database entities
 * Generated for Supabase tables: profiles, posts
 */

// ==================== PROFILES (Users) ====================

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  birth_date: string | null;
  gender: string | null;
  privacy_settings: ProfilePrivacySettings | null;
  notification_settings: NotificationSettings | null;
  created_at: string;
  updated_at: string;
}

export interface ProfilePrivacySettings {
  show_email?: boolean;
  show_phone?: boolean;
  show_birth_date?: boolean;
  show_location?: boolean;
  profile_visibility?: 'public' | 'friends' | 'private';
}

export interface NotificationSettings {
  email_notifications?: boolean;
  push_notifications?: boolean;
  post_likes?: boolean;
  post_comments?: boolean;
  friend_requests?: boolean;
  messages?: boolean;
}

// Simplified profile (for nested queries)
export interface ProfileBasic {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// ==================== POSTS ====================

export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reposts_count: number;
  feeling?: string | null;
  location?: string | null;
  group_id?: string | null;
  page_id?: string | null;
  event_id?: string | null;
  visibility?: PostVisibility;
  is_pinned?: boolean;
  is_archived?: boolean;
  is_sensitive?: boolean;
  sensitive_reason?: string | null;
  
  // Relations - optional for database queries
  profiles?: ProfileBasic;
  media?: PostMedia[];
  likes?: PostLike[];
  comments?: Comment[];
}

export type PostVisibility = 'public' | 'friends' | 'private' | 'custom';

export interface PostMedia {
  id: string;
  post_id?: string;
  file_url: string;
  file_type: string;
  file_name?: string;
  thumbnail_url?: string | null;
  duration?: number | null;
  created_at?: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  profiles?: ProfileBasic;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: ProfileBasic;
  replies?: Comment[];
}

// ==================== REPOSTS ====================

export interface Repost {
  id: string;
  user_id: string;
  post_id?: string;
  comment: string;
  created_at: string;
  profiles?: ProfileBasic;
  original_post?: Post;
}

// ==================== FEED ITEMS ====================

export type FeedItem = 
  | { type: 'post'; data: Post }
  | { type: 'repost'; data: Repost };

// ==================== GROUPS ====================

export interface Group {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_by: string;
  privacy: 'public' | 'private' | 'secret';
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  profiles?: ProfileBasic;
}

// ==================== PAGES ====================

export interface Page {
  id: string;
  name: string;
  description: string | null;
  category: string;
  cover_image_url: string | null;
  profile_image_url: string | null;
  created_by: string;
  follower_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageFollower {
  id: string;
  page_id: string;
  user_id: string;
  followed_at: string;
  profiles?: ProfileBasic;
}

// ==================== EVENTS ====================

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  cover_image_url: string | null;
  created_by: string;
  attendee_count: number;
  privacy: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'interested' | 'not_going';
  responded_at: string;
  profiles?: ProfileBasic;
}

// ==================== UTILITY TYPES ====================

// For Supabase queries with missing types
export type SupabaseQuery<T> = T;

// Helper pre nullable fields
export type Nullable<T> = T | null;

// Helper pre partial updates
export type PartialUpdate<T> = Partial<T>;
