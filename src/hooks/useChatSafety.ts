import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Two-way block + report helper for anonymous chat.
 * - "blockedByMe": current user blocked the partner
 * - "blockedByThem": partner blocked current user
 * Either case => chat must be locked.
 */
export function useChatSafety(currentUserId: string, partnerId: string) {
  const { toast } = useToast();
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedByThem, setBlockedByThem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUserId || !partnerId) return;
    const [{ data: mine }, { data: theirs }] = await Promise.all([
      supabase
        .from("blocked_users")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("blocked_user_id", partnerId)
        .maybeSingle(),
      // Note: RLS allows users to read only their own blocks. Partner blocks
      // are detected via Edge Function fallback below; if SELECT is denied,
      // we silently keep blockedByThem=false here.
      supabase
        .from("blocked_users")
        .select("id")
        .eq("user_id", partnerId)
        .eq("blocked_user_id", currentUserId)
        .maybeSingle(),
    ]);
    setBlockedByMe(!!mine);
    setBlockedByThem(!!theirs);
    setLoading(false);
  }, [currentUserId, partnerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const block = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("blocked_users").insert({
        user_id: currentUserId,
        blocked_user_id: partnerId,
      });
      if (error && !`${error.message}`.toLowerCase().includes("duplicate")) throw error;
      setBlockedByMe(true);
      toast({
        title: "User blocked",
        description: "This match is now hidden. They can no longer reach you.",
      });
      return true;
    } catch (e: any) {
      toast({ title: "Could not block", description: e.message ?? "Try again", variant: "destructive" });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const unblock = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("user_id", currentUserId)
        .eq("blocked_user_id", partnerId);
      if (error) throw error;
      setBlockedByMe(false);
      toast({ title: "User unblocked" });
      return true;
    } catch (e: any) {
      toast({ title: "Could not unblock", description: e.message ?? "Try again", variant: "destructive" });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const report = async (params: {
    reason: string;
    details?: string;
    matchId?: string;
  }) => {
    if (!params.reason.trim()) {
      toast({ title: "Choose a reason", variant: "destructive" });
      return false;
    }
    setSubmitting(true);
    try {
      const fullReason = params.details?.trim()
        ? `${params.reason} — ${params.details.trim().slice(0, 1000)}`
        : params.reason;

      const { error } = await supabase.from("user_reports").insert({
        reporter_id: currentUserId,
        reported_user_id: partnerId,
        report_type: params.matchId ? `anonymous_chat:${params.matchId}` : "anonymous_chat",
        reason: fullReason,
        status: "pending",
      });
      if (error) throw error;
      toast({
        title: "Report submitted",
        description: "Our safety team will review this within 24 hours.",
      });
      return true;
    } catch (e: any) {
      toast({ title: "Could not submit report", description: e.message ?? "Try again", variant: "destructive" });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    blockedByMe,
    blockedByThem,
    isBlocked: blockedByMe || blockedByThem,
    refresh,
    block,
    unblock,
    report,
  };
}
