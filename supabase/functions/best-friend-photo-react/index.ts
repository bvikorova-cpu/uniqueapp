// Vision: user uploads photo URL, AI reacts emotionally as best friend
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

    const { image_url, caption } = await req.json();
    if (!image_url || typeof image_url !== "string") return j({ error: "image_url required" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } });

    const { data: persona } = await admin.from("best_friend_persona")
      .select("friend_name,language,personality").eq("user_id", u.user.id).maybeSingle();
    const name = persona?.friend_name || "Bestie";
    const lang = persona?.language || "en";

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 250,
        messages: [
          { role: "system", content: `You are ${name}, the user's AI best friend. They just shared a photo. React warmly, naturally, with genuine emotion (1-3 sentences). Reply in language code "${lang}". Use 1-2 emojis.` },
          { role: "user", content: [
            { type: "text", text: caption ? `Look! ${caption}` : "Look at this!" },
            { type: "image_url", image_url: { url: image_url } },
          ] },
        ],
      }),
    });
    if (!aiResp.ok) {
      const txt = await aiResp.text().catch(()=>"");
      console.error("vision err", aiResp.status, txt);
      return j({ error: "ai" }, 502);
    }
    const data = await aiResp.json();
    const reaction = data.choices?.[0]?.message?.content || "Wow! 💖";

    await admin.from("best_friend_photos").insert({
      user_id: u.user.id, image_url, caption: caption || null, ai_reaction: reaction,
    });

    return j({ reaction });
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});
function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
