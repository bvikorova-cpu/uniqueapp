// Real AI personality battle: your clone vs a random clone from another user on the platform.
// Generates a round-by-round transcript, judge scores and a winner via Lovable AI Gateway.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOPICS = [
  "Is it better to be brutally honest or kindly diplomatic?",
  "Coffee or chaos: what actually fuels great ideas?",
  "Would you rather be famous or free?",
  "Should AI clones be allowed to date on your behalf?",
  "What matters more: talent or relentless consistency?",
  "Is nostalgia a superpower or a trap?",
  "Money, meaning, or mischief - pick one to live by.",
  "Do the best decisions come from the gut or the spreadsheet?",
];

const WILD_RIVALS = [
  { name: "Nova", persona: "A fearless optimist who turns every argument into a pep talk.", tone: "warm, punchy" },
  { name: "Vex", persona: "A dry, sarcastic realist who wins by asking uncomfortable questions.", tone: "deadpan" },
  { name: "Echo", persona: "A poetic thinker who reframes debates into metaphors.", tone: "lyrical" },
  { name: "Kairo", persona: "A hyper-logical strategist obsessed with data and odds.", tone: "clinical, confident" },
  { name: "Luma", persona: "A playful chaos-agent who wins by charm and surprise.", tone: "mischievous" },
];

const j = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function describe(clone: any) {
  const p = clone?.personality_data ?? {};
  const bits = [p.personality, p.tone, p.traits, p.style, p.summary]
    .filter((x: unknown) => typeof x === "string" && x.trim())
    .join(" | ");
  return bits || "A curious, quick-witted personality.";
}

function fallbackBattle(a: string, b: string, topic: string) {
  const rounds = [
    { round: 1, a: `${a}: I'll keep it simple - on "${topic}" I trust instinct that has been trained by experience.`, b: `${b}: Instinct is just fast guessing. I'd rather be right slowly than confident quickly.` },
    { round: 2, a: `${a}: Being right slowly is how you miss the moment entirely.`, b: `${b}: And rushing is how you end up apologising twice.` },
    { round: 3, a: `${a}: Fine - then let's agree the winner is whoever acts and adjusts fastest.`, b: `${b}: Adjusting is my whole personality. I'll take that deal.` },
  ];
  return { rounds, userScore: 50 + Math.floor(Math.random() * 10), opponentScore: 50 + Math.floor(Math.random() * 10) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return j({ error: "No auth" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: { user } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return j({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const requestedTopic: string | undefined = typeof body?.topic === "string" && body.topic.trim() ? body.topic.trim().slice(0, 160) : undefined;
    const requestedOpponent: string | undefined = typeof body?.opponentCloneId === "string" ? body.opponentCloneId : undefined;

    const { data: mine } = await admin
      .from("personality_clones")
      .select("id, clone_name, personality_data")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!mine?.length) return j({ error: "Create an active clone first to enter the arena." }, 400);
    const myClone = mine[0];

    // Random real opponent from another user on the platform.
    let opponent: any = null;
    if (requestedOpponent) {
      const { data } = await admin
        .from("personality_clones")
        .select("id, user_id, clone_name, personality_data")
        .eq("id", requestedOpponent)
        .neq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      opponent = data;
    }
    if (!opponent) {
      const { data: pool } = await admin
        .from("personality_clones")
        .select("id, user_id, clone_name, personality_data")
        .neq("user_id", user.id)
        .eq("is_active", true)
        .limit(100);
      if (pool?.length) opponent = pool[Math.floor(Math.random() * pool.length)];
    }
    // No real rival on the platform yet -> stage a wild AI challenger so the arena still works.
    let isWildRival = false;
    if (!opponent) {
      isWildRival = true;
      const wild = WILD_RIVALS[Math.floor(Math.random() * WILD_RIVALS.length)];
      opponent = {
        id: null,
        user_id: null,
        clone_name: wild.name,
        personality_data: { personality: wild.persona, tone: wild.tone },
      };
    }

    let opponentOwner = isWildRival ? "Wild challenger" : "Another creator";
    if (opponent.user_id) {
      const { data: prof } = await admin
        .from("profiles")
        .select("full_name, username")
        .eq("id", opponent.user_id)
        .maybeSingle();
      opponentOwner = prof?.full_name || prof?.username || opponentOwner;
    }

    const topic = requestedTopic ?? TOPICS[Math.floor(Math.random() * TOPICS.length)];

    let rounds: any[] = [];
    let userScore = 0;
    let opponentScore = 0;
    let verdict = "";

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey) {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [
              {
                role: "system",
                content:
                  "You stage a witty 3-round personality duel between two AI clones and judge it. " +
                  "Reply with STRICT JSON only, no markdown fences, shape: " +
                  '{"rounds":[{"round":1,"a":"<clone A line>","b":"<clone B line>"}],"userScore":0-100,"opponentScore":0-100,"verdict":"2 sentence judge summary"}. ' +
                  "Each line must start with the clone name followed by a colon, be 1-2 sentences, stay in character, be playful and clean. Scores must differ.",
              },
              {
                role: "user",
                content:
                  `Topic: ${topic}\n` +
                  `Clone A: ${myClone.clone_name} - ${describe(myClone)}\n` +
                  `Clone B: ${opponent.clone_name} (owned by ${opponentOwner}) - ${describe(opponent)}\n` +
                  "Write 3 rounds and judge them.",
              },
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const raw = String(data?.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
          if (Array.isArray(parsed?.rounds) && parsed.rounds.length) {
            rounds = parsed.rounds.slice(0, 5);
            userScore = Number(parsed.userScore) || 0;
            opponentScore = Number(parsed.opponentScore) || 0;
            verdict = String(parsed.verdict ?? "");
          }
        }
      } catch (_e) {
        // fall through to deterministic fallback below
      }
    }

    if (!rounds.length) {
      const fb = fallbackBattle(myClone.clone_name, opponent.clone_name, topic);
      rounds = fb.rounds;
      userScore = fb.userScore;
      opponentScore = fb.opponentScore;
      verdict = "A tight duel decided on delivery rather than substance.";
    }
    if (userScore === opponentScore) opponentScore = Math.max(0, opponentScore - 3);

    const winnerSide = userScore >= opponentScore ? "user" : "opponent";
    const winnerName = winnerSide === "user" ? myClone.clone_name : opponent.clone_name;
    const analysis =
      rounds.map((r: any) => `Round ${r.round}\n${r.a}\n${r.b}`).join("\n\n") +
      (verdict ? `\n\nJudge: ${verdict}` : "");

    await admin.from("clone_battles").insert({
      user_id: user.id,
      user_clone_id: myClone.id,
      opponent_clone_id: opponent.id,
      opponent_user_id: opponent.user_id ?? null,
      winner: winnerSide,
      user_clone_name: myClone.clone_name,
      opponent_clone_name: opponent.clone_name,
      topic,
      user_score: userScore,
      opponent_score: opponentScore,
      transcript: rounds,
      analysis,
    });

    return j({
      winner: winnerName,
      winnerSide,
      analysis,
      verdict,
      topic,
      rounds,
      userScore,
      opponentScore,
      myClone: { id: myClone.id, name: myClone.clone_name },
      opponent: {
        id: opponent.id,
        name: opponent.clone_name,
        userId: opponent.user_id ?? null,
        owner: opponentOwner,
      },
    });
  } catch (e) {
    return j({ error: (e as Error).message ?? "Battle failed" }, 500);
  }
});
