// Lottery AI tuning features: dream decoder, numerology, heatmap analysis
// Uses OpenAI. Credits deducted atomically via deduct_ai_credits RPC.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Feature = "dream_decoder" | "numerology" | "heatmap_analysis";
const COSTS: Record<Feature, number> = {
  dream_decoder: 5,
  numerology: 3,
  heatmap_analysis: 4,
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "UNAUTHORIZED" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "UNAUTHORIZED" }, 401);

    const body = await req.json();
    const feature = body.feature as Feature;
    const payload = body.payload ?? {};
    const cost = COSTS[feature];
    if (!cost) return json({ error: "UNKNOWN_FEATURE" }, 400);

    // Pre-check credits (informational; real deduction is atomic via RPC after AI call)
    const { data: credits } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    const have = credits?.credits_remaining ?? 0;
    if (have < cost) {
      return json({
        error: "INSUFFICIENT_CREDITS",
        message: `You need ${cost} credits. You have ${have}.`,
      }, 402);
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return json({ error: "MISSING_OPENAI_API_KEY" }, 500);

    let output: any = {};

    if (feature === "dream_decoder") {
      const dream = String(payload.dream ?? "").slice(0, 2000);
      const lotteryMax = Number(payload.maxNumber ?? 50);
      const count = Number(payload.count ?? 6);
      if (!dream) return json({ error: "DREAM_REQUIRED" }, 400);

      const resp = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a dream symbol interpreter. Given a dream description, identify key symbols, give a brief interpretation, and suggest lucky numbers between 1 and the given max. Return ONLY valid JSON: { \"symbols\": string[], \"interpretation\": string, \"numbers\": number[] }. Numbers must be unique and within range.",
            },
            { role: "user", content: `Dream: ${dream}\nMax number: ${lotteryMax}\nHow many numbers: ${count}` },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (resp.status === 429) return json({ error: "RATE_LIMITED" }, 429);
      if (resp.status === 402) return json({ error: "AI_CREDITS_EXHAUSTED" }, 402);
      if (!resp.ok) return json({ error: "AI_ERROR", details: await resp.text() }, 500);
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content ?? "{}";
      let parsed: any = {};
      try { parsed = JSON.parse(content); } catch { parsed = { interpretation: content, numbers: [], symbols: [] }; }
      const nums: number[] = (parsed.numbers ?? []).filter((n: number) => Number.isInteger(n) && n >= 1 && n <= lotteryMax).slice(0, count);
      while (nums.length < count) {
        const r = Math.floor(Math.random() * lotteryMax) + 1;
        if (!nums.includes(r)) nums.push(r);
      }
      output = { symbols: parsed.symbols ?? [], interpretation: parsed.interpretation ?? "", numbers: nums };

      await admin.from("lottery_dream_decoder").insert({
        user_id: user.id,
        dream_text: dream,
        symbols: output.symbols,
        interpretation: output.interpretation,
        suggested_numbers: output.numbers,
        lottery_type: payload.lotteryType ?? null,
        credits_used: cost,
      });
    } else if (feature === "numerology") {
      const fullName = String(payload.fullName ?? "").trim();
      const birthDate = String(payload.birthDate ?? "");
      const lotteryMax = Number(payload.maxNumber ?? 50);
      if (!fullName || !birthDate) return json({ error: "FIELDS_REQUIRED" }, 400);

      const reduce = (n: number): number => {
        while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
          n = String(n).split("").reduce((a, b) => a + parseInt(b, 10), 0);
        }
        return n;
      };
      const lifePath = reduce(birthDate.replace(/\D/g, "").split("").reduce((a, b) => a + parseInt(b, 10), 0));
      const letterMap: Record<string, number> = {
        a:1,j:1,s:1, b:2,k:2,t:2, c:3,l:3,u:3, d:4,m:4,v:4, e:5,n:5,w:5,
        f:6,o:6,x:6, g:7,p:7,y:7, h:8,q:8,z:8, i:9,r:9,
      };
      const isVowel = (c: string) => "aeiou".includes(c);
      const letters = fullName.toLowerCase().replace(/[^a-z]/g, "").split("");
      const destiny = reduce(letters.reduce((s, c) => s + (letterMap[c] ?? 0), 0));
      const soul = reduce(letters.filter(isVowel).reduce((s, c) => s + (letterMap[c] ?? 0), 0));

      const seedNums = [lifePath, destiny, soul, ...birthDate.replace(/\D/g, "").split("").map(Number)];
      const lucky: number[] = [];
      for (const s of seedNums) {
        const candidate = ((s * 7 + lucky.length * 13) % lotteryMax) + 1;
        if (!lucky.includes(candidate)) lucky.push(candidate);
        if (lucky.length >= 6) break;
      }
      while (lucky.length < 6) {
        const c = Math.floor(Math.random() * lotteryMax) + 1;
        if (!lucky.includes(c)) lucky.push(c);
      }

      const resp = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You are a numerology reader. Provide a short, encouraging 4-sentence reading. No medical or financial advice." },
            { role: "user", content: `Name: ${fullName}\nBirth: ${birthDate}\nLife Path: ${lifePath}\nDestiny: ${destiny}\nSoul: ${soul}` },
          ],
        }),
      });
      if (resp.status === 429) return json({ error: "RATE_LIMITED" }, 429);
      if (resp.status === 402) return json({ error: "AI_CREDITS_EXHAUSTED" }, 402);
      const reading = resp.ok ? (await resp.json()).choices?.[0]?.message?.content ?? "" : "Numerology reading unavailable.";
      const powerDays = ["Monday", "Wednesday", "Friday"];
      output = { life_path_number: lifePath, destiny_number: destiny, soul_number: soul, lucky_numbers: lucky, power_days: powerDays, reading };

      await admin.from("lottery_numerology").insert({
        user_id: user.id, full_name: fullName, birth_date: birthDate,
        life_path_number: lifePath, destiny_number: destiny, soul_number: soul,
        lucky_numbers: lucky, power_days: powerDays, reading, credits_used: cost,
      });
    } else if (feature === "heatmap_analysis") {
      const lotteryType = String(payload.lotteryType ?? "eurojackpot");
      const maxNumber = Number(payload.maxNumber ?? 50);
      const { data: recent } = await admin
        .from("lottery_generations")
        .select("main_numbers, bonus_numbers")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      const freq: Record<number, number> = {};
      for (let i = 1; i <= maxNumber; i++) freq[i] = 0;
      const pairs: Record<string, number> = {};
      (recent ?? []).forEach((g: any) => {
        const nums: number[] = g.main_numbers ?? [];
        nums.forEach((n) => { if (freq[n] !== undefined) freq[n] += 1; });
        for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) {
          const k = `${Math.min(nums[i], nums[j])}-${Math.max(nums[i], nums[j])}`;
          pairs[k] = (pairs[k] ?? 0) + 1;
        }
      });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      const hot = sorted.slice(0, 8).map(([n]) => Number(n));
      const cold = sorted.slice(-8).map(([n]) => Number(n)).reverse();
      const topPairs = Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 10);

      output = { hot_numbers: hot, cold_numbers: cold, frequency_data: freq, pair_affinity: Object.fromEntries(topPairs), sample_size: recent?.length ?? 0 };
      await admin.from("lottery_heatmap_snapshots").insert({
        user_id: user.id, lottery_type: lotteryType,
        hot_numbers: hot, cold_numbers: cold, frequency_data: freq, pair_affinity: Object.fromEntries(topPairs),
      });
    }

    // Atomic credit deduction (race-safe)
    const { error: deductError } = await admin.rpc("deduct_ai_credits", {
      p_user_id: user.id,
      p_amount: cost,
    });
    if (deductError) {
      console.error("Credit deduction failed:", deductError);
      return json({ error: "DEDUCTION_FAILED", message: deductError.message }, 500);
    }

    const { data: after } = await admin
      .from("ai_credits")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    return json({ feature, output, credits_remaining: after?.credits_remaining ?? 0 });
  } catch (e: any) {
    console.error("lottery-tuning-ai error:", e);
    return json({ error: "INTERNAL_ERROR", message: e?.message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
