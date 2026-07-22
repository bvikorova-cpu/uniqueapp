import { supabase } from "@/integrations/supabase/client";

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'register'
  | 'profile_update'
  | 'post_create'
  | 'post_delete'
  | 'comment_create'
  | 'comment_delete'
  | 'like'
  | 'follow'
  | 'unfollow'
  | 'message_send'
  | 'settings_change'
  | 'password_change'
  | 'account_delete'
  | 'report_create'
  | 'payment'
  | 'subscription_change';

interface AuditLogEntry {
  action: AuditAction;
  details?: Record<string, unknown>;
  resourceType?: string;
  resourceId?: string;
}

export const useAuditLog = () => {
  const logAction = async ({
    action,
    details = {},
    resourceType,
    resourceId }: AuditLogEntry) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Audit log: No user found');
        return;
      }

      // Get user agent and IP info
      const userAgent = navigator.userAgent;
      const timestamp = new Date().toISOString();

      const logEntry = { user_id: user.id,
        activity_type: action,
        points_earned: 0,
        created_at: timestamp };

      // Store in activity_logs table (existing table)
      const { error } = await supabase
        .from('activity_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to create audit log:', error);
      }

      // Also log to console for debugging
      console.debug('Audit Log:', { action,
        userId: user.id,
        resourceType,
        resourceId,
        details,
        userAgent,
        timestamp });

    } catch (error) {
      console.error('Audit log error:', error);
    }
  };

  const getRecentActivity = async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch activity logs:', error);
      return [];
    }

    return data;
  };

  return { logAction,
    getRecentActivity };
};

export default useAuditLog;
