import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callOpenAI(apiKey: string, messages: any[]) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  });
  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const data = await response.json();
  const tc = data.choices?.[0]?.message?.tool_calls?.[0];
  if (tc) { try { return JSON.parse(tc.function.arguments); } catch { return { result: tc.function.arguments }; } }
  const content = data.choices?.[0]?.message?.content || "";
  try { return JSON.parse(content); } catch { return { result: content }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    let result: any;
    switch (action) {
      case "dictionary":
        result = await callOpenAI(apiKey, [
          {
            role: "system",
            content: `You are a world-class dream analyst combining Jungian psychology, Freudian analysis, cultural mythology, and modern neuroscience. Provide comprehensive, personalized dream symbol interpretations.

For each symbol, provide:
1. **Universal Meaning** - Cross-cultural significance
2. **Psychological Analysis** (Jungian & Freudian perspectives)
3. **Cultural Variations** - How different cultures interpret this symbol
4. **Emotional Significance** - What emotions this symbol typically represents
5. **Personal Context Analysis** - Based on the user's provided context
6. **Common Dream Scenarios** with this symbol and their meanings
7. **Shadow Aspect** - What this symbol might reveal about suppressed aspects
8. **Action Guidance** - What this dream symbol might be telling you to do in waking life
9. **Related Symbols** - Other symbols often appearing alongside this one

Be insightful, empathetic, and avoid generic interpretations. Use markdown formatting.`
          },
          {
            role: "user",
            content: `Interpret this dream symbol: "${params.symbol}"${context ? `. Personal context: "${params.context}"` : ""}`
          }
        ]);
        break;
      case "lucid-coach":
        result = await callOpenAI(apiKey, [
          {
            role: "system",
            content: `You are an expert lucid dreaming coach with knowledge of neuroscience, sleep psychology, and meditation techniques. Provide personalized, actionable coaching plans for lucid dreaming based on the user's experience level. Include:
1. **Reality Check Techniques** — 3 specific reality checks to practice daily
2. **MILD/WILD Techniques** — Step-by-step technique based on experience level
3. **Dream Journal Tips** — How to improve dream recall
4. **Sleep Hygiene** — Optimal conditions for lucid dreaming
5. **Tonight's Exercise** — A specific exercise to try tonight
6. **Weekly Plan** — 7-day progressive training schedule
Use markdown formatting. Be encouraging and practical.`
          },
          { role: "user", content: `Experience level: ${params.experience}\nGoal/Dream: ${params.goal}` },
        ]);
        break;
      case "mood-correlation":
        result = await callOpenAI(apiKey, [
          {
            role: "system",
            content: `You are a data analyst specializing in dream psychology and mood correlation research. Analyze the user's dream journal entries alongside their mood tracking data to find meaningful patterns and connections.

Provide:
1. **Correlation Overview** - Summary of key dream-mood connections found
2. **Mood → Dream Mapping** - Which moods tend to produce which dream themes
3. **Stress Impact Analysis** - How stress levels affect dream content
4. **Positive Mood Patterns** - Dreams associated with positive emotional states
5. **Negative Mood Patterns** - Dreams associated with negative emotional states
6. **Temporal Patterns** - Time-based correlations (day of week, seasonal)
7. **Recurring Theme Analysis** - Symbols that appear during specific emotional states
8. **Predictive Insights** - Based on current mood trends, what dreams to expect
9. **Actionable Recommendations** - How to use mood management for better dreams
10. **Wellness Score** - Overall dream-mood harmony rating

Use markdown formatting with clear sections.`
          },
          {
            role: "user",
            content: `Analyze these dream entries and mood records for correlations:\n\nDREAM ENTRIES:\n${JSON.stringify(dreams, null, 2)}\n\nMOOD RECORDS:\n${JSON.stringify(moods, null, 2)}`
          }
        ]);
        break;
      case "pattern-analysis":
        result = await callOpenAI(apiKey, [
          {
            role: "system",
            content: `You are an expert dream analyst specializing in pattern recognition across dream series. Analyze the collection of dreams and provide:
1. **Recurring Themes** — Patterns that appear across multiple dreams
2. **Emotional Arc** — How the emotional landscape evolves over time
3. **Symbol Dictionary** — Key recurring symbols and their evolving meanings
4. **Dream Connections** — How dreams relate to and reference each other
5. **Psychological Insights** — What these patterns reveal about the dreamer's inner world
6. **Predictive Patterns** — What themes might appear in future dreams
7. **Recommendations** — Actions based on the patterns discovered
Use markdown formatting with clear sections.`
          },
          { role: "user", content: `Analyze these ${dreams.length} dreams for patterns:\n\n${dreamSummary}` },
        ]);
        break;
      case "sleep-analyzer":
        result = await callOpenAI(apiKey, [
          {
            role: "system",
            content: `You are an expert sleep scientist and wellness coach. Analyze sleep data and provide personalized recommendations. Include:
1. **Sleep Score** — Rate 1-100 based on the data
2. **Analysis** — What the sleep metrics indicate
3. **Sleep Architecture** — Likely sleep stage distribution
4. **Issues Identified** — Problems affecting sleep quality
5. **Improvement Plan** — 5 specific, actionable tips
6. **Optimal Schedule** — Suggested bedtime and wake time
7. **Dream Enhancement** — How to improve dream recall and vividness
Use markdown formatting. Be scientific but accessible.`
          },
          {
            role: "user",
            content: `Sleep Data:\n- Hours: ${params.sleepHours}\n- Quality: ${params.quality}\n- Night wake-ups: ${params.wakeUps}\n- Notes: ${notes || "None"}`,
          },
        ]);
        break;
      case "sleep-ritual":
        result = await callOpenAI(apiKey, [
          {
            role: "system",
            content: `You are a sleep scientist and meditation expert. Create personalized, evidence-based bedtime rituals that combine multiple modalities for optimal sleep and dream quality.

Structure the ritual as a minute-by-minute guide including:
1. **Ritual Overview** - Name, duration, and expected benefits
2. **Environment Setup** (lighting, temperature, scent recommendations)
3. **Step-by-Step Timeline** - Detailed minute-by-minute activities
4. **Breathing Exercises** - Specific patterns (4-7-8, box breathing, etc.)
5. **Body Scan Meditation** - Customized progressive relaxation script
6. **Visualization Exercise** - Dream incubation technique
7. **Sleep Affirmations** - 5-7 personalized affirmations
8. **Wake-Up Protocol** - How to capture dreams upon waking
9. **Weekly Progression** - How to evolve the ritual over 4 weeks
10. **Scientific References** - Brief citations for each technique

Make it practical, calming, and scientifically grounded.`
          },
          {
            role: "user",
            content: `Create a ${params.duration}-minute bedtime ritual for goal: "${params.sleepGoal}".${challenges ? ` Sleep challenges: "${params.challenges}"` : ""}`
          }
        ]);
        break;
      case "soundscapes":
        result = await callOpenAI(apiKey, [
          {
            role: "system",
            content: `You are an expert sound designer and sleep scientist specializing in dream-inspired ambient soundscapes. Create detailed, personalized soundscape recipes that users can recreate using free tools or apps.

For each soundscape, provide:
1. **Soundscape Name** - A poetic title
2. **Core Layers** (3-5 ambient layers with specific descriptions, volume ratios, and recommended apps/tools)
3. **Binaural Beat Prescription** - Specific frequencies for the desired state (theta 4-8Hz for dreaming, delta 0.5-4Hz for deep sleep)
4. **Guided Visualization Script** - A 5-minute script to accompany the soundscape
5. **Recommended Listening Schedule** - When and how to listen
6. **Science Behind It** - Brief explanation of how each element affects sleep/dreams
7. **DIY Recreation Tips** - How to create similar sounds at home

Format with clear markdown headers and make it actionable.`
          },
          {
            role: "user",
            content: `Create a dream soundscape for this dream theme: "${params.dreamTheme}". Desired mood: ${params.mood}. Make it deeply immersive and scientifically grounded.`
          }
        ]);
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});