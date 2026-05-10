// Generate AI Best Friend avatar (Pixar-style portrait) and save URL on persona row.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const OPENAI = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI) throw new Error("OPENAI_API_KEY not configured");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const auth = req.headers.get("Authorization");
    if (!auth) return j({ error: "Unauthorized" }, 401);

    const sb = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return j({ error: "Unauthorized" }, 401);
    const admin = createClient(SUPABASE_URL, SERVICE);

    const body = await req.json().catch(() => ({}));
    const description = String(body?.description || "").slice(0, 400) ||
      "kind warm best friend, soft smile, expressive eyes, neutral background";

    const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        messages: [{ role: "user", content:
          `Pixar 3D portrait of: ${description}. Friendly, glowing, cinematic studio lighting, square crop, no text, no real person.` }],
      }),
    });
    if (!imgRes.ok) {
      const t = await imgRes.text();
      if (imgRes.status === 429) return j({ error: "Rate limit" }, 429);
      if (imgRes.status === 402) return j({ error: "AI credits exhausted" }, 402);
      throw new Error(`Image AI: ${t}`);
    }
    const data = await imgRes.json();
    const url: string | undefined = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new Error("No image returned");
    const base64 = url.split(",")[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const path = `${user.id}/avatar-${Date.now()}.png`;
    const { error: upErr } = await admin.storage.from("best-friend-media")
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;
    const { data: pub } = admin.storage.from("best-friend-media").getPublicUrl(path);

    await admin.from("best_friend_persona")
      .upsert({ user_id: user.id, avatar_url: pub.publicUrl }, { onConflict: "user_id" });

    return j({ avatar_url: pub.publicUrl }, 200);
  } catch (e) {
    return j({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function j(b: unknown, s: number) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
