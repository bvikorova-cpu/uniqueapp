/**
 * Database utilities for edge functions
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Creates a Supabase client for edge functions
 */
export function createSupabaseClient(authHeader?: string): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {} } });
}

/**
 * Creates a Supabase client with user context
 */
export function createUserClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("Authorization");
  return createSupabaseClient(authHeader || undefined);
}

/**
 * Gets user ID from JWT token
 */
export async function getUserId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Checks if user is authenticated
 */
export async function requireAuth(
  supabase: SupabaseClient
): Promise<{ userId: string } | { error: string }> {
  const userId = await getUserId(supabase);
  
  if (!userId) {
    return { error: "Authentication required" };
  }
  
  return { userId };
}

/**
 * Executes multiple operations with rollback on failure
 * Note: This is a pseudo-transaction using multiple queries
 * For true ACID transactions, use database functions
 */
export async function executeWithRollback<T>(
  supabase: SupabaseClient,
  operations: Array<{
    execute: () => Promise<{ data: unknown; error: unknown }>;
    rollback: () => Promise<void>;
  }>
): Promise<TransactionResult<T[]>> {
  const results: unknown[] = [];
  const completedOps: Array<() => Promise<void>> = [];

  try {
    for (const op of operations) {
      const { data, error } = await op.execute();
      
      if (error) {
        // Rollback completed operations in reverse order
        for (let i = completedOps.length - 1; i >= 0; i--) {
          try {
            await completedOps[i]();
          } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
          }
        }
        
        return { success: false,
          error: error instanceof Error ? error.message : String(error) };
      }
      
      results.push(data);
      completedOps.push(op.rollback);
    }

    return { success: true,
      data: results as T[] };
  } catch (error) {
    // Rollback on unexpected error
    for (let i = completedOps.length - 1; i >= 0; i--) {
      try {
        await completedOps[i]();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    return { success: false,
      error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Paginated query helper
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  ascending?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationRange(params: PaginationParams): { from: number; to: number } {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  return { from, to };
}

/**
 * Batch insert with chunking for large datasets
 */
export async function batchInsert<T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  records: T[],
  chunkSize = 100
): Promise<TransactionResult<void>> {
  const chunks: T[][] = [];
  
  for (let i = 0; i < records.length; i += chunkSize) {
    chunks.push(records.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    const { error } = await supabase.from(table).insert(chunk);
    
    if (error) { return {
        success: false,
        error: error.message };
    }
  }

  return { success: true };
}

/**
 * Upsert with conflict handling
 */
export async function safeUpsert<T extends Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  record: T,
  onConflict: string
): Promise<TransactionResult<T>> {
  const { data, error } = await supabase
    .from(table)
    .upsert(record, { onConflict })
    .select()
    .single();

  if (error) { return {
      success: false,
      error: error.message };
  }

  return { success: true,
    data: data as T };
}
