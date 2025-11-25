/**
 * Credit system types for various features
 */

export interface AstrologyCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  total_credits_purchased: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyzerCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  total_credits_purchased: number;
  tier: string;
  tier_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IQCredits {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface BrainDuelCredits {
  id: string;
  user_id: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface AntiqueCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  total_credits_purchased: number;
  created_at: string | null;
  updated_at: string | null;
}
