// Shared handler for Virtual Pet AI tools (personality coach, name generator, etc.)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "./spendCredits.ts";

export const petAiCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...petAiCors, "Content-Type": "application/json" },
  });

interface PetToolConfig {
  tool: string;
  cost: number;
  system: string;
  buildPrompt: (params: Record<string, any>) => string;
  /** When true the model must return a JSON array of names */
  namesMode?: boolean;
}

async function callGateway(model: string, messages: any[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });
}

export function servePetAiTool(config: PetToolConfig) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response(null, { headers: petAiCors });

    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return json({ error: "Not authenticated" }, 401);

      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await admin.auth.getUser(token);
      if (authError || !user) return json({ error: "Invalid session" }, 401);

      const params = await req.json().catch(() => ({}));

      const { data: creditRow } = await admin
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      const remaining = (creditRow as any)?.credits_remaining ?? 0;
      if (remaining < config.cost) {
        return json({ error: `Not enough credits. Need ${config.cost}, have ${remaining}.` }, 402);
      }

      const messages = [
        { role: "system", content: config.system },
        { role: "user", content: config.buildPrompt(params) },
      ];

      const models = ["google/gemini-3.6-flash", "google/gemini-3.1-flash-lite"];
      let aiRes: Response | null = null;
      for (const model of models) {
        for (let attempt = 0; attempt < 2; attempt++) {
          aiRes = await callGateway(model, messages);
          if (aiRes.ok) break;
          if (aiRes.status === 429) {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }
          break;
        }
        if (aiRes?.ok) break;
      }

      if (!aiRes || !aiRes.ok) {
        const status = aiRes?.status ?? 500;
        const detail = aiRes ? await aiRes.text().catch(() => "") : "";
        console.error(`[${config.tool}] AI error ${status}: ${detail.slice(0, 300)}`);
        if (status === 429) return json({ error: "AI is busy right now. Please try again in a moment." }, 429);
        if (status === 402) return json({ error: "AI credits exhausted. Please top up." }, 402);
        return json({ error: "AI service error" }, 500);
      }

      const payload = await aiRes.json();
      const text: string = payload?.choices?.[0]?.message?.content ?? "";
      if (!text) return json({ error: "Empty AI response" }, 500);

      const spend = await spendAiCredits(admin, user.id, config.cost, config.tool, "virtual_pet");

      if (config.namesMode) {
        let names: string[] = [];
        try {
          const match = text.match(/\[[\s\S]*\]/);
          if (match) names = JSON.parse(match[0]);
        } catch (_e) { /* fall through */ }
        if (!names.length) {
          names = text
            .split("\n")
            .map((l) => l.replace(/^[\s\-\*\d\.\)"']+/, "").replace(/["',]+$/, "").trim())
            .filter((l) => l.length > 0 && l.length < 40)
            .slice(0, 12);
        }
        return json({ names, credits_remaining: spend.remaining });
      }

      return json({ result: text, credits_remaining: spend.remaining });
    } catch (e: any) {
      console.error(`[${config.tool}] error`, e?.message || e);
      return json({ error: e?.message || "Unexpected error" }, 500);
    }
  };
}
