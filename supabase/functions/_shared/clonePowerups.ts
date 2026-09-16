// Catalog of purchasable Clone Battle power-ups. Prices are in AI credits.
export interface ClonePowerup {
  key: string;
  name: string;
  cost: number;
  scoreBonus: number;
  extraRounds: number;
  promptHint: string;
}

export const CLONE_POWERUPS: ClonePowerup[] = [
  {
    key: "sharp_wit",
    name: "Sharp Wit",
    cost: 2,
    scoreBonus: 6,
    extraRounds: 0,
    promptHint: "Clone A lands sharper, funnier punchlines than Clone B.",
  },
  {
    key: "silver_tongue",
    name: "Silver Tongue",
    cost: 4,
    scoreBonus: 12,
    extraRounds: 0,
    promptHint: "Clone A argues with persuasive, charismatic rhetoric that clearly impresses the judge.",
  },
  {
    key: "iron_logic",
    name: "Iron Logic",
    cost: 4,
    scoreBonus: 12,
    extraRounds: 0,
    promptHint: "Clone A uses airtight logic and concrete examples, exposing weak points in Clone B's reasoning.",
  },
  {
    key: "extra_round",
    name: "Extra Round",
    cost: 3,
    scoreBonus: 4,
    extraRounds: 1,
    promptHint: "The duel runs one additional round in which Clone A pushes for the finish.",
  },
  {
    key: "judge_favor",
    name: "Judge's Favor",
    cost: 6,
    scoreBonus: 18,
    extraRounds: 0,
    promptHint: "The judge is visibly impressed by Clone A's style and says so in the verdict.",
  },
];

export const MAX_POWERUPS_PER_BATTLE = 2;

export const findPowerup = (key: string) => CLONE_POWERUPS.find((p) => p.key === key);
