import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLONE_COST = 25;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { audioBase64, voiceName } = await req.json();
    if (!audioBase64 || !voiceName) throw new Error("Missing audio or name");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const auth = req.headers.get("Authorization")!;
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) throw new Error("Unauthorized");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: cur } = await admin.from("shadow_arena_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    if (!cur || cur.credits_remaining < CLONE_COST) {
      return new Response(JSON.stringify({ error: `Need ${CLONE_COST} credits.` }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ELEVEN = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVEN) throw new Error("ELEVENLABS_API_KEY not configured");

    // Convert base64 to blob
    const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
    const formData = new FormData();
    formData.append("name", voiceName);
    formData.append("files", new Blob([audioBytes], { type: "audio/mpeg" }), "sample.mp3");
    formData.append("description", `Shadow Arena cloned voice for user ${user.id}`);

    const cloneRes = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": ELEVEN },
      body: formData,
    });
    if (!cloneRes.ok) {
      const err = await cloneRes.text();
      throw new Error(`ElevenLabs error: ${err}`);
    }
    const cloneJson = await cloneRes.json();

    // Atomic deduction AFTER successful ElevenLabs clone (race-safe)
    const { data: newRemaining, error: dedErr } = await admin.rpc(
      "deduct_shadow_arena_credits",
      { _user_id: user.id, _amount: CLONE_COST },
    );
    if (dedErr) {
      if (dedErr.message?.includes("INSUFFICIENT_CREDITS")) {
        return new Response(JSON.stringify({ error: `Need ${CLONE_COST} credits.` }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw dedErr;
    }

    const { error: upsertErr } = await admin.from("shadow_voice_clones").upsert({
      user_id: user.id,
      voice_id: cloneJson.voice_id,
      voice_name: voiceName,
      status: "active",
      credits_spent: CLONE_COST,
    });
    if (upsertErr) {
      // Refund: clone was created on ElevenLabs but DB save failed
      await admin.rpc("refund_shadow_arena_credits", { _user_id: user.id, _amount: CLONE_COST });
      throw upsertErr;
    }


    return new Response(JSON.stringify({ voice_id: cloneJson.voice_id, voice_name: voiceName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
