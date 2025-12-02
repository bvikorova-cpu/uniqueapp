import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLieDetectorCredits = () => {
  const queryClient = useQueryClient();

  const { data: credits, isLoading } = useQuery({
    queryKey: ["lie-detector-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("lie_detector_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("lie_detector_credits")
          .insert({
            user_id: user.id,
            credits_remaining: 0,
            total_credits_purchased: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      return data;
    },
  });

  const analyzeMessage = useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase.functions.invoke('analyze-message', {
        body: { message }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      queryClient.invalidateQueries({ queryKey: ["lie-detector-analyses"] });
      toast.success("Message analyzed successfully!");
    },
    onError: (error: Error) => {
      if (error.message.includes('Insufficient credits')) {
        toast.error("Insufficient credits. Please purchase more credits.");
      } else if (error.message.includes('Rate limit')) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Error analyzing message: " + error.message);
      }
    },
  });

  const analyzeThread = useMutation({
    mutationFn: async (messages: Array<{ text: string }>) => {
      const { data, error } = await supabase.functions.invoke('analyze-thread', {
        body: { messages }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      queryClient.invalidateQueries({ queryKey: ["lie-detector-analyses"] });
      toast.success("Conversation thread analyzed successfully!");
    },
    onError: (error: Error) => {
      if (error.message.includes('Insufficient credits')) {
        toast.error("Insufficient credits. You need 15 credits for thread analysis.");
      } else {
        toast.error("Error analyzing thread: " + error.message);
      }
    },
  });

  const analyzeProfile = useMutation({
    mutationFn: async ({ messages, context }: { messages: Array<{ text: string }>; context?: string }) => {
      const { data, error } = await supabase.functions.invoke('analyze-profile', {
        body: { messages, context }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lie-detector-credits"] });
      queryClient.invalidateQueries({ queryKey: ["lie-detector-analyses"] });
      toast.success("Psychological profile created successfully!");
    },
    onError: (error: Error) => {
      if (error.message.includes('Insufficient credits')) {
        toast.error("Insufficient credits. You need 50 credits for profile analysis.");
      } else {
        toast.error("Error creating profile: " + error.message);
      }
    },
  });

  const purchaseCredits = async (credits: number): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-lie-detector-payment', {
        body: { credits }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error creating payment session");
      return null;
    }
  };

  return {
    credits,
    isLoading,
    analyzeMessage: analyzeMessage.mutate,
    isAnalyzingMessage: analyzeMessage.isPending,
    analyzeThread: analyzeThread.mutate,
    isAnalyzingThread: analyzeThread.isPending,
    analyzeProfile: analyzeProfile.mutate,
    isAnalyzingProfile: analyzeProfile.isPending,
    purchaseCredits,
  };
};