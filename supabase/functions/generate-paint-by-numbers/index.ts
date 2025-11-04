import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log(`Generating paint-by-numbers for: ${title}`);

    // Generate black and white template with numbers using OpenAI
    const templateResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `Paint by numbers coloring page for children: ${title}. Black outlines on white background. 8 regions with large numbers 1-8 clearly visible inside each region. Simple shapes. Thick borders. Line art style. No colors, only black and white.`,
        size: "1024x1024",
        output_format: "png",
        quality: "high"
      }),
    });

    if (!templateResponse.ok) {
      const error = await templateResponse.text();
      console.error("OpenAI error (template):", error);
      throw new Error(`OpenAI error: ${templateResponse.status}`);
    }

    const templateData = await templateResponse.json();
    const templateImageUrl = templateData.data?.[0]?.b64_json 
      ? `data:image/png;base64,${templateData.data[0].b64_json}`
      : templateData.data?.[0]?.url;

    if (!templateImageUrl) {
      throw new Error("No template generated");
    }

    console.log("Template created. Generating colored version...");

    // Generate colored version - same subject but without numbers
    const coloredResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `Colorful illustration for children: ${title}. Bright colors: blue, green, yellow, pink, brown, purple. Simple shapes matching a paint-by-numbers style. Cute cartoon style. NO numbers, NO text. Just a finished colored picture.`,
        size: "1024x1024",
        output_format: "png",
        quality: "high"
      }),
    });

    if (!coloredResponse.ok) {
      const error = await coloredResponse.text();
      console.error("OpenAI error (colored):", error);
      throw new Error(`OpenAI error: ${coloredResponse.status}`);
    }

    const coloredData = await coloredResponse.json();
    const coloredImageUrl = coloredData.data?.[0]?.b64_json
      ? `data:image/png;base64,${coloredData.data[0].b64_json}`
      : coloredData.data?.[0]?.url;

    if (!coloredImageUrl) {
      throw new Error("No colored image generated");
    }

    console.log("Both images generated successfully!");

    return new Response(
      JSON.stringify({ 
        coloredImageUrl,
        templateImageUrl 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
