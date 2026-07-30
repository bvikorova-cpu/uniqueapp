import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { servePetAiTool } from "../_shared/virtualPetAI.ts";

serve(servePetAiTool({
  tool: "pet-personality-coach",
  cost: 5,
  system: "You are an expert virtual pet personality coach. Answer in clear Markdown, warm and practical.",
  buildPrompt: (p) => `Analyze this virtual pet and create a personalized care & personality plan.

Pet name: ${p.petName || "Unknown"}
Species: ${p.species || "unknown"}
Level: ${p.level ?? "?"}
Happiness: ${p.happiness ?? "?"}/100
Energy: ${p.energy ?? "?"}/100
Hunger: ${p.hunger ?? "?"}/100

Provide:
1. **Personality Profile**
2. **Current State Read** (what the stats say)
3. **Daily Care Routine** (morning / afternoon / evening)
4. **Bonding Activities**
5. **Warning Signs to Watch**
6. **7-Day Improvement Goal**`,
}));
