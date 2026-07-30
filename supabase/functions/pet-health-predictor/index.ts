import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { servePetAiTool } from "../_shared/virtualPetAI.ts";

serve(servePetAiTool({
  tool: "pet-health-predictor",
  cost: 8,
  system: "You are a virtual pet health forecasting AI. Answer in clear Markdown with concrete numbers.",
  buildPrompt: (p) => `Forecast the health and evolution trend of this virtual pet.

Pet name: ${p.petName || "Unknown"}
Species: ${p.species || "unknown"}
Level: ${p.level ?? "?"} | XP: ${p.experience ?? "?"}
Happiness: ${p.happiness ?? "?"}/100 | Energy: ${p.energy ?? "?"}/100 | Hunger: ${p.hunger ?? "?"}/100
Forecast window: ${p.timeframeDays || 7} days

Provide:
1. **Health Score Today** (0-100 with reasoning)
2. **Projected Stats** at the end of the window (happiness, energy, hunger)
3. **Evolution Outlook** (will it level up, what is needed)
4. **Risk Factors** 🟢🟡🔴
5. **Action Plan** (day-by-day essentials)
6. **Best-case vs worst-case scenario**`,
}));
