import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { servePetAiTool } from "../_shared/virtualPetAI.ts";

serve(servePetAiTool({
  tool: "pet-compatibility-checker",
  cost: 6,
  system: "You are a virtual pet compatibility analyst. Answer in clear Markdown.",
  buildPrompt: (p) => `Analyze compatibility between these two virtual pets.

Data: ${JSON.stringify(p)}

Provide:
1. **Compatibility Score** (0-100 with a short reason)
2. **Temperament Match**
3. **Stat Synergy** (how their stats complement each other)
4. **Offspring / Fusion Prediction** (likely traits, rarity, strengths)
5. **Potential Conflicts**
6. **Recommendation** — pair them or not, and why`,
}));
