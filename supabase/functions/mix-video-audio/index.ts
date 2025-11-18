import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const audioFile = formData.get('audio') as File;

    if (!videoFile || !audioFile) {
      return new Response(
        JSON.stringify({ error: 'Video and audio files are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received video:', videoFile.name, videoFile.size, 'bytes');
    console.log('Received audio:', audioFile.name, audioFile.size, 'bytes');

    // Read files into buffers
    const videoBuffer = await videoFile.arrayBuffer();
    const audioBuffer = await audioFile.arrayBuffer();

    // Write temporary files
    const videoPath = `/tmp/input_video_${Date.now()}.webm`;
    const audioPath = `/tmp/input_audio_${Date.now()}.mp3`;
    const outputPath = `/tmp/output_${Date.now()}.mp4`;

    await Deno.writeFile(videoPath, new Uint8Array(videoBuffer));
    await Deno.writeFile(audioPath, new Uint8Array(audioBuffer));

    console.log('Files written to temp directory');

    // Run FFmpeg to mix video and audio
    const ffmpegCommand = new Deno.Command('ffmpeg', {
      args: [
        '-i', videoPath,          // Input video
        '-i', audioPath,          // Input audio
        '-c:v', 'copy',           // Copy video codec (faster)
        '-c:a', 'aac',            // Encode audio to AAC
        '-map', '0:v:0',          // Map video from first input
        '-map', '1:a:0',          // Map audio from second input
        '-shortest',              // End when shortest stream ends
        '-y',                     // Overwrite output file
        outputPath
      ],
      stdout: 'piped',
      stderr: 'piped',
    });

    console.log('Running FFmpeg...');
    const { code, stdout, stderr } = await ffmpegCommand.output();

    if (code !== 0) {
      const error = new TextDecoder().decode(stderr);
      console.error('FFmpeg error:', error);
      throw new Error(`FFmpeg failed: ${error}`);
    }

    console.log('FFmpeg completed successfully');

    // Read the output file
    const outputData = await Deno.readFile(outputPath);

    // Clean up temporary files
    try {
      await Deno.remove(videoPath);
      await Deno.remove(audioPath);
      await Deno.remove(outputPath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    // Return the mixed video
    return new Response(outputData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video_with_audio.mp4"',
        'Content-Length': outputData.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error processing video:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
