import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { requireAiCredits } from "../_shared/credit-check.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const __auth = await requireAiCredits(req, corsHeaders, { credits: 1, usageType: "job_matcher" });
    if (__auth.errorResponse) return __auth.errorResponse;
    const __deduct = __auth.deduct!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { cvText } = await req.json();

    if (!cvText) {
      return new Response(
        JSON.stringify({ error: "CV text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch active job listings
    const { data: jobs, error: jobsError } = await supabaseClient
      .from("job_listings")
      .select("id, title, company, category, job_type, location, salary_min, salary_max, description, requirements")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50);

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch job listings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No active job listings available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an expert career advisor and job matching assistant. Analyze the provided CV and match it with the available job listings. For each relevant job, provide:
1. A match score (0-100)
2. Key reasons why this job matches the candidate
3. Any gaps or missing qualifications
4. Specific recommendations

Focus on skills, experience, education, and career goals. Be honest about fit.`;

    const userPrompt = `CV/Resume:
${cvText}

Available Job Listings:
${jobs.map((job, idx) => `
Job ${idx + 1}:
- ID: ${job.id}
- Title: ${job.title}
- Company: ${job.company}
- Category: ${job.category}
- Type: ${job.job_type}
- Location: ${job.location}
- Salary: ${job.salary_min ? `€${job.salary_min}` : 'N/A'} - ${job.salary_max ? `€${job.salary_max}` : 'N/A'}
- Description: ${job.description}
- Requirements: ${job.requirements}
`).join('\n---\n')}

Analyze the CV and provide job matches as a JSON array with this structure:
{
  "matches": [
    {
      "jobId": "uuid",
      "score": 85,
      "reasons": ["reason 1", "reason 2"],
      "gaps": ["gap 1"],
      "recommendation": "short recommendation text"
    }
  ]
}

Return only the top 10 most relevant matches, sorted by score (highest first). Only include jobs with score >= 50.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "match_jobs",
            description: "Match CV with job listings",
            parameters: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      jobId: { type: "string" },
                      score: { type: "number" },
                      reasons: {
                        type: "array",
                        items: { type: "string" }
                      },
                      gaps: {
                        type: "array",
                        items: { type: "string" }
                      },
                      recommendation: { type: "string" }
                    },
                    required: ["jobId", "score", "reasons", "recommendation"]
                  }
                }
              },
              required: ["matches"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "match_jobs" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices[0].message.tool_calls[0];
    const result = JSON.parse(toolCall.function.arguments);

    // Enrich matches with full job data
    const enrichedMatches = result.matches.map((match: any) => {
      const job = jobs.find(j => j.id === match.jobId);
      return {
        ...match,
        job: job || null
      };
    }).filter((m: any) => m.job !== null);

    await __deduct().catch((e) => console.error("deduct failed:", e));
    return new Response(
      JSON.stringify({ matches: enrichedMatches }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
