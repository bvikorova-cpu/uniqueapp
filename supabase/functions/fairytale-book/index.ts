// Fairytale Book Generator — turns a child's photo into a personalized illustrated storybook.
// Credit costs: generate (story + cover) = 10 credits, illustrate one page = 3 credits.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { spendAiCredits } from "../_shared/spendCredits.ts";
import { askAIJSON } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const GENERATE_COST = 10;
const ILLUSTRATE_COST = 3;
const IMAGE_MODEL = "google/gemini-3.1-flash-image";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const STYLES: Record<string, string> = {
  watercolor: "soft watercolor children's book illustration, pastel palette, dreamy glow",
  storybook: "classic storybook illustration, warm hand-painted textures, golden light",
  cartoon: "bright cheerful cartoon, bold clean outlines, vivid colors",
  pixar: "3D animated movie render, warm cinematic lighting, expressive character",
  anime: "soft anime / ghibli-inspired illustration, gentle cel shading",
};

async function generateIllustration(prompt: string, photoDataUrl?: string): Promise<string> {
  const content: unknown[] = [{ type: "text", text: prompt }];
  if (photoDataUrl) content.push({ type: "image_url", image_url: { url: photoDataUrl } });

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: "user", content }],
      modalities: ["image", "text"],
    }),
  });

  if (resp.status === 429) throw new Error("RATE_LIMIT");
  if (resp.status === 402) throw new Error("AI_CREDITS");
  if (!resp.ok) {
    console.error("image gen failed", resp.status, (await resp.text()).slice(0, 400));
    throw new Error("IMAGE_FAILED");
  }
  const data = await resp.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    console.error("no image in response", JSON.stringify(data).slice(0, 400));
    throw new Error("IMAGE_FAILED");
  }
  return `data:image/png;base64,${b64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "generate");
    const childName = String(body.childName ?? "").trim().slice(0, 40);
    const theme = String(body.theme ?? "magical adventure").trim().slice(0, 120);
    const style = String(body.style ?? "storybook").toLowerCase();
    const styleHint = STYLES[style] ?? STYLES.storybook;
    const photo = typeof body.photo === "string" && body.photo.startsWith("data:image/")
      ? body.photo
      : undefined;

    const charge = async (amount: number, reason: string) => {
      const res = await spendAiCredits(admin as never, userId, amount, reason, "fairytale-book");
      if (!res.ok) {
        return json(
          { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: amount, remaining: res.remaining },
          402,
        );
      }
      return null;
    };

    // ------------------------------------------------------- generate story + cover
    if (action === "generate") {
      if (!childName) return json({ error: "Child name is required" }, 400);
      if (!photo) return json({ error: "A photo is required" }, 400);

      const err = await charge(GENERATE_COST, "Fairytale book — story + cover");
      if (err) return err;

      let story: { title: string; hero: string; pages: { text: string; scene: string }[] };
      try {
        story = await askAIJSON(
          `You write warm, age-appropriate personalized fairytales for children 3-9 years old.
Return ONLY JSON:
{"title":"short magical book title","hero":"one sentence describing the hero (the child)","pages":[{"text":"2-3 short sentences of the story","scene":"visual description of this page for an illustrator"}]}
Exactly 5 pages. No violence, no fear, happy ending. The hero's name must be used.`,
          `Hero name: ${childName}. Theme: ${theme}. Art style: ${style}.`,
        );
      } catch (_e) {
        return json({ error: "Story generation is busy, please try again" }, 503);
      }

      const pages = Array.isArray(story?.pages) ? story.pages.slice(0, 5) : [];
      if (!pages.length) return json({ error: "Story generation failed" }, 500);

      let cover: string | null = null;
      try {
        cover = await generateIllustration(
          `Children's picture-book cover illustration titled "${story.title}".
The hero is the child from the attached photo — keep their face, hair and skin tone recognizable, drawn as an illustrated character (not a photo).
Theme: ${theme}. ${story.hero ?? ""}
Style: ${styleHint}. Full-bleed magical scene, no text or lettering in the image, friendly and safe for children.`,
          photo,
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg === "RATE_LIMIT") return json({ error: "AI is busy right now, try again in a moment" }, 429);
        // Story still returned without the cover
      }

      const { data: saved } = await admin
        .from("fairytale_books")
        .insert({
          user_id: userId,
          child_name: childName,
          theme,
          style,
          title: story.title ?? `${childName}'s Fairytale`,
          pages,
          cover_url: cover,
        })
        .select("id")
        .maybeSingle();

      return json({
        bookId: saved?.id ?? null,
        title: story.title,
        pages,
        cover,
        cost: GENERATE_COST,
      });
    }

    // ------------------------------------------------------- illustrate one page
    if (action === "illustrate") {
      const scene = String(body.scene ?? "").trim().slice(0, 800);
      const bookId = String(body.bookId ?? "");
      const pageIndex = Number(body.pageIndex ?? -1);
      if (!scene) return json({ error: "Scene description required" }, 400);

      const err = await charge(ILLUSTRATE_COST, "Fairytale book — page illustration");
      if (err) return err;

      let image: string;
      try {
        image = await generateIllustration(
          `Children's picture-book page illustration.
Scene: ${scene}
${childName ? `The hero is ${childName} — the child from the attached photo; keep their face, hair and skin tone recognizable, drawn as an illustrated character.` : ""}
Style: ${styleHint}. No text or lettering in the image, friendly, safe and magical for children.`,
          photo,
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg === "RATE_LIMIT") return json({ error: "AI is busy right now, try again in a moment" }, 429);
        return json({ error: "Illustration failed, please try again" }, 503);
      }

      if (bookId && Number.isInteger(pageIndex) && pageIndex >= 0) {
        const { data: bookRow } = await admin
          .from("fairytale_books")
          .select("pages")
          .eq("id", bookId)
          .eq("user_id", userId)
          .maybeSingle();
        const pages = Array.isArray(bookRow?.pages) ? [...(bookRow!.pages as Record<string, unknown>[])] : [];
        if (pages[pageIndex]) {
          pages[pageIndex] = { ...pages[pageIndex], image };
          await admin.from("fairytale_books").update({ pages }).eq("id", bookId).eq("user_id", userId);
        }
      }

      return json({ image, cost: ILLUSTRATE_COST });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("fairytale-book error", e);
    return json({ error: e instanceof Error ? e.message : "Internal error" }, 500);
  }
});
