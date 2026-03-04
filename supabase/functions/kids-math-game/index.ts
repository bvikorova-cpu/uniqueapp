import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gameType, level } = await req.json();
    
    // Generate problem based on game type and level
    let problem;
    const maxNumber = Math.min(10 + (level * 5), 100); // Increase difficulty with level
    
    switch (gameType) {
      case 'addition': {
        const num1 = Math.floor(Math.random() * maxNumber) + 1;
        const num2 = Math.floor(Math.random() * maxNumber) + 1;
        problem = {
          question: `${num1} + ${num2} = ?`,
          answer: num1 + num2
        };
        break;
      }
      
      case 'subtraction': {
        const num1 = Math.floor(Math.random() * maxNumber) + 1;
        const num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
        problem = {
          question: `${num1} - ${num2} = ?`,
          answer: num1 - num2
        };
        break;
      }
      
      case 'multiplication': {
        const maxMult = Math.min(10 + level, 20);
        const num1 = Math.floor(Math.random() * maxMult) + 1;
        const num2 = Math.floor(Math.random() * maxMult) + 1;
        problem = {
          question: `${num1} × ${num2} = ?`,
          answer: num1 * num2
        };
        break;
      }
      
      case 'division': {
        const divisor = Math.floor(Math.random() * 10) + 1;
        const quotient = Math.floor(Math.random() * 10) + 1;
        const dividend = divisor * quotient; // Ensure whole number result
        problem = {
          question: `${dividend} ÷ ${divisor} = ?`,
          answer: quotient
        };
        break;
      }
      
      default:
        throw new Error('Invalid game type');
    }
    
    return new Response(
      JSON.stringify({ problem }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
