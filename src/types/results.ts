/**
 * Result types for various AI-powered features
 */

// Astrology Results
export interface TarotResult {
  cards: Array<{
    name: string;
    meaning: string;
    position: string;
  }>;
  interpretation: string;
}

export interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  interpretation: string;
}

export interface PalmistryResult {
  lines: {
    heart: string;
    head: string;
    life: string;
  };
  interpretation: string;
}

export interface DreamInterpretation {
  symbols: string[];
  interpretation: string;
  emotions: string[];
}

export interface RuneReading {
  rune: string;
  meaning: string;
  advice: string;
}

export interface YesNoOracleResult {
  answer: 'yes' | 'no' | 'maybe';
  explanation: string;
}

export interface BirthChartResult {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: Record<string, string>;
  interpretation: string;
}

export interface CompatibilityResult {
  score: number;
  strengths: string[];
  challenges: string[];
  advice: string;
}

// Beauty Results
export interface BeautyTutorial {
  steps: Array<{
    title: string;
    description: string;
    products?: string[];
  }>;
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: string;
}

export interface ProductRecommendation {
  name: string;
  category: string;
  reason: string;
  price?: string;
  link?: string;
}

// Cooking Results
export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
}

export interface MealPlan {
  days: Array<{
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string[];
  }>;
}

export interface WinePairing {
  wine: string;
  type: string;
  notes: string;
  servingTemp: string;
}

export interface FoodScanResult {
  food: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients?: string[];
}

// DNA Results
export interface DNAAnalysis {
  ancestry: Record<string, number>;
  traits: string[];
  healthRisks: Array<{
    condition: string;
    risk: 'low' | 'medium' | 'high';
  }>;
}

export interface GeneticMatch {
  userId: string;
  compatibility: number;
  sharedTraits: string[];
  complementaryTraits: string[];
}

// Character Battle
export interface BattleResult {
  winner: string;
  winnerPower: number;
  loserPower: number;
  description: string;
}

// Capsule Wardrobe
export interface CapsuleWardrobeResult {
  items: Array<{
    type: string;
    description: string;
    color: string;
    occasions: string[];
  }>;
  outfitCombinations: Array<{
    name: string;
    items: string[];
  }>;
}
