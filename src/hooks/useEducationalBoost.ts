import { useMemo } from "react";
import type { Post } from "@/types/database";

interface TrendingPost extends Post {
  engagementScore: number;
  isEducational?: boolean;
  category?: string;
  source?: string;
}

// Educational boost factor (20% bonus)
const EDUCATIONAL_BOOST = 1.2;

// Keywords that indicate educational content
const EDUCATIONAL_KEYWORDS = [
  // Science
  'science', 'experiment', 'research', 'study', 'discovery', 'laboratory',
  'hypothesis', 'theory', 'physics', 'chemistry', 'biology', 'mathematics',
  // Learning
  'learn', 'education', 'tutorial', 'how to', 'guide', 'course', 'lesson',
  'teaching', 'training', 'workshop', 'webinar',
  // Academic
  'university', 'school', 'academic', 'professor', 'lecture', 'thesis',
  'dissertation', 'paper', 'journal', 'publication',
  // Technology
  'coding', 'programming', 'technology', 'engineering', 'innovation',
  'development', 'algorithm', 'data', 'analysis',
  // General knowledge
  'facts', 'history', 'geography', 'economics', 'psychology', 'philosophy',
  'astronomy', 'ecology', 'environment', 'climate',
];

// Source patterns that indicate science lab or educational origin
const EDUCATIONAL_SOURCES = [
  '/science-lab',
  '/education',
  '/learning',
  '/courses',
  '/tutorial',
  '/research',
];

/**
 * Determines if a post is educational based on content analysis
 */
export const isEducationalContent = (post: Post): boolean => {
  const content = (post.content || '').toLowerCase();
  
  // Check for educational keywords
  const hasEducationalKeywords = EDUCATIONAL_KEYWORDS.some(keyword => 
    content.includes(keyword.toLowerCase())
  );
  
  // Check for educational hashtags
  const hasEducationalHashtags = 
    content.includes('#education') ||
    content.includes('#learning') ||
    content.includes('#science') ||
    content.includes('#tutorial') ||
    content.includes('#howto') ||
    content.includes('#research');
  
  // Check for scientific patterns (formulas, citations, etc.)
  const hasScientificPatterns = 
    /\b\d+(\.\d+)?%\b/.test(content) || // Percentages
    /\[\d+\]/.test(content) || // Citations
    /\b(fig|table|chart|graph)\.\s*\d+/i.test(content); // Figure references
  
  return hasEducationalKeywords || hasEducationalHashtags || hasScientificPatterns;
};

/**
 * Checks if a post originates from an educational source
 */
export const isFromEducationalSource = (source?: string): boolean => {
  if (!source) return false;
  return EDUCATIONAL_SOURCES.some(eduSource => 
    source.toLowerCase().includes(eduSource)
  );
};

/**
 * Calculates the engagement score with educational boost
 * Formula: (Likes × 1 + Comments × 2 + Shares × 3 + Reposts × 2) × boost
 */
export const calculateEngagementScore = (
  post: Post,
  applyEducationalBoost = true
): { score: number; isEducational: boolean; boostApplied: boolean } => {
  const baseScore = 
    (post.likes_count || 0) * 1 +
    (post.comments_count || 0) * 2 +
    (post.shares_count || 0) * 3 +
    (post.reposts_count || 0) * 2;
  
  const isEducational = isEducationalContent(post);
  const boostApplied = applyEducationalBoost && isEducational;
  const score = boostApplied ? baseScore * EDUCATIONAL_BOOST : baseScore;
  
  return { score, isEducational, boostApplied };
};

/**
 * Hook to apply educational boost to trending posts
 */
export const useEducationalBoost = (posts: Post[]): TrendingPost[] => {
  return useMemo(() => {
    return posts.map(post => {
      const { score, isEducational, boostApplied } = calculateEngagementScore(post);
      
      return {
        ...post,
        engagementScore: score,
        isEducational,
        boostApplied,
      } as TrendingPost;
    }).sort((a, b) => b.engagementScore - a.engagementScore);
  }, [posts]);
};

/**
 * Hook to get educational stats for analytics
 */
export const useEducationalStats = (posts: Post[]) => {
  return useMemo(() => {
    const educationalPosts = posts.filter(isEducationalContent);
    const totalPosts = posts.length;
    const educationalCount = educationalPosts.length;
    const educationalPercentage = totalPosts > 0 
      ? (educationalCount / totalPosts) * 100 
      : 0;
    
    const totalBoostApplied = educationalPosts.reduce((acc, post) => {
      const { score } = calculateEngagementScore(post, true);
      const baseScore = calculateEngagementScore(post, false).score;
      return acc + (score - baseScore);
    }, 0);
    
    return {
      educationalCount,
      totalPosts,
      educationalPercentage: educationalPercentage.toFixed(1),
      totalBoostApplied: totalBoostApplied.toFixed(0),
    };
  }, [posts]);
};
