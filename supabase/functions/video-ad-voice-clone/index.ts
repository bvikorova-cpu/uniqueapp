// Clone a voice from an uploaded sample using ElevenLabs IVC API.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { decode as b64decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const COST = 10;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Not authenticated');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Not authenticated');

    const { name, description, audioBase64, mimeType = 'audio/mpeg' } = await req.json();
    if (!name || !audioBase64) {
      return new Response(JSON.stringify({ error: 'name and audioBase64 are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (audioBase64.length > 14_000_000) {
      return new Response(JSON.stringify({ error: 'Audio sample too large (max ~10MB)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: adminRole } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    const isAdmin = !!adminRole;
    let prevCredits = 0; let refundOnError = false;
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

    const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenKey) { await refund(); throw new Error('ELEVENLABS_API_KEY not configured'); }

    const audioBytes = b64decode(audioBase64);
    const ext = mimeType.includes('wav') ? 'wav' : mimeType.includes('m4a') ? 'm4a' : 'mp3';

    const form = new FormData();
    form.append('name', String(name).slice(0, 80));
    if (description) form.append('description', String(description).slice(0, 500));
    form.append('files', new Blob([audioBytes], { type: mimeType }), `sample.${ext}`);

    const r = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: { 'xi-api-key': elevenKey },
      body: form,
    });
    if (!r.ok) {
      const txt = await r.text();
      await refund();
      return new Response(JSON.stringify({ error: `ElevenLabs voice clone error ${r.status}: ${txt.slice(0, 300)}` }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const j = await r.json();
    return new Response(JSON.stringify({ voiceId: j.voice_id, credits_used: COST }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[video-ad-voice-clone]', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
