/**
 * Entity types for collectibles, trades, and other complex data structures
 */

export interface Collectible {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rarity: string;
  category: string;
  quantity: number;
  is_tradeable: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  from_user_id: string;
  to_user_id: string;
  from_items: string[];
  to_items: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  collectible_id: string;
  price: number;
  status: 'active' | 'sold' | 'cancelled';
  created_at: string;
}

export interface Auction {
  id: string;
  seller_id: string;
  collectible_id: string;
  starting_bid: number;
  current_bid: number;
  highest_bidder_id: string | null;
  ends_at: string;
  status: 'active' | 'ended' | 'cancelled';
  created_at: string;
}

export interface MysteryBox {
  id: string;
  name: string;
  description: string;
  price: number;
  possible_rewards: string[];
  rarity_weights: Record<string, number>;
}

export interface EmotionPost {
  id: string;
  user_id: string;
  emotion: string;
  intensity: number;
  description: string | null;
  created_at: string;
}

export interface EmotionListing {
  id: string;
  seller_id: string;
  emotion: string;
  intensity: number;
  price: number;
  status: 'available' | 'sold';
  created_at: string;
}

export interface DreamJournal {
  id: string;
  user_id: string;
  title: string;
  content: string;
  emotions: string[];
  symbols: string[];
  interpretation: string | null;
  created_at: string;
}

export interface DreamTrends {
  commonSymbols: Array<{ symbol: string; count: number }>;
  emotionDistribution: Record<string, number>;
  frequentThemes: string[];
}

export interface EscapeRoom {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number;
  max_players: number;
  created_by: string;
  created_at: string;
}

export interface Puzzle {
  id: string;
  room_id: string;
  puzzle_type: string;
  question: string;
  answer: string;
  hints: string[];
  order: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  earned_at?: string;
}

export interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  target_id: string | null;
  target_type: string | null;
  metadata: unknown;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_reward: number | null;
  requirement_type: string;
  requirement_value: number;
  created_at: string | null;
  earned_at?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}
