import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Creates a Supabase client with automatic Authorization header forwarding
 * This ensures the client uses the same auth context as the incoming request
 */
export function createSupabaseClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("Authorization") || "";
  
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );
}

/**
 * Creates a Supabase admin client with SERVICE_ROLE_KEY
 * Use this for operations that need to bypass RLS
 */
export function createSupabaseAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

/**
 * Authenticates user from request and returns user data
 * Throws error if authentication fails
 */
export async function authenticateUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const supabase = createSupabaseAdminClient();
  const token = authHeader.replace("Bearer ", "");
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error(error?.message || "Unauthorized");
  }

  return {
    user,
    supabase,
    userId: user.id,
    email: user.email,
  };
}

/**
 * Optional authentication - returns null if not authenticated instead of throwing
 */
export async function optionalAuthenticateUser(req: Request) {
  try {
    return await authenticateUser(req);
  } catch {
    return null;
  }
}
