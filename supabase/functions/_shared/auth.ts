import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Spoločný helper pre autentifikáciu v edge funkciách
 * Používa SERVICE_ROLE_KEY pre admin operácie a validuje user tokeny
 */

export interface AuthResult {
  supabase: any;
  user: {
    id: string;
    email?: string;
  };
}

export async function authenticateUser(req: Request): Promise<AuthResult> {
  // Vytvor Supabase klienta s SERVICE_ROLE_KEY
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  ) as any;

  // Ziskaj authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  // Parsuj token
  const token = authHeader.replace("Bearer ", "");
  
  // Validuj token a ziskaj usera
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    console.error("Authentication error:", userError);
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

/**
 * Helper pre edge funkcie, ktoré nepotrebujú autentifikáciu
 * Vytvára Supabase klienta len s ANON_KEY
 */
export function createPublicClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
}
