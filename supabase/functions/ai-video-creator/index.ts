import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { startVertexVideo, pollVertexVideo, VEO_LITE_MODELS } from "../_shared/vertexDirect.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/**
 * One clip = ONE continuous 8s Veo generation. Chaining separate generations
 * produced visually unrelated parts, so the creator now always renders a single
 * coherent shot regardless of any requested length.
 */
const CLIP_SECONDS = 8;
const CLIP_COST = 25;
const CREDIT_COSTS: Record<number, number> = { 8: CLIP_COST };
const SEGMENT_PLAN: Record<number, number[]> = { 8: [CLIP_SECONDS] };


const BANNED = /\b(nude|naked|nsfw|porn|sex|sexual|erotic|fetish|nahá|nahy|erotick|porno)\b/i;

function buildPrompt(row: any): string {
  const bits: string[] = [];
  bits.push(`One single continuous shot telling one story: ${row.topic}.`);
  if (row.scene) bits.push(`Scene / setting: ${row.scene}.`);
  if (row.style) bits.push(`Visual style: ${row.style}, cinematic, high production value.`);
  bits.push(
    "Keep the same characters, wardrobe, location, lighting and colour grading from the first frame to the last — no cuts, no scene changes, no jumping to a different place.",
  );
  const line = String(row.narration ?? "").trim();
  if (line) bits.push(`A voice narrates aloud, clearly and in sync with the visuals: ${line}`);
  if (row.music) bits.push(`Background music: ${row.music}, mixed under the narration.`);
  bits.push("No on-screen text, no captions, no watermark, no logos.");
  return bits.join(" ");
}

async function startSegment(row: any) {
  return await startVertexVideo({
    prompt: buildPrompt(row),
    durationSeconds: CLIP_SECONDS,
    aspectRatio: row.aspect_ratio || "9:16",
    models: VEO_LITE_MODELS,
    resolution: "720p",
    generateAudio: true,
    negativePrompt: "text, captions, subtitles, watermark, logo, nudity, violence",
  });
}


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "create");

    /* ---------------- CREATE ---------------- */
    if (action === "create") {
      const duration = Number(body?.duration ?? 8);
      const plan = SEGMENT_PLAN[duration];
      const cost = CREDIT_COSTS[duration];
      if (!plan || !cost) return json({ error: "Unsupported duration" }, 400);

      const topic = String(body?.topic ?? "").trim();
      if (topic.length < 3) return json({ error: "Please describe what the video is about." }, 400);

      const payload = {
        topic,
        scene: String(body?.scene ?? "").slice(0, 600),
        style: String(body?.style ?? "").slice(0, 200),
        narration: String(body?.narration ?? "").slice(0, 1200),
        music: String(body?.music ?? "").slice(0, 200),
        aspect_ratio: body?.aspectRatio === "16:9" ? "16:9" : "9:16",
      };

      const joined = `${payload.topic} ${payload.scene} ${payload.style} ${payload.narration}`;
      if (BANNED.test(joined)) {
        return json({ error: "This request contains adult or explicit content and cannot be generated." }, 400);
      }

      const { data: credits } = await supabase
        .from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
      if (!credits || credits.credits_remaining < cost) {
        return json({ error: `Insufficient credits. This clip costs ${cost} credits.`, required: cost }, 402);
      }

      const { error: deductErr } = await supabase.rpc("deduct_ai_credits", {
        p_user_id: user.id,
        p_amount: cost,
        p_reason: `ai_video_creator:${duration}s`,
        p_source: "ai-video-creator",
      });
      if (deductErr) return json({ error: "Insufficient credits.", required: cost }, 402);

      const { data: row, error: insErr } = await supabase
        .from("ai_video_creations")
        .insert({
          user_id: user.id,
          ...payload,
          duration_seconds: duration,
          credits_spent: cost,
          segments_total: plan.length,
          status: "processing",
        })
        .select()
        .single();
      if (insErr || !row) {
        await supabase.rpc("add_ai_credits", {
          p_user_id: user.id, p_amount: cost,
          p_reason: "ai_video_creator_refund", p_source: "ai-video-creator",
        });
        return json({ error: "Could not start the video job." }, 500);
      }

      const op = await startSegment({ ...row, segment_plan: plan }, 0);
      if (!op) {
        await supabase.rpc("add_ai_credits", {
          p_user_id: user.id, p_amount: cost,
          p_reason: "ai_video_creator_refund", p_source: "ai-video-creator",
        });
        await supabase.from("ai_video_creations")
          .update({ status: "failed", error: "Video model unavailable. Credits refunded.", updated_at: new Date().toISOString() })
          .eq("id", row.id);
        return json({
          error:
            "Video generation is temporarily unavailable (video model quota/billing). Your credits were refunded — please try again later.",
        }, 503);

      }

      await supabase.from("ai_video_creations")
        .update({ operation: op, updated_at: new Date().toISOString() })
        .eq("id", row.id);

      return json({ id: row.id, status: "processing", segments_total: plan.length, credits_spent: cost });
    }

    /* ---------------- POLL ---------------- */
    if (action === "poll") {
      const id = String(body?.id ?? "");
      const { data: row } = await supabase
        .from("ai_video_creations").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
      if (!row) return json({ error: "Not found" }, 404);
      if (row.status !== "processing") {
        return json({ status: row.status, segments: row.segments, error: row.error });
      }

      const op = row.operation as any;
      if (!op) return json({ status: "processing", progress: 0 });

      const plan = SEGMENT_PLAN[row.duration_seconds] ?? [8];
      const segments = Array.isArray(row.segments) ? [...(row.segments as any[])] : [];
      const result = await pollVertexVideo(op);
      if (!result) return json({ status: "processing", progress: segments.length / plan.length });
      if (!result.done) return json({ status: "processing", progress: segments.length / plan.length });

      if (result.error || !result.videoBase64) {
        const refundable = row.credits_spent > 0;
        if (refundable) {
          await supabase.rpc("add_ai_credits", {
            p_user_id: user.id, p_amount: row.credits_spent,
            p_reason: "ai_video_creator_refund", p_source: "ai-video-creator",
          });
        }
        await supabase.from("ai_video_creations").update({
          status: "failed",
          error: `${result.error ?? "Generation failed"}${refundable ? " — credits refunded." : ""}`,
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);
        return json({ status: "failed", error: result.error ?? "Generation failed" });
      }

      // Store the finished clip — one generation, one story, no chaining.
      const bytes = Uint8Array.from(atob(result.videoBase64), (c) => c.charCodeAt(0));
      const path = `${user.id}/${row.id}/part-1.mp4`;
      const { error: upErr } = await supabase.storage
        .from("ai-video-creator")
        .upload(path, bytes, { contentType: "video/mp4", upsert: true });
      if (upErr) {
        console.error("[ai-video-creator] upload failed", upErr.message);
        return json({ status: "processing", progress: 0.9 });
      }
      const segments = [{ path, seconds: CLIP_SECONDS }];
      await supabase.from("ai_video_creations").update({
        segments, segments_total: 1, status: "completed", operation: null,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);
      return json({ status: "completed", segments });
    }


    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("[ai-video-creator]", e);
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
