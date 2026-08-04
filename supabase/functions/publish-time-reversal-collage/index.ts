import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return respond({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) return respond({ error: "Server configuration error" }, 500);

    const token = authHeader.slice(7);
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;
    if (claimsError || typeof userId !== "string" || !userId) {
      return respond({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const imageData = body?.imageData;
    const startAge = Number(body?.startAge);
    const endAge = Number(body?.endAge);
    const frameCount = Number(body?.frameCount);
    if (typeof imageData !== "string" || !/^data:image\/jpeg;base64,/.test(imageData)) {
      return respond({ error: "A JPEG collage is required" }, 400);
    }
    if (![startAge, endAge, frameCount].every(Number.isFinite) || frameCount < 1 || frameCount > 6) {
      return respond({ error: "Invalid collage metadata" }, 400);
    }

    const encoded = imageData.slice(imageData.indexOf(",") + 1);
    if (encoded.length > 10_000_000) return respond({ error: "Collage is too large" }, 413);
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const path = `${userId}/time-reversal/collage/${crypto.randomUUID()}.jpg`;

    const { error: uploadError } = await admin.storage
      .from("media")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: false });
    if (uploadError) return respond({ error: `Collage upload failed: ${uploadError.message}` }, 500);

    const { data: publicData } = admin.storage.from("media").getPublicUrl(path);
    const collageUrl = publicData.publicUrl;
    const { error: postError } = await admin.from("time_reversal_posts").insert({
      user_id: userId,
      content: `🎞️ My full reverse-aging journey: ${startAge} → ${endAge} years (${frameCount} AI frames collage).`,
      image_url: collageUrl,
      age_at_post: endAge,
      likes_count: 0,
      comments_count: 0,
    });

    if (postError) {
      await admin.storage.from("media").remove([path]);
      return respond({ error: `Feed publishing failed: ${postError.message}` }, 500);
    }

    return respond({ url: collageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected publishing error";
    return respond({ error: message }, 500);
  }
});