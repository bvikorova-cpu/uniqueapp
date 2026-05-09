// Barcode / QR product lookup using free Open Food Facts API + AI fallback.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return json({ error: "Missing barcode/QR 'code'" }, 400);
    }
    const cleaned = code.trim();

    // 1) Open Food Facts (food products)
    let product: any = null;
    try {
      const off = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleaned)}.json`);
      if (off.ok) {
        const j = await off.json();
        if (j.status === 1 && j.product) {
          const p = j.product;
          product = {
            source: "openfoodfacts",
            name: p.product_name || p.generic_name || "Unknown product",
            brand: p.brands || "",
            categories: p.categories || "",
            ingredients: p.ingredients_text || "",
            allergens: p.allergens || "",
            nutriscore: p.nutriscore_grade || "",
            ecoscore: p.ecoscore_grade || "",
            nova: p.nova_group || null,
            calories_per_100g: p.nutriments?.["energy-kcal_100g"] ?? null,
            image_url: p.image_url || "",
            barcode: cleaned,
          };
        }
      }
    } catch (_) { /* ignore */ }

    // 2) AI fallback when not found
    if (!product) {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (apiKey) {
        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a barcode/QR lookup assistant. Given a code, identify what it most likely refers to (product, URL, contact, plain text). Provide best guess and where the user could verify (Amazon, Google, Open Food Facts)." },
              { role: "user", content: `Code: ${cleaned}` },
            ],
            max_completion_tokens: 600,
          }),
        });
        const j = await aiRes.json();
        product = {
          source: "ai-guess",
          ai_result: j?.choices?.[0]?.message?.content || "No information found",
          barcode: cleaned,
        };
      } else {
        product = { source: "none", barcode: cleaned, message: "Product not found in Open Food Facts and AI fallback unavailable." };
      }
    }

    return json({ product });
  } catch (e: any) {
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
