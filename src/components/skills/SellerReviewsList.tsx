import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useSellerReviews } from "@/hooks/useSellerReviews";
import ReportReviewButton from "@/components/skills/ReportReviewButton";
import { formatDistanceToNow } from "date-fns";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { sellerId: string }

type Profile = { id: string; full_name: string | null; avatar_url: string | null };

export default function SellerReviewsList({ sellerId }: Props) {
  const { reviews, avgRating, count, isLoading } = useSellerReviews(sellerId);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    const ids = [...new Set(reviews.map((r) => r.buyer_id))];
    if (ids.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url")
        .in("id", ids);
      const map: Record<string, Profile> = {};
      (data || []).forEach((p: any) => (map[p.id] = p));
      setProfiles(map);
    })();
  }, [reviews]);

  return (
    <>
      <FloatingHowItWorks title="How Seller Reviews List works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Provider reviews</span>
          {count > 0 && (
            <span className="inline-flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({count})</span>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first after your order is completed.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.slice(0, 10).map((r) => {
              const p = profiles[r.buyer_id];
              return (
                <li key={r.id} className="flex gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={p?.avatar_url ?? undefined} />
                    <AvatarFallback>{(p?.full_name || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{p?.full_name || "Anonymous"}</p>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                      <ReportReviewButton reviewId={r.id} />
                    </div>
                    {r.comment && <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{r.comment}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
    </>
    );
}
