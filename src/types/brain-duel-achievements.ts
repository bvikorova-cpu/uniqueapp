import { Trophy, Flame, Target, Crown, Zap, Shield, Star, TrendingUp, Users, Award } from "lucide-react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const FRIEND_CHALLENGE_ACHIEVEMENTS: Record<string, Achievement> = { first_victory: {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first friend challenge',
    icon: Trophy,
    color: 'text-yellow-500',
    rarity: 'common' },
  undefeated_streak_5: { id: 'undefeated_streak_5',
    name: 'Undefeated Streak',
    description: 'Win 5 friend challenges in a row',
    icon: Flame,
    color: 'text-orange-500',
    rarity: 'rare' },
  perfect_score: { id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Win a match with 100% accuracy',
    icon: Target,
    color: 'text-cyan-500',
    rarity: 'epic' },
  comeback_king: { id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win after being 3+ points behind',
    icon: TrendingUp,
    color: 'text-green-500',
    rarity: 'rare' },
  champion: { id: 'champion',
    name: 'Champion',
    description: 'Win 50 friend challenges',
    icon: Crown,
    color: 'text-purple-500',
    rarity: 'legendary' },
  speed_demon: { id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win with average answer time under 5 seconds',
    icon: Zap,
    color: 'text-yellow-400',
    rarity: 'epic' },
  rivalry_master: { id: 'rivalry_master',
    name: 'Rivalry Master',
    description: 'Play 10+ games against the same friend',
    icon: Users,
    color: 'text-blue-500',
    rarity: 'rare' },
  unbeatable: { id: 'unbeatable',
    name: 'Unbeatable',
    description: 'Win 10 friend challenges in a row',
    icon: Shield,
    color: 'text-red-500',
    rarity: 'legendary' },
  credit_collector: { id: 'credit_collector',
    name: 'Credit Collector',
    description: 'Win 1000+ total credits from friends',
    icon: Star,
    color: 'text-amber-400',
    rarity: 'epic' },
  perfect_week: { id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Win every match played in a week',
    icon: Award,
    color: 'text-pink-500',
    rarity: 'legendary' } };

export const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'border-gray-400 bg-gray-400/10';
    case 'rare':
      return 'border-blue-500 bg-blue-500/10';
    case 'epic':
      return 'border-purple-500 bg-purple-500/10';
    case 'legendary':
      return 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20';
    default:
      return 'border-gray-400 bg-gray-400/10';
  }
};
