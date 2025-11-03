import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PaintByNumbers {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  price_coins: number;
  thumbnail_url: string | null;
  image_data: {
    sections: Array<{ id: number; color: string; number: number; path?: string }>;
    colors: Array<{ number: number; color: string; name: string }>;
  };
  total_sections: number;
}

export const usePaintByNumbers = (category?: string) => {
  return useQuery({
    queryKey: ["paint-by-numbers", category],
    queryFn: async () => {
      let query = supabase
        .from("paint_by_numbers")
        .select("*")
        .order("title");

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as PaintByNumbers[];
    },
  });
};

export const usePaintById = (paintId: string) => {
  return useQuery({
    queryKey: ["paint", paintId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paint_by_numbers")
        .select("*")
        .eq("id", paintId)
        .single();

      if (error) throw error;
      return data as unknown as PaintByNumbers;
    },
    enabled: !!paintId,
  });
};

export const useUserPaintPurchases = () => {
  return useQuery({
    queryKey: ["user-paint-purchases"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_paint_purchases")
        .select("*, paint_by_numbers(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });
};

export const useUserPaintProgress = (paintId?: string) => {
  return useQuery({
    queryKey: ["user-paint-progress", paintId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !paintId) return null;

      const { data, error } = await supabase
        .from("user_paint_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("paint_id", paintId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!paintId,
  });
};

export const usePurchasePaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paintId, price }: { paintId: string; price: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if already purchased
      const { data: existing } = await supabase
        .from("user_paint_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("paint_id", paintId)
        .single();

      if (existing) {
        return { alreadyPurchased: true };
      }

      // Deduct coins
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const currentCoins = (profile as any)?.coins || 0;
      if (currentCoins < price) {
        throw new Error("Not enough coins");
      }

      await supabase
        .from("profiles")
        .update({ coins: currentCoins - price } as any)
        .eq("id", user.id);

      // Create purchase record
      const { error } = await supabase
        .from("user_paint_purchases")
        .insert({ user_id: user.id, paint_id: paintId });

      if (error) throw error;

      return { alreadyPurchased: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-paint-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Painting unlocked! 🎨");
    },
    onError: (error: Error) => {
      if (error.message === "Not enough coins") {
        toast.error("Not enough coins! Complete more activities.");
      } else {
        toast.error("Failed to unlock painting");
      }
    },
  });
};

export const useUpdatePaintProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paintId,
      sectionId,
      totalSections,
    }: {
      paintId: string;
      sectionId: number;
      totalSections: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current progress
      const { data: progress } = await supabase
        .from("user_paint_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("paint_id", paintId)
        .single();

      let completedSections = progress?.completed_sections || [];
      
      // Add new section if not already completed
      if (!completedSections.includes(sectionId)) {
        completedSections = [...completedSections, sectionId];
      }

      const isCompleted = completedSections.length >= totalSections;

      if (progress) {
        // Update existing progress
        const { error } = await supabase
          .from("user_paint_progress")
          .update({
            completed_sections: completedSections,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq("id", progress.id);

        if (error) throw error;
      } else {
        // Create new progress
        const { error } = await supabase
          .from("user_paint_progress")
          .insert({
            user_id: user.id,
            paint_id: paintId,
            completed_sections: completedSections,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }

      // Award coins if completed
      if (isCompleted && !progress?.is_completed) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          const currentCoins = (profile as any)?.coins || 0;
          await supabase
            .from("profiles")
            .update({ coins: currentCoins + 50 } as any)
            .eq("id", user.id);
        }
      }

      return { isCompleted, completedSections };
    },
    onSuccess: ({ isCompleted }, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-paint-progress", variables.paintId] });
      if (isCompleted) {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        toast.success("🎉 Painting completed! +50 coins");
      }
    },
  });
};
