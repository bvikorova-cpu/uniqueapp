import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { servePetAiTool } from "../_shared/virtualPetAI.ts";

serve(servePetAiTool({
  tool: "pet-name-generator",
  cost: 3,
  namesMode: true,
  system: "You are a creative pet-naming expert. Reply ONLY with a JSON array of strings, no markdown, no explanations.",
  buildPrompt: (p) => `Generate 10 original, memorable names for a virtual pet.

Species: ${p.species || "unknown"}
Theme: ${p.theme || "any"}
Personality traits: ${p.personality || "not specified"}

Return exactly a JSON array of 10 short names, e.g. ["Ember","Nyx"].`,
}));
