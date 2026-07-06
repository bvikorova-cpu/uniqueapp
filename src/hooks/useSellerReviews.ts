import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SellerReview {
  id: string;
  seller_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export const useSellerReviews = (sellerId?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["seller-reviews", sellerId],
    enabled: !!sellerId,
    queryFn: async () => {
      const { data } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });
      return (data || []) as unknown as SellerReview[];
    },
  });

  const avgRating =
    reviews.length === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const submitReview = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !sellerId) throw new Error("Missing context");
      const { error } = await supabase.from("seller_reviews").upsert(
        {
          seller_id: sellerId,
          buyer_id: user.id,
          rating,
          comment,
        } as any,
        { onConflict: "seller_id,buyer_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-reviews", sellerId] });
      toast({ title: "Review submitted" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seller_reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-reviews", sellerId] }),
  });

  return {
    reviews,
    isLoading,
    avgRating,
    count: reviews.length,
    submitReview: submitReview.mutate,
    deleteReview: deleteReview.mutate,
  };
};
