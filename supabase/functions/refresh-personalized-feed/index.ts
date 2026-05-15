import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: uerr } = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    ).auth.getUser();
    if (uerr || !user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Load candidate prefs / search profile / resume
    const { data: prefs } = await supabase.from('candidate_search_profiles').select('*').eq('user_id', user.id).maybeSingle();
    const { data: resume } = await supabase.from('candidate_resumes').select('parsed_skills, years_experience').eq('user_id', user.id).eq('is_primary', true).maybeSingle();

    const userSkills: string[] = [
      ...((prefs?.skills ?? []) as string[]),
      ...((resume?.parsed_skills ?? []) as string[]),
    ].map((s: string) => String(s).toLowerCase());

    const { data: jobs } = await supabase.from('job_listings').select('id, title, requirements, is_remote, location, salary_max, industry').eq('is_active', true).order('created_at', { ascending: false }).limit(200);

    const scored = (jobs ?? []).map((j: any) => {
      let score = 0;
      const reasons: string[] = [];
      const reqText = ((j.requirements || '') + ' ' + (j.title || '')).toLowerCase();
      const matched = userSkills.filter(s => s && reqText.includes(s));
      if (matched.length) { score += matched.length * 10; reasons.push(`${matched.length} matching skills`); }
      if (prefs?.remote_ok && j.is_remote) { score += 15; reasons.push('remote'); }
      if (prefs?.desired_location && j.location?.toLowerCase().includes(prefs.desired_location.toLowerCase())) { score += 10; reasons.push('location'); }
      if (prefs?.desired_salary_min && j.salary_max && j.salary_max >= prefs.desired_salary_min) { score += 10; reasons.push('salary'); }
      return { job_id: j.id, score, reason: reasons.join(', ') };
    }).filter((x: any) => x.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, 50);

    // Replace cache
    await supabase.from('personalized_job_feed_cache').delete().eq('user_id', user.id);
    if (scored.length) {
      await supabase.from('personalized_job_feed_cache').insert(scored.map((s: any) => ({ ...s, user_id: user.id })));
    }

    return new Response(JSON.stringify({ ok: true, count: scored.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
