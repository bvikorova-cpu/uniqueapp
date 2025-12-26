/**
 * Job Queue utilities for Edge Functions
 * Provides async job processing with retries and exponential backoff
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Job types for type safety
export type JobType = 
  | 'ai_generation'
  | 'image_processing'
  | 'video_processing'
  | 'email_notification'
  | 'payment_processing'
  | 'data_export'
  | 'report_generation'
  | 'cleanup'
  | 'sync'
  | string;

export interface Job {
  id: string;
  job_type: JobType;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  max_attempts: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
  error_message?: string;
  result?: unknown;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

interface EnqueueOptions {
  priority?: number;
  maxAttempts?: number;
  scheduledAt?: Date;
  userId?: string;
}

/**
 * Get Supabase admin client
 */
function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Enqueue a new job for async processing
 */
export async function enqueueJob(
  jobType: JobType,
  payload: Record<string, unknown>,
  options: EnqueueOptions = {}
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  
  const {
    priority = 0,
    maxAttempts = 3,
    scheduledAt = new Date(),
    userId,
  } = options;
  
  try {
    const { data, error } = await supabase
      .from('job_queue')
      .insert({
        job_type: jobType,
        payload,
        priority,
        max_attempts: maxAttempts,
        scheduled_at: scheduledAt.toISOString(),
        user_id: userId,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('[Queue] Enqueue error:', error);
      return null;
    }
    
    console.log(`[Queue] Job enqueued: ${data.id} (${jobType})`);
    return data.id;
  } catch (err) {
    console.error('[Queue] Enqueue exception:', err);
    return null;
  }
}

/**
 * Get and lock the next available job
 */
export async function getNextJob(jobTypes?: JobType[]): Promise<Job | null> {
  const supabase = getSupabaseAdmin();
  
  try {
    const { data, error } = await supabase.rpc('get_next_job', {
      p_job_types: jobTypes || null,
    });
    
    if (error) {
      console.error('[Queue] Get next job error:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Fetch full job details
    const { data: jobData, error: fetchError } = await supabase
      .from('job_queue')
      .select('*')
      .eq('id', data[0].id)
      .single();
    
    if (fetchError) {
      console.error('[Queue] Fetch job error:', fetchError);
      return null;
    }
    
    return jobData as Job;
  } catch (err) {
    console.error('[Queue] Get next job exception:', err);
    return null;
  }
}

/**
 * Mark a job as completed
 */
export async function completeJob(jobId: string, result?: unknown): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  try {
    const { error } = await supabase.rpc('complete_job', {
      p_job_id: jobId,
      p_result: result || null,
    });
    
    if (error) {
      console.error('[Queue] Complete job error:', error);
      return false;
    }
    
    console.log(`[Queue] Job completed: ${jobId}`);
    return true;
  } catch (err) {
    console.error('[Queue] Complete job exception:', err);
    return false;
  }
}

/**
 * Mark a job as failed
 */
export async function failJob(jobId: string, errorMessage?: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  
  try {
    const { error } = await supabase.rpc('fail_job', {
      p_job_id: jobId,
      p_error: errorMessage || null,
    });
    
    if (error) {
      console.error('[Queue] Fail job error:', error);
      return false;
    }
    
    console.log(`[Queue] Job failed: ${jobId} - ${errorMessage}`);
    return true;
  } catch (err) {
    console.error('[Queue] Fail job exception:', err);
    return false;
  }
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<Job | null> {
  const supabase = getSupabaseAdmin();
  
  try {
    const { data, error } = await supabase
      .from('job_queue')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (error) {
      console.error('[Queue] Get job status error:', error);
      return null;
    }
    
    return data as Job;
  } catch (err) {
    console.error('[Queue] Get job status exception:', err);
    return null;
  }
}

/**
 * Get user's jobs
 */
export async function getUserJobs(
  userId: string,
  status?: Job['status'],
  limit: number = 20
): Promise<Job[]> {
  const supabase = getSupabaseAdmin();
  
  try {
    let query = supabase
      .from('job_queue')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[Queue] Get user jobs error:', error);
      return [];
    }
    
    return (data || []) as Job[];
  } catch (err) {
    console.error('[Queue] Get user jobs exception:', err);
    return [];
  }
}

/**
 * Process jobs with a handler function
 * Useful for creating job worker edge functions
 */
export async function processJobs(
  jobTypes: JobType[],
  handler: (job: Job) => Promise<unknown>,
  options: { maxJobs?: number } = {}
): Promise<{ processed: number; failed: number }> {
  const { maxJobs = 10 } = options;
  let processed = 0;
  let failed = 0;
  
  for (let i = 0; i < maxJobs; i++) {
    const job = await getNextJob(jobTypes);
    
    if (!job) {
      break; // No more jobs available
    }
    
    try {
      console.log(`[Queue] Processing job: ${job.id} (${job.job_type})`);
      const result = await handler(job);
      await completeJob(job.id, result);
      processed++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await failJob(job.id, errorMessage);
      failed++;
    }
  }
  
  return { processed, failed };
}

/**
 * Cleanup old completed/failed jobs
 */
export async function cleanupOldJobs(): Promise<number> {
  const supabase = getSupabaseAdmin();
  
  try {
    const { data, error } = await supabase.rpc('cleanup_old_jobs');
    
    if (error) {
      console.error('[Queue] Cleanup error:', error);
      return 0;
    }
    
    console.log(`[Queue] Cleaned up ${data} old jobs`);
    return data || 0;
  } catch (err) {
    console.error('[Queue] Cleanup exception:', err);
    return 0;
  }
}

export default {
  enqueueJob,
  getNextJob,
  completeJob,
  failJob,
  getJobStatus,
  getUserJobs,
  processJobs,
  cleanupOldJobs,
};
