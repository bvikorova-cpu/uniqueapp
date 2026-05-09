// Reverse image search — uses AI to describe the image and returns
// ready-made search URLs for Google Images, Bing, Yandex, TinEye.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return json({ error: "Missing imageUrl" }, 400);

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    let description = "";
    let keywords: string[] = [];

    if (apiKey) {
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Describe this image for reverse-image search. End with a JSON array of 5-7 short search keyword phrases on a line starting with 'KEYWORDS:'." },
            { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] },
          ],
        }),
      });
      const j = await aiRes.json();
      const content = j?.choices?.[0]?.message?.content || "";
      description = content;
      const m = content.match(/KEYWORDS:\s*(\[.*\]|.+)$/i);
      if (m) {
        try { keywords = JSON.parse(m[1]); }
        catch { keywords = m[1].split(",").map((s: string) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean); }
      }
    }

    const q = encodeURIComponent(keywords.join(" ") || "image");
    const imgU = encodeURIComponent(imageUrl);

    const searchEngines = [
      { name: "Google Images", url: `https://www.google.com/searchbyimage?image_url=${imgU}` },
      { name: "Google Lens", url: `https://lens.google.com/uploadbyurl?url=${imgU}` },
      { name: "Bing Visual", url: `https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:${imgU}` },
      { name: "Yandex Images", url: `https://yandex.com/images/search?rpt=imageview&url=${imgU}` },
      { name: "TinEye", url: `https://tineye.com/search?url=${imgU}` },
      { name: "Google Search (keywords)", url: `https://www.google.com/search?q=${q}` },
    ];

    return json({ description, keywords, searchEngines });
  } catch (e: any) {
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
