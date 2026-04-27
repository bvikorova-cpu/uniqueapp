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
  const content = data.choices?.[0]?.message?.content || "";
  try { return JSON.parse(content); } catch { return { result: content }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { action, symbol, context, experience, goal, dreams, moods, sleepHours, quality, wakeUps, notes, duration, sleepGoal, challenges, dreamTheme, mood, ...params } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("API key not configured");
    let result: any;
    switch (action) {
      case "dictionary":
        result = await callOpenAI(apiKey, [
          { role: "system", content: "You are a world-class dream analyst combining Jungian psychology, Freudian analysis, cultural mythology, and modern neuroscience. Provide comprehensive dream symbol interpretations with: Universal Meaning, Psychological Analysis, Cultural Variations, Emotional Significance, Personal Context Analysis, Common Dream Scenarios, Shadow Aspect, Action Guidance, Related Symbols. Use markdown." },
          { role: "user", content: `Interpret this dream symbol: "${symbol}"${context ? `. Personal context: "${context}"` : ""}` }
        ]);
        break;
      case "lucid-coach":
        result = await callOpenAI(apiKey, [
          { role: "system", content: "You are an expert lucid dreaming coach. Provide: Reality Check Techniques, MILD/WILD Techniques, Dream Journal Tips, Sleep Hygiene, Tonight's Exercise, Weekly Plan. Use markdown." },
          { role: "user", content: `Experience level: ${experience}\nGoal/Dream: ${goal}` },
        ]);
        break;
      case "mood-correlation":
        result = await callOpenAI(apiKey, [
          { role: "system", content: "You are a dream psychology data analyst. Analyze dream-mood correlations. Provide: Correlation Overview, Mood→Dream Mapping, Stress Impact, Positive/Negative Patterns, Temporal Patterns, Recurring Themes, Predictive Insights, Recommendations, Wellness Score. Use markdown." },
          { role: "user", content: `Analyze correlations:\nDREAM ENTRIES:\n${JSON.stringify(dreams || [], null, 2)}\nMOOD RECORDS:\n${JSON.stringify(moods || [], null, 2)}` }
        ]);
        break;
      case "pattern-analysis":
        result = await callOpenAI(apiKey, [
          { role: "system", content: "You are an expert dream analyst for pattern recognition. Provide: Recurring Themes, Emotional Arc, Symbol Dictionary, Dream Connections, Psychological Insights, Predictive Patterns, Recommendations. Use markdown." },
          { role: "user", content: `Analyze these ${(dreams || []).length} dreams for patterns:\n\n${(dreams || []).map((d: any) => `${d.title || "Dream"}: ${d.description || d.content || ""}`).join("\n\n")}` },
        ]);
        break;
      case "sleep-analyzer":
        result = await callOpenAI(apiKey, [
          { role: "system", content: "You are an expert sleep scientist. Provide: Sleep Score (1-100), Analysis, Sleep Architecture, Issues, Improvement Plan, Optimal Schedule, Dream Enhancement tips. Use markdown." },
          { role: "user", content: `Sleep Data:\n- Hours: ${sleepHours}\n- Quality: ${quality}\n- Night wake-ups: ${wakeUps}\n- Notes: ${notes || "None"}` },
        ]);
        break;
      case "sleep-ritual":
        result = await callOpenAI(apiKey, [
          { role: "system", content: "You are a sleep scientist and meditation expert. Create personalized bedtime rituals with: Ritual Overview, Environment Setup, Step-by-Step Timeline, Breathing Exercises, Body Scan, Visualization, Sleep Affirmations, Wake-Up Protocol, Weekly Progression, Scientific References. Use markdown." },
          { role: "user", content: `Create a ${duration}-minute bedtime ritual for goal: "${sleepGoal}".${challenges ? ` Sleep challenges: "${challenges}"` : ""}` }
        ]);
        break;
      case "soundscapes":
        result = await callOpenAI(apiKey, [
          { role: "system", content: "You are an expert sound designer. Create dream-inspired ambient soundscapes with: Soundscape Name, Core Layers, Binaural Beat Prescription, Guided Visualization Script, Listening Schedule, Science, DIY Tips. Use markdown." },
          { role: "user", content: `Create a dream soundscape for theme: "${dreamTheme}". Desired mood: ${mood}.` }
        ]);
        break;
      case "visualizer":
        result = await callOpenAI(apiKey, [
          { role: "system", content: "You are a dream visualization expert. Create a vivid visual description of the dream that could be used as an art prompt. Include colors, atmosphere, key imagery, and emotional tone. Use markdown." },
          { role: "user", content: `Visualize this dream: ${params.dreamDescription || ""}` }
        ]);
        break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
