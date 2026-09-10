import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COST = 3; // credits per generated flyer

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const clean = (v: unknown, max = 400) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: { user } } = await anon.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const brief = (body?.brief ?? {}) as Record<string, unknown>;
    const styleName = clean(body?.styleName, 80);
    const stylePrompt = clean(body?.stylePrompt, 400);
    const styleId = clean(body?.styleId, 80) || "custom";
    const language = clean(body?.language, 10) || "en";
    const languageLabel = clean(body?.languageLabel, 40) || "English";
    const aspect = clean(body?.aspect, 10) || "3:4";
    const refImages = Array.isArray(body?.referenceImages)
      ? (body.referenceImages as unknown[]).filter((v) => typeof v === "string").slice(0, 3)
      : [];

    const headline = clean(brief.headline, 120);
    if (!headline) return json({ error: "Headline is required" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const { data: creditRow } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const available = creditRow?.credits_remaining ?? 0;
    if (available < COST) {
      return json({ error: `Insufficient AI credits. A flyer costs ${COST} credits (you have ${available}).` }, 402);
    }

    const line = (label: string, value: string) => (value ? `${label}: ${value}` : "");
    const textBlock = [
      line("Main headline", headline),
      line("Sub-headline", clean(brief.subheadline, 160)),
      line("Business or organiser name", clean(brief.businessName, 100)),
      line("Offer / price", clean(brief.offer, 120)),
      line("Date", clean(brief.date, 80)),
      line("Time", clean(brief.time, 60)),
      line("Venue / address", clean(brief.venue, 160)),
      line("Phone", clean(brief.phone, 60)),
      line("Website", clean(brief.website, 120)),
      line("Social handles", clean(brief.social, 120)),
      line("Key selling points", clean(brief.bullets, 500)),
      line("Call to action", clean(brief.cta, 120)),
      line("Small print / legal", clean(brief.finePrint, 200)),
    ].filter(Boolean).join("\n");

    const direction = [
      line("Product or service", clean(brief.subject, 200)),
      line("Target audience", clean(brief.audience, 160)),
      line("Tone", clean(brief.tone, 80)),
      line("Brand colours", clean(brief.colors, 120)),
      line("Must-have imagery", clean(brief.imagery, 240)),
      line("Things to avoid", clean(brief.avoid, 200)),
      line("Extra notes", clean(brief.notes, 400)),
    ].filter(Boolean).join("\n");

    const prompt = [
      `Design a professional, print-ready promotional flyer, aspect ratio ${aspect}, full-bleed poster composition.`,
      `Visual style preset "${styleName || "Custom"}": ${stylePrompt || "modern advertising poster"}.`,
      direction ? `Creative direction:\n${direction}` : "",
      `ALL text on the flyer must be written in ${languageLabel} and spelled perfectly, with correct diacritics and no invented, duplicated or garbled words.`,
      `Render exactly this text content, nothing else:\n${textBlock}`,
      "Typography must be sharp, correctly kerned and clearly readable, with a strong hierarchy: dominant headline, supporting sub-headline, prominent offer or price, and a compact contact block at the bottom.",
      refImages.length
        ? "Use the supplied reference photo(s) as the real subject of the flyer; keep the products, people and logos faithful, and build the layout around them."
        : "",
      "No watermarks, no placeholder lorem ipsum, no stray letters, no fake QR codes.",
    ].filter(Boolean).join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI service not configured" }, 500);

    const sizeMap: Record<string, string> = {
      "3:4": "1024x1536",
      "9:16": "1024x1536",
      "1:1": "1024x1024",
      "4:3": "1536x1024",
    };

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: sizeMap[aspect] ?? "1024x1536",
        ...(refImages.length ? { images: refImages } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("flyer image error", res.status, detail.slice(0, 400));
      if (res.status === 429) return json({ error: "AI is busy right now. Please try again in a moment." }, 429);
      return json({ error: "Flyer generation failed. Please try again." }, 502);
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json as string | undefined;
    if (!b64) return json({ error: "No flyer image returned. Please try again." }, 502);

    // Persist the flyer into the public media bucket so history keeps working.
    let imageUrl = `data:image/png;base64,${b64}`;
    try {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const path = `${user.id}/flyers/${crypto.randomUUID()}.png`;
      const { error: upErr } = await admin.storage
        .from("media")
        .upload(path, bytes, { contentType: "image/png", upsert: false });
      if (!upErr) {
        imageUrl = admin.storage.from("media").getPublicUrl(path).data.publicUrl;
      } else {
        console.error("flyer upload failed", upErr.message);
      }
    } catch (e) {
      console.error("flyer upload exception", e instanceof Error ? e.message : String(e));
    }

    const spend = await spendAiCredits(
      admin,
      user.id,
      COST,
      `Promotional flyer: ${headline.slice(0, 60)}`,
      "flyer-generate",
    );
    if (!spend.ok) return json({ error: spend.error ?? "Could not charge credits" }, 402);

    const { data: saved } = await admin
      .from("flyer_designs")
      .insert({
        user_id: user.id,
        title: headline,
        style_id: styleId,
        style_name: styleName || "Custom",
        language,
        aspect_ratio: aspect,
        brief,
        prompt,
        image_url: imageUrl,
        credits_used: COST,
      })
      .select("id, created_at")
      .maybeSingle();

    return json({
      id: saved?.id ?? null,
      imageUrl,
      creditsRemaining: spend.remaining,
      createdAt: saved?.created_at ?? new Date().toISOString(),
    });
  } catch (e) {
    console.error("flyer-generate error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
