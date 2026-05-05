/**
 * Battle-style power computation for sport match simulators.
 * Mirrors the battles section vibe (Shadow Arena / Character Battle):
 * combines player ratings, team form, score outcome and a small RNG roll.
 */
export function computeBattlePower(
  players: { overall_rating?: number | null }[] | null | undefined,
  team: { wins?: number | null; losses?: number | null; playstyle?: string | null } | null,
  score: number
): number {
  const rosterAvg =
    players && players.length > 0
      ? players.reduce((s, p) => s + (p.overall_rating || 70), 0) / players.length
      : 70;
  const wins = team?.wins ?? 0;
  const losses = team?.losses ?? 0;
  const form = wins - losses; // can be negative
  const styleBonus = team?.playstyle ? 5 : 0;
  const roll = Math.floor(Math.random() * 15);
  return Math.max(
    1,
    Math.round(rosterAvg * 5 + form * 3 + score * 4 + styleBonus + roll)
  );
}

export function opponentPower(score: number): number {
  // Opponent roster is unknown — synthesize from score + roll
  return Math.max(1, Math.round(70 * 5 + score * 4 + Math.floor(Math.random() * 25)));
}
