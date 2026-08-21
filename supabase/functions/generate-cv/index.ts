import "../_shared/aiRedirect.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { askAI } from "../_shared/unifiedAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CREDITS = 5;

const TEMPLATE_HINTS: Record<string, string> = {
  modern:
    "Modern template: crisp headline under the name, a short punchy summary, skills grouped into 2-3 labelled clusters, achievement-first experience bullets.",
  classic:
    "Classic template: conservative and formal, full sentences in the summary, chronological experience with role/company/dates on one line, no buzzwords.",
  minimal:
    "Minimal template: very concise, max 2 bullets per role, short skill list as a single comma-free bullet line, no fluff, one page worth of content.",
  creative:
    "Creative template: expressive voice, a one-line personal tagline after the name, sections may include Projects and Highlights, still ATS-safe headings.",
  executive:
    "Executive template: leadership framing, opens with an Executive Summary and a Key Achievements section with quantified business impact, then experience.",
  academic:
    "Academic template: emphasis on Education, Research, Publications and Teaching sections before work experience.",
};

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
    const extraNotes: string = (body.extraNotes || "").toString().slice(0, 4000);
    const template: string = (body.template || "modern").toString().slice(0, 30).toLowerCase();
    const personal = (body.personal ?? {}) as Record<string, string>;
    const pick = (k: string) => (personal[k] || "").toString().slice(0, 200);

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

    const fullName = pick("fullName") || profile?.full_name || "";
    const email = pick("email") || profile?.email || "";
    const phone = pick("phone");
    const location = pick("location") || profile?.location || "";
    const links = pick("links") || profile?.website || "";
    const headline = pick("headline") || profile?.headline || profile?.occupation || "";

    const hasSource =
      skills.length > 0 ||
      (Array.isArray(experience) && experience.length > 0) ||
      (Array.isArray(education) && education.length > 0) ||
      !!profile?.bio ||
      !!profile?.occupation ||
      !!headline ||
      (!!fullName && (!!email || !!location || extraNotes.length > 0)) ||
      extraNotes.length > 20;

    if (!hasSource) {
      return new Response(
        JSON.stringify({
          error: "no_source_data",
          message:
            "Fill in the Personal info fields (at least your name plus email or location) and describe your background in the notes field, or save a CV in 'My CVs' first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const dataBlock = `Full name: ${fullName || "Not provided"}
Professional headline: ${headline || "Not provided"}
Location: ${location || "Not provided"}
Contact email: ${email || "Not provided"}
Phone: ${phone || "Not provided"}
Links (portfolio / LinkedIn / website): ${links || "Not provided"}
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
Style: ${TEMPLATE_HINTS[template] || TEMPLATE_HINTS.modern}

Structure (use "## " for every section heading so sections can be edited separately):
# Name
Contact line (location, email, phone, links) — only what is available
## Professional Summary
## Key Skills
## Work Experience
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
        template,
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
