import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_end?: string;
  tutorials_used: number;
  tutorials_limit: number;
}

export const useKidsDrawingSubscription = () => {
  return useQuery({
    queryKey: ["kids-drawing-subscription"],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) { return {
          subscribed: false,
          tutorials_used: 0,
          tutorials_limit: 0 };
      }

      const { data, error } = await supabase.functions.invoke(
        "check-kids-drawing-subscription",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}` } }
      );

      if (error) throw error;
      return data as SubscriptionStatus;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useCreateDrawingCheckout = () => {
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to subscribe");
      }

      const { data, error } = await supabase.functions.invoke(
        "create-kids-drawing-checkout",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}` } }
      );

      if (error) throw error;
      return data.url;
    },
    onSuccess: (url) => {
      window.open(url, "_blank");
      toast.success("Redirecting to checkout...");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create checkout session");
    } });
};

export const useIncrementDrawingUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: usage } = await supabase
        .from("kids_drawing_usage")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!usage) { // Create initial record
        await supabase
          .from("kids_drawing_usage")
          .insert({
            user_id: user.id,
            tutorials_used: 1,
            tutorials_limit: 1 });
      } else {
        // Increment usage
        await supabase
          .from("kids_drawing_usage")
          .update({ tutorials_used: usage.tutorials_used + 1 })
          .eq("user_id", user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kids-drawing-subscription"] });
    } });
};

export const useOpenDrawingCustomerPortal = () => {
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to manage subscription");
      }

      const { data, error } = await supabase.functions.invoke(
        "kids-drawing-customer-portal",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}` } }
      );

      if (error) throw error;
      return data.url;
    },
    onSuccess: (url) => {
      window.open(url, "_blank");
      toast.success("Opening subscription management...");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to open customer portal");
    } });
};
