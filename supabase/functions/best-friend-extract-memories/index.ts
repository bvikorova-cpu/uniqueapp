// Background memory extractor: scans recent user messages, extracts durable facts,
// stores top-N into best_friend_memories. Called by client opportunistically (e.g. every 10 messages)
// or by user on demand.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "Unauthorized" }, 401);
    const OPENAI = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI) return j({ error: "no key" }, 500);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: u } = await anon.auth.getUser();
    if (!u.user) return j({ error: "Unauthorized" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } });

    // Pull last 30 user messages
    const { data: msgs } = await admin.from("best_friend_conversations")
      .select("content,role,created_at").eq("user_id", u.user.id)
      .eq("role", "user").order("created_at", { ascending: false }).limit(30);
    if (!msgs || msgs.length === 0) return j({ extracted: 0 });

    const text = msgs.reverse().map((m: any) => `- ${m.content}`).join("\n").slice(0, 6000);

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `You extract durable personal facts about a user from their chat messages. Output JSON: {"memories":[{"category":"fact|person|preference|event|goal|dislike","content":"<short third-person fact>","importance":1-10}]} Only include things worth long-term remembering (names of friends/family/pets, hobbies, job, big goals, important dates, dislikes). Skip ephemeral things ("had coffee today"). Max 8 items. Keep content under 140 chars.` },
          { role: "user", content: text },
        ],
      }),
    });
    if (!aiResp.ok) return j({ error: "ai" }, 502);
    const data = await aiResp.json();
    let parsed: any = {};
    try { parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}"); } catch { parsed = {}; }
    const items: any[] = Array.isArray(parsed.memories) ? parsed.memories.slice(0, 8) : [];
    if (items.length === 0) return j({ extracted: 0 });

    // Avoid duplicates: load existing
    const { data: existing } = await admin.from("best_friend_memories")
      .select("content").eq("user_id", u.user.id);
    const existingSet = new Set((existing || []).map((r: any) => r.content.toLowerCase().trim()));

    const toInsert = items
      .filter(i => i?.content && !existingSet.has(String(i.content).toLowerCase().trim()))
      .map(i => ({
        user_id: u.user.id,
        category: ["fact","person","preference","event","goal","dislike"].includes(i.category) ? i.category : "fact",
        content: String(i.content).slice(0, 280),
        importance: Math.min(10, Math.max(1, Number(i.importance) || 5)),
      }));
    if (toInsert.length === 0) return j({ extracted: 0 });

    await admin.from("best_friend_memories").insert(toInsert);
    return j({ extracted: toInsert.length });
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
