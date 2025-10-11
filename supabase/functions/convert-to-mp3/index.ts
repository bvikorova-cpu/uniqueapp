import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    console.log('Received audio file:', audioFile.name, audioFile.type, audioFile.size);

    // Read the WebM file
    const webmBuffer = await audioFile.arrayBuffer();
    const webmBytes = new Uint8Array(webmBuffer);

    // Write WebM to temp file
    const tempWebmPath = `/tmp/input_${Date.now()}.webm`;
    const tempMp3Path = `/tmp/output_${Date.now()}.mp3`;

    await Deno.writeFile(tempWebmPath, webmBytes);
    console.log('WebM file written to:', tempWebmPath);

    // Convert using FFmpeg
    const ffmpegCommand = new Deno.Command("ffmpeg", {
      args: [
        "-i", tempWebmPath,
        "-vn", // No video
        "-ar", "44100", // Audio sample rate
        "-ac", "2", // Audio channels (stereo)
        "-b:a", "192k", // Audio bitrate
        tempMp3Path
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await ffmpegCommand.output();
    
    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      console.error('FFmpeg error:', errorText);
      throw new Error('Failed to convert audio to MP3');
    }

    console.log('FFmpeg conversion successful');

    // Read the MP3 file
    const mp3Bytes = await Deno.readFile(tempMp3Path);
    console.log('MP3 file size:', mp3Bytes.length);

    // Clean up temp files
    try {
      await Deno.remove(tempWebmPath);
      await Deno.remove(tempMp3Path);
    } catch (e) {
      console.warn('Failed to clean up temp files:', e);
    }

    // Return MP3 file
    return new Response(mp3Bytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="dj-mix-${Date.now()}.mp3"`,
      },
    });

  } catch (error) {
    console.error('Error in convert-to-mp3:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
