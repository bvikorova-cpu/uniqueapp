// Legacy GoldPass hook — paid-only credit model neutralizes the premium gate.
// Each Kids module now has its own credit ledger (kids_drawing_credits,
// kids_reading_credits, kids_story_credits, etc.). The previous "Gold Pass"
// tier no longer exists; this hook always reports `false` so any old
// `if (hasGoldPass)` branches gracefully fall through.
interface GoldPassStatus {
  hasGoldPass: boolean;
  loading: boolean;
  expiresAt: string | null;
}

export function useKidsGoldPass(): GoldPassStatus {
  return { hasGoldPass: false, loading: false, expiresAt: null };
}
