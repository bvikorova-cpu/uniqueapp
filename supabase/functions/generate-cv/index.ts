import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { askAI } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDITS = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireAiCredits(req, corsHeaders, {
      credits: CREDITS,
      usageType: "jobs_cv_generator",
      description: "AI CV Generator (auto-build from profile)",
    });
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase, deduct } = auth;

    const body = await req.json().catch(() => ({}));
    const targetRole: string = (body.targetRole || "").toString().slice(0, 120);
    const tone: string = (body.tone || "professional").toString().slice(0, 40);
    const language: string = (body.language || "English").toString().slice(0, 40);
    const extraNotes: string = (body.extraNotes || "").toString().slice(0, 2000);

    // ---- Collect the user's real data ----
    const [{ data: profile }, { data: resumes }] = await Promise.all([
      supabase!
        .from("profiles")
        .select("full_name, headline, occupation, bio, location, languages, email, website, company_name")
        .eq("id", user!.id)
        .maybeSingle(),
      supabase!
        .from("candidate_resumes")
        .select("parsed_skills, parsed_experience, parsed_education, parsed_summary, years_experience, is_primary, created_at")
        .eq("user_id", user!.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    const cv = resumes?.[0] as Record<string, unknown> | undefined;

    const skills: string[] = Array.isArray(cv?.parsed_skills) ? (cv!.parsed_skills as string[]) : [];
    const experience = cv?.parsed_experience ?? [];
    const education = cv?.parsed_education ?? [];

    const hasSource =
      skills.length > 0 ||
      (Array.isArray(experience) && experience.length > 0) ||
      (Array.isArray(education) && education.length > 0) ||
      !!profile?.bio ||
      !!profile?.occupation ||
      extraNotes.length > 20;

    if (!hasSource) {
      return new Response(
        JSON.stringify({
          error: "no_source_data",
          message:
            "We could not find enough data to build your CV. Add skills and experience in your profile or save a CV in 'My CVs' first, or describe your background in the notes field.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const dataBlock = `Full name: ${profile?.full_name || "Not provided"}
Headline: ${profile?.headline || "Not provided"}
Current occupation: ${profile?.occupation || "Not provided"}
Location: ${profile?.location || "Not provided"}
Contact email: ${profile?.email || "Not provided"}
Languages: ${(profile?.languages || []).join(", ") || "Not provided"}
About / bio: ${profile?.bio || "Not provided"}
Years of experience: ${cv?.years_experience ?? "Not provided"}
Existing summary: ${cv?.parsed_summary || "Not provided"}
Skills: ${skills.join(", ") || "Not provided"}
Work experience (JSON): ${JSON.stringify(experience).slice(0, 4000)}
Education (JSON): ${JSON.stringify(education).slice(0, 2000)}
Additional notes from the user: ${extraNotes || "None"}`;

    const system =
      "You are an elite CV writer and ATS optimization specialist. You build complete, hire-ready CVs from a candidate's real data. Never invent employers, degrees, dates or certifications that are not in the data — if something is missing, omit the section or write a clearly marked placeholder in square brackets. Output clean markdown only, no commentary before or after.";

    const userPrompt = `Write a complete, ATS-optimized CV in ${language} using the candidate data below.
Target role: ${targetRole || "best fit based on the data"}
Tone: ${tone}

Structure:
# Name
Contact line (location, email, languages) — only what is available
## Professional Summary (3-4 sentences, tailored to the target role)
## Key Skills (grouped, bullet list)
## Work Experience (reverse-chronological, each role with 2-4 achievement bullets using strong action verbs and quantified impact where the data allows)
## Education
## Languages
## Additional (certifications, projects) — only if data exists

CANDIDATE DATA:
${dataBlock}`;

    const markdown = await askAI(system, userPrompt, { max_tokens: 3000, tier: "cheap" });
    if (!markdown || markdown.trim().length < 100) throw new Error("AI returned an empty CV");

    await deduct!().catch((e) => console.error("[generate-cv] deduct failed:", e));

    return new Response(
      JSON.stringify({
        success: true,
        markdown,
        creditsUsed: CREDITS,
        sourceUsed: {
          skills: skills.length,
          experience: Array.isArray(experience) ? experience.length : 0,
          education: Array.isArray(education) ? education.length : 0,
          profile: !!profile,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[generate-cv] error:", (e as Error).message);
    return new Response(
      JSON.stringify({ error: (e as Error).message || "CV generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
