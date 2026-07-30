import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { servePetAiTool } from "../_shared/virtualPetAI.ts";

serve(servePetAiTool({
  tool: "pet-battle-strategy",
  cost: 4,
  system: "You are an elite virtual pet battle tactician. Answer in clear Markdown, concrete and actionable.",
  buildPrompt: (p) => `Design an optimal battle strategy for this team.

Team: ${JSON.stringify(p.pets || [])}

Provide:
1. **Team Assessment** (strengths & weaknesses)
2. **Optimal Formation / Lead Order**
3. **Round-by-Round Tactics** (opening, mid, finisher)
4. **Best Matchups & Counters**
5. **Pre-Battle Prep** (stats to raise, items to equip)
6. **Estimated Win Rate** with the key risk`,
}));
