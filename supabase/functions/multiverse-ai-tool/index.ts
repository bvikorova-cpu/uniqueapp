import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { callOpenAI, corsHeaders, errorResponse, jsonResponse } from "../_shared/openai.ts";

/**
 * Universal Multiverse AI handler.
 * Replaces: multiverse-ai-tool, find-best-self, generate-decision-tree,
 * merge-timelines, quantum-chat, reality-jump, reality-lottery, create-universe
 * Routed by `action` field.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Missing authorization", 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated", 401);

    const body = await req.json();
    const { action = "chat", input = "", prompt = "", ...rest } = body;
    const userInput = (input || prompt || JSON.stringify(rest)).toString().slice(0, 4000);

    const systemPrompts: Record<string, string> = {
      chat: "You are a multiverse quantum guide. Respond with vivid alternate-reality scenarios in 2-3 paragraphs.",
      quantum_chat: "You are a quantum entity from a parallel dimension. Be mysterious, insightful, and use cosmic metaphors.",
      find_best_self: "You explore the user's best possible self in alternate timelines. Return JSON: {best_self_description, key_traits[], life_path, achievements[], wisdom_message}.",
      decision_tree: "Generate a decision tree analysis. Return JSON: {decision, branches:[{choice, outcome, probability, consequences[]}], recommended_path}.",
      merge_timelines: "Merge two timeline scenarios into a coherent narrative. Return JSON: {merged_narrative, conflicts[], synergies[], emergent_outcomes[]}.",
      reality_jump: "Describe a vivid alternate reality jump. Return JSON: {destination_reality, sensory_experience, key_differences[], duration, return_message}.",
      reality_lottery: "Generate a random alternate reality scenario. Return JSON: {reality_name, description, rarity, special_gift, life_lesson}.",
      create_universe: "Help design a custom universe. Return JSON: {universe_name, physics_rules[], dominant_species, history_summary, unique_phenomena[]}.",
    };

    const actionKey = action.replace(/-/g, "_");
    const system = systemPrompts[actionKey] || systemPrompts.chat;
    const wantsJson = actionKey !== "chat" && actionKey !== "quantum_chat";

    const result = await callOpenAI({
      system,
      user: userInput,
      json: wantsJson,
      temperature: 0.9,
    });

    const parsed = wantsJson ? safeJson(result) : null;
    return jsonResponse({
      success: true,
      action: actionKey,
      result: parsed ?? result,
      text: result,
      reply: result,
    });
  } catch (e: any) {
    return errorResponse(e.message || "Multiverse AI failed");
  }
});

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
