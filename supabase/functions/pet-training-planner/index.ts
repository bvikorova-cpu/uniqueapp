import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { servePetAiTool } from "../_shared/virtualPetAI.ts";

serve(servePetAiTool({
  tool: "pet-training-planner",
  cost: 5,
  system: "You are a virtual pet training strategist. Answer in clear Markdown with a concrete schedule.",
  buildPrompt: (p) => `Create an optimized training schedule for this virtual pet.

Data: ${JSON.stringify(p)}

Provide:
1. **Goal Assessment**
2. **Daily Schedule** (time blocks: training, mini-games, rest, feeding)
3. **Weekly Plan** (day 1-7 focus)
4. **XP Optimization Tips** (fastest level-up route)
5. **Stat Balance Warnings** (avoid burnout / hunger crashes)
6. **Milestones & Rewards**`,
}));
