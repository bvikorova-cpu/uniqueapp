// Generates a sequence of scene keyframe images via OpenAI gpt-image-1
// (used as "real video" via animated frame sequencer in the client).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const COST = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Not authenticated');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Not authenticated');

    const { scenes, aspectRatio } = await req.json();
    if (!Array.isArray(scenes) || scenes.length < 1 || scenes.length > 8) {
      return new Response(JSON.stringify({ error: 'scenes must be 1-8 prompts' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: adminRole } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    const isAdmin = !!adminRole;
    let prevCredits = 0;
    let refundOnError = false;
    if (!isAdmin) {
      const { data: credits } = await supabase.from('video_ad_credits').select('credits_remaining').eq('user_id', user.id).maybeSingle();
      if (!credits || credits.credits_remaining < COST) {
        return new Response(JSON.stringify({ error: 'Insufficient credits' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      prevCredits = credits.credits_remaining;
      await supabase.from('video_ad_credits').update({ credits_remaining: prevCredits - COST }).eq('user_id', user.id);
      refundOnError = true;
    }
    const refund = async () => { if (refundOnError) { try { await supabase.from('video_ad_credits').update({ credits_remaining: prevCredits }).eq('user_id', user.id); } catch (_) {} } };

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) { await refund(); throw new Error('OPENAI_API_KEY not configured'); }

    const size = aspectRatio === '9:16' ? '1024x1536' : aspectRatio === '1:1' ? '1024x1024' : '1536x1024';

    const frames: { prompt: string; b64: string }[] = [];
    for (const sceneText of scenes) {
      try {
        const r = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: `Cinematic video ad scene, professional advertising photography, high quality: ${sceneText}`,
            size,
            quality: 'medium',
            n: 1,
          }),
        });
        if (!r.ok) {
          const errTxt = await r.text();
          throw new Error(`OpenAI image error ${r.status}: ${errTxt.slice(0, 200)}`);
        }
        const j = await r.json();
        const b64 = j.data?.[0]?.b64_json;
        if (!b64) throw new Error('No image data returned');
        frames.push({ prompt: sceneText, b64 });
      } catch (e) {
        await refund();
        const msg = e instanceof Error ? e.message : String(e);
        return new Response(JSON.stringify({ error: msg, partialFrames: frames.length }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ frames, credits_used: COST }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[video-ad-scenes]', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
