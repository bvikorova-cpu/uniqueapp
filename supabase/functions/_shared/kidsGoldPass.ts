// Shared helper: Kids Gold Pass is RETIRED. The Kids Channel is fully
// credit-based via the unified `ai_credits` balance and there is NO bypass —
// not even for platform admins (an admin bypass silently skipped every
// deduction and made credits look "not charged").
//
// Kept as an export so all Kids edge functions keep compiling.
export async function hasKidsGoldPass(_authHeader: string | null): Promise<boolean> {
  return false;
}
