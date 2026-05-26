import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { spaceId, recordingUrl } = await req.json();
    if (!spaceId || !recordingUrl) {
      return new Response(JSON.stringify({ error: 'Missing spaceId or recordingUrl' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('audio_spaces').update({ transcript_status: 'processing' }).eq('id', spaceId);

    // Fetch the audio
    const audioResp = await fetch(recordingUrl);
    if (!audioResp.ok) throw new Error('Failed to fetch recording');
    const audioBuf = await audioResp.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(audioBuf)));

    // Use Lovable AI Gateway with Gemini for transcription via prompt
    const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Transcribe this audio recording verbatim. Return only the transcript text.' },
            { type: 'input_audio', input_audio: { data: b64, format: 'webm' } },
          ],
        }],
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      throw new Error(`AI gateway error: ${txt}`);
    }
    const aiJson = await aiResp.json();
    const transcript = aiJson.choices?.[0]?.message?.content ?? '';

    await supabase.from('audio_spaces').update({
      transcript, transcript_status: 'done',
    }).eq('id', spaceId);

    return new Response(JSON.stringify({ transcript }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
