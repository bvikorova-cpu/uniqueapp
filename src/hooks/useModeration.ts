import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ModerationStatus = Database["public"]["Enums"]["moderation_status"];
type ModerationAction = Database["public"]["Enums"]["moderation_action"];

export const useContentReports = (status?: ModerationStatus) => {
  return useQuery({
    queryKey: ["content-reports", status],
    queryFn: async () => {
      let query = supabase
        .from("content_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useModerationQueue = () => {
  return useQuery({
    queryKey: ["moderation-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_moderation")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      resolutionNotes,
    }: {
      reportId: string;
      status: ModerationStatus;
      resolutionNotes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("content_reports")
        .update({
          status,
          assigned_to: user.id,
          resolution_notes: resolutionNotes,
          resolved_at: status === "approved" || status === "deleted" ? new Date().toISOString() : null,
        })
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-reports"] });
      toast({
        title: "Report Updated",
        description: "The report status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useShadowbanUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("shadowbanned_users").insert({
        user_id: userId,
        shadowbanned_by: user.id,
        reason,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shadowbanned-users"] });
      toast({
        title: "User Shadowbanned",
        description: "The user has been shadowbanned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRemoveShadowban = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("shadowbanned_users")
        .update({ is_active: false })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shadowbanned-users"] });
      toast({
        title: "Shadowban Removed",
        description: "The user's shadowban has been lifted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useWarnUser = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      relatedContentId,
    }: {
      userId: string;
      reason: string;
      relatedContentId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_warnings").insert({
        user_id: userId,
        issued_by: user.id,
        reason,
        related_content_id: relatedContentId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Warning Issued",
        description: "The user has been warned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useTakeModeratorAction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      actionType,
      reason,
      relatedContentId,
      relatedReportId,
      durationHours,
    }: {
      userId: string;
      actionType: ModerationAction;
      reason: string;
      relatedContentId?: string;
      relatedReportId?: string;
      durationHours?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("moderation_actions").insert({
        moderator_id: user.id,
        user_id: userId,
        action_type: actionType,
        reason,
        related_content_id: relatedContentId,
        related_report_id: relatedReportId,
        duration_hours: durationHours,
        expires_at: durationHours 
          ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString() 
          : null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-queue"] });
      queryClient.invalidateQueries({ queryKey: ["content-reports"] });
      toast({
        title: "Action Taken",
        description: "The moderation action has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useIsShadowbanned = (userId?: string) => {
  return useQuery({
    queryKey: ["is-shadowbanned", userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from("shadowbanned_users")
        .select("id")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!userId,
  });
};

export const useShadowbannedUsers = () => {
  return useQuery({
    queryKey: ["shadowbanned-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shadowbanned_users")
        .select("*")
        .eq("is_active", true)
        .order("shadowbanned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
