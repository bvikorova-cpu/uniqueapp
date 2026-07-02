import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  pageId: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

export function PageReviews({ pageId }: Props) {
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["page-reviews", pageId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("page_reviews")
        .select("id, user_id, rating, body, created_at")
        .eq("page_id", pageId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = Array.from(new Set((data ?? []).map((r) => r.user_id)));
      if (ids.length === 0) return data ?? [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      return (data ?? []).map((r: any) => ({ ...r, profile: map.get(r.user_id) }));
    },
  });

  const myReview = reviews.find((r) => r.user_id === userId);
  const avg =
    reviews.length === 0
      ? 0
      : Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setBody(myReview.body ?? "");
    }
  }, [myReview?.id]);

  const submit = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Sign in to review");
      const payload = {
        page_id: pageId,
        user_id: userId,
        rating,
        body: body.trim() || null,
      };
      const { error } = await supabase
        .from("page_reviews")
        .upsert(payload, { onConflict: "page_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(myReview ? "Review updated" : "Review posted");
      qc.invalidateQueries({ queryKey: ["page-reviews", pageId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!myReview) return;
      const { error } = await supabase.from("page_reviews").delete().eq("id", myReview.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setRating(5);
      setBody("");
      qc.invalidateQueries({ queryKey: ["page-reviews", pageId] });
    },
  });

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          Reviews
        </h3>
        {reviews.length > 0 && (
          <div className="text-sm">
            <span className="font-bold">{avg}</span>
            <span className="text-muted-foreground"> · {reviews.length}</span>
          </div>
        )}
      </div>

      {userId && (
        <div className="bg-muted/40 p-3 rounded-lg space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {myReview ? "Your review" : "Write a review"}
          </p>
          <StarPicker value={rating} onChange={setRating} />
          <Textarea
            rows={2}
            placeholder="Share your experience (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => submit.mutate()} disabled={submit.isPending}>
              {myReview ? "Update" : "Post review"}
            </Button>
            {myReview && (
              <Button size="sm" variant="ghost" onClick={() => remove.mutate()}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-3">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No reviews yet</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={r.profile?.avatar_url ?? undefined} />
                <AvatarFallback>{r.profile?.full_name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {r.profile?.full_name ?? "User"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(r.created_at), "PP")}
                  </span>
                </div>
                <StarRow value={r.rating} />
                {r.body && <p className="text-sm text-foreground mt-1">{r.body}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${
              n <= value ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= value ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}
