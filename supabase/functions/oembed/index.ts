// oEmbed provider endpoint for Unique campaigns.
// Spec: https://oembed.com/
// Accepts ?url=<campaign_or_embed_url>&maxwidth=&maxheight=&format=json
// Returns oEmbed JSON with an <iframe> pointing to /embed/campaign/<type>/<id>.

import "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const CATEGORY_TABLE: Record<string, string> = {
  medical: "medical_campaigns",
  dream: "dream_campaigns",
  hero: "hero_campaigns",
  crisis: "crisis_campaigns",
  pet: "pet_rescue_campaigns",
  student: "student_campaigns",
  talent: "talent_campaigns",
};

const PROVIDER_NAME = "Unique";
const PROVIDER_URL = "https://www.uniqueapp.fun";

function parseCampaign(url: string): { type: string; id: string } | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    // /embed/campaign/:type/:id
    if (parts[0] === "embed" && parts[1] === "campaign" && parts[2] && parts[3]) {
      return { type: parts[2], id: parts[3] };
    }
    // /fundraising/:type/:id
    if (parts[0] === "fundraising" && parts[1] && parts[2] && CATEGORY_TABLE[parts[1]]) {
      return { type: parts[1], id: parts[2] };
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  const format = (url.searchParams.get("format") || "json").toLowerCase();
  const maxwidth = Number(url.searchParams.get("maxwidth")) || 480;
  const maxheight = Number(url.searchParams.get("maxheight")) || 560;

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing required ?url parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (format !== "json") {
    // XML not supported per oEmbed spec 501
    return new Response("XML format not implemented", {
      status: 501,
      headers: corsHeaders,
    });
  }

  const parsed = parseCampaign(target);
  if (!parsed) {
    return new Response(JSON.stringify({ error: "URL is not a recognized Unique campaign URL" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const table = CATEGORY_TABLE[parsed.type];
  if (!table) {
    return new Response(JSON.stringify({ error: "Unknown campaign category" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from(table)
    .select("id,title,description,image_url")
    .eq("id", parsed.id)
    .maybeSingle();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Campaign not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const width = Math.max(280, Math.min(1200, maxwidth));
  const height = Math.max(360, Math.min(900, maxheight));
  const embedSrc = `${PROVIDER_URL}/embed/campaign/${parsed.type}/${parsed.id}`;

  const html = `<iframe src="${embedSrc}" width="${width}" height="${height}" frameborder="0" scrolling="no" style="border:0;max-width:100%;border-radius:16px;overflow:hidden" loading="lazy" title="${(data as any).title || "Support this campaign"}"></iframe>`;

  const body = {
    version: "1.0",
    type: "rich",
    provider_name: PROVIDER_NAME,
    provider_url: PROVIDER_URL,
    title: (data as any).title,
    author_name: PROVIDER_NAME,
    author_url: PROVIDER_URL,
    html,
    width,
    height,
    thumbnail_url: (data as any).image_url || undefined,
    thumbnail_width: (data as any).image_url ? 480 : undefined,
    thumbnail_height: (data as any).image_url ? 270 : undefined,
    cache_age: 300,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});
