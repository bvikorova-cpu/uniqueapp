import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Shared helper for authentication in edge functions.
 * Uses SERVICE_ROLE_KEY for admin operations and validates user tokens.
 */

export interface AuthResult {
  supabase: any;
  user: {
    id: string;
    email?: string;
  };
}

export async function authenticateUser(req: Request): Promise<AuthResult> {
  // Create a Supabase client with SERVICE_ROLE_KEY
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  ) as any;

  // Get the authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  // Parse the token
  const token = authHeader.replace("Bearer ", "");

  // Validate the token and get the user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    console.error("Authentication error:", userError);
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

/**
 * Helper for edge functions that do not require authentication.
 * Creates a Supabase client with only the ANON_KEY.
 */
export function createPublicClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
}
