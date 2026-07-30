import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { servePetAiTool } from "../_shared/virtualPetAI.ts";

serve(servePetAiTool({
  tool: "pet-mood-analyzer",
  cost: 4,
  system: "You are a virtual pet emotion specialist. Answer in clear Markdown.",
  buildPrompt: (p) => `Perform a deep emotional analysis of this virtual pet.

Data: ${JSON.stringify(p)}

Provide:
1. **Primary Mood** (with emoji)
2. **Secondary Emotions**
3. **Stress Level** (1-10 with reasoning)
4. **What is driving the mood** (stat-based explanation)
5. **Immediate Mood Boosters** (3 concrete actions)
6. **Pet Quote** — a playful line in the pet's own voice`,
}));
