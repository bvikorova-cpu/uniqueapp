import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_DAYS = 7;

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();

function metaFromHtml(html: string, url: URL) {
  const pick = (patterns: RegExp[]): string | null => {
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return decode(m[1]);
    }
    return null;
  };

  const prop = (name: string) => [
    new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`, "i"),
  ];

  const title =
    pick([...prop("og:title"), ...prop("twitter:title"), /<title[^>]*>([^<]+)<\/title>/i]) ?? url.hostname;
  const description = pick([...prop("og:description"), ...prop("twitter:description"), ...prop("description")]);
  let image = pick([...prop("og:image:secure_url"), ...prop("og:image"), ...prop("twitter:image")]);
  const siteName = pick(prop("og:site_name")) ?? url.hostname.replace(/^www\./, "");

  if (image) {
    try {
      image = new URL(image, url.origin).toString();
    } catch {
      image = null;
    }
  }

  return { title, description, image_url: image, site_name: siteName };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });

  try {
    const { url: raw } = (await req.json().catch(() => ({}))) as { url?: string };
    if (!raw || typeof raw !== "string") return json({ error: "url is required" }, 400);

    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      return json({ error: "Invalid url" }, 400);
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return json({ error: "Unsupported url" }, 400);
    }
    // Block internal / loopback targets (SSRF protection).
    const host = target.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host === "[::1]"
    ) {
      return json({ error: "Blocked url" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const key = target.toString();

    const { data: cached } = await supabase
      .from("link_previews")
      .select("url,title,description,image_url,site_name,fetched_at")
      .eq("url", key)
      .maybeSingle();

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at as string).getTime();
      if (age < CACHE_DAYS * 24 * 60 * 60 * 1000) return json(cached);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let html = "";
    try {
      const res = await fetch(key, {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; UniqueBot/1.0; +https://uniqueapp.fun)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !type.includes("html")) {
        return json(cached ?? { url: key, title: target.hostname, description: null, image_url: null, site_name: target.hostname });
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      html = new TextDecoder("utf-8").decode(buf.slice(0, 400_000));
    } finally {
      clearTimeout(timer);
    }

    const meta = metaFromHtml(html, target);
    const row = { url: key, ...meta, fetched_at: new Date().toISOString() };
    await supabase.from("link_previews").upsert(row, { onConflict: "url" });

    return json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});
