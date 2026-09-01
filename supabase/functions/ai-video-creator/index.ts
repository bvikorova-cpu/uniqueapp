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
 * Longer videos are ONE video, not several clips: the first generation renders 8
 * seconds, and every following step is a Veo *extension* of that same video
 * (+7s each). An extension returns the full merged MP4, so the finished file is a
 * single continuous story with the same characters, place and grading throughout.
 */
const BASE_SECONDS = 8;
const EXTEND_SECONDS = 7;

/** duration -> { extensions, cost } */
const PLANS: Record<number, { extensions: number; cost: number }> = {
  8: { extensions: 0, cost: 25 },
  15: { extensions: 1, cost: 35 },
  22: { extensions: 2, cost: 48 },
  30: { extensions: 3, cost: 60 },
};

const BANNED = /\b(nude|naked|nsfw|porn|sex|sexual|erotic|fetish|nahá|nahy|erotick|porno)\b/i;

function baseStory(row: any): string {
  const bits: string[] = [];
  if (row.scene) bits.push(`Scene / setting: ${row.scene}.`);
  if (row.style) bits.push(`Visual style: ${row.style}, cinematic, high production value.`);
  return bits.join(" ");
}

function buildPrompt(row: any, step: number): string {
  const bits: string[] = [];
  if (step === 0) {
    bits.push(`One continuous story: ${row.topic}.`);
    bits.push(baseStory(row));
    bits.push(
      "Keep the same characters, wardrobe, location, lighting and colour grading from the first frame to the last — no cuts, no scene changes, no jumping to a different place.",
    );
  } else {
    bits.push(
      `Continue the exact same shot and the same story without any cut: ${row.topic}.`,
    );
    bits.push(baseStory(row));
    bits.push(
      "Same characters, same wardrobe, same location, same lighting and colour grading as the previous seconds — the action simply carries on naturally.",
    );
  }
  const line = String(row.narration ?? "").trim();
  if (line) {
    bits.push(
      step === 0
        ? `A voice narrates aloud, clearly and in sync with the visuals: ${line}`
        : `The same narrator voice continues calmly over the scene: ${line}`,
    );
  }
  if (row.music) bits.push(`Background music: ${row.music}, mixed under the narration.`);
  bits.push("No on-screen text, no captions, no watermark, no logos.");
  return bits.join(" ");
}

async function startStep(row: any, step: number, videoBase64?: string) {
  return await startVertexVideo({
    prompt: buildPrompt(row, step),
    durationSeconds: step === 0 ? BASE_SECONDS : EXTEND_SECONDS,
    aspectRatio: row.aspect_ratio || "9:16",
    models: VEO_LITE_MODELS,
    resolution: "720p",
    generateAudio: true,
    negativePrompt: "text, captions, subtitles, watermark, logo, nudity, violence",
    ...(videoBase64 ? { videoBase64, videoMime: "video/mp4" } : {}),
  });
}

function toBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
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
      const requested = Number(body?.duration ?? 8);
      const duration = PLANS[requested] ? requested : 8;
      const plan = PLANS[duration];
      const cost = plan.cost;

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
        return json({ error: `Insufficient credits. This video costs ${cost} credits.`, required: cost }, 402);
      }

      const { error: deductErr } = await supabase.rpc("deduct_ai_credits", {
        p_user_id: user.id,
        p_amount: cost,
        p_reason: `ai_video_creator:${duration}s`,
        p_source: "ai-video-creator",
      });
      if (deductErr) return json({ error: "Insufficient credits.", required: cost }, 402);

      const totalSteps = plan.extensions + 1;
      const { data: row, error: insErr } = await supabase
        .from("ai_video_creations")
        .insert({
          user_id: user.id,
          ...payload,
          duration_seconds: duration,
          credits_spent: cost,
          segments_total: totalSteps,
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

      const op = await startStep(row, 0);
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
        .update({ operation: { ...op, step: 0, extensions: plan.extensions }, updated_at: new Date().toISOString() })
        .eq("id", row.id);

      return json({ id: row.id, status: "processing", segments_total: totalSteps, credits_spent: cost });
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

      const step = Number(op.step ?? 0);
      const extensions = Number(op.extensions ?? 0);

      const result = await pollVertexVideo(op);
      if (!result) return json({ status: "processing", progress: 0.2 });
      if (!result.done) return json({ status: "processing", progress: 0.3 + step * 0.15 });

      const failVideo = async (message: string) => {
        if (row.credits_spent > 0) {
          await supabase.rpc("add_ai_credits", {
            p_user_id: user.id, p_amount: row.credits_spent,
            p_reason: "ai_video_creator_refund", p_source: "ai-video-creator",
          });
        }
        await supabase.from("ai_video_creations").update({
          status: "failed",
          error: `${message}${row.credits_spent > 0 ? " — credits refunded." : ""}`,
          operation: null,
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);
        return json({ status: "failed", error: message });
      };

      if (result.error || !result.videoBase64) {
        return await failVideo(result.error ?? "Generation failed");
      }

      // Veo returns the FULL merged video on every step, so we always store one file.
      const bytes = toBytes(result.videoBase64);
      const path = `${user.id}/${row.id}/video.mp4`;
      const { error: upErr } = await supabase.storage
        .from("ai-video-creator")
        .upload(path, bytes, { contentType: "video/mp4", upsert: true });
      if (upErr) {
        console.error("[ai-video-creator] upload failed", upErr.message);
        return json({ status: "processing", progress: 0.9 });
      }

      const secondsSoFar = BASE_SECONDS + step * EXTEND_SECONDS;

      // More seconds requested → extend this very same video (one story, no cuts).
      if (step < extensions) {
        const nextOp = await startStep(row, step + 1, toBase64(bytes));
        if (!nextOp) {
          // Keep what we already have rather than losing the video entirely.
          await supabase.from("ai_video_creations").update({
            segments: [{ path, seconds: secondsSoFar }],
            segments_total: step + 1,
            status: "completed",
            operation: null,
            error: `Only ${secondsSoFar}s could be rendered.`,
            updated_at: new Date().toISOString(),
          }).eq("id", row.id);
          return json({ status: "completed", segments: [{ path, seconds: secondsSoFar }] });
        }
        await supabase.from("ai_video_creations").update({
          segments: [{ path, seconds: secondsSoFar }],
          operation: { ...nextOp, step: step + 1, extensions },
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);
        return json({ status: "processing", progress: 0.4 + (step + 1) * 0.15 });
      }

      const segments = [{ path, seconds: secondsSoFar }];
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
