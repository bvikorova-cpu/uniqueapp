import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

    const { text, voiceId } = await req.json();
    if (!text || typeof text !== 'string' || text.length < 1 || text.length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid text (1-5000 chars)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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

    const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenKey) { await refund(); throw new Error('ELEVENLABS_API_KEY not configured'); }

    const vId = voiceId || 'JBFqnCBsd6RMkjVDRZzb'; // George
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true } }),
    });
    if (!r.ok) {
      await refund();
      const errTxt = await r.text();
      return new Response(JSON.stringify({ error: `ElevenLabs error ${r.status}: ${errTxt.slice(0, 300)}` }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const audioBuf = await r.arrayBuffer();
    const audioBase64 = base64Encode(new Uint8Array(audioBuf));

    return new Response(JSON.stringify({ audioBase64, mimeType: 'audio/mpeg', credits_used: COST }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[video-ad-tts]', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
