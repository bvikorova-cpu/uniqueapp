import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { servePetAiTool } from "../_shared/virtualPetAI.ts";

serve(servePetAiTool({
  tool: "pet-story-generator",
  cost: 6,
  system: "You are a gifted storyteller writing short adventure stories starring virtual pets. Use Markdown with a title and short paragraphs.",
  buildPrompt: (p) => `Write an engaging short adventure story (600-900 words).

Starring pets: ${JSON.stringify(p.pets || [])}
Genre: ${p.genre || "fantasy adventure"}
Setting: ${p.setting || "a magical world"}

Requirements:
- Give each pet a distinct voice and moment to shine
- Include a challenge, a twist and a satisfying ending
- Start with a bold Markdown title`,
}));
