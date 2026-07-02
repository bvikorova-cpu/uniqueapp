import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, EyeOff, Eye, Trash2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Report = {
  id: string; review_id: string; reporter_id: string; reason: string;
  description: string | null; status: string; created_at: string;
};
type Review = {
  id: string; seller_id: string; buyer_id: string; rating: number;
  comment: string | null; is_hidden: boolean; created_at: string;
};

export default function AdminSkillsReviewModeration() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: rep } = await supabase
      .from("review_reports" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const list = ((rep as unknown) as Report[]) || [];
    setReports(list);
    const ids = [...new Set(list.map((r) => r.review_id))];
    if (ids.length) {
      const { data: rev } = await supabase.from("seller_reviews" as any).select("*").in("id", ids);
      const map: Record<string, Review> = {};
      (((rev as unknown) as Review[]) || []).forEach((r) => (map[r.id] = r));
      setReviews(map);
    }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (adminLoading) return <div className="container py-8"><Skeleton className="h-40 w-full" /></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const toggleHide = async (review: Review, hide: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("seller_reviews" as any)
      .update({
        is_hidden: hide,
        hidden_at: hide ? new Date().toISOString() : null,
        hidden_by: hide ? user?.id : null,
      } as any)
      .eq("id", review.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: hide ? "Review hidden" : "Review restored" });
    load();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const { error } = await supabase.from("seller_reviews" as any).delete().eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Review deleted" });
    load();
  };

  const resolveReport = async (id: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("review_reports" as any)
      .update({ status, resolved_by: user?.id, resolved_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Report ${status}` });
    load();
  };

  return (
    <>
      <FloatingHowItWorks title="How Admin Skills Review Moderation works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Review moderation</h1>
      <p className="text-muted-foreground mb-6">Reported Skills Marketplace reviews.</p>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : reports.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No reports.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const rev = reviews[r.review_id];
            return (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base capitalize">{r.reason.replace("_", " ")}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reported {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={r.status === "pending" ? "default" : "secondary"}>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {r.description && (
                    <p className="text-sm border-l-2 pl-3 text-muted-foreground">{r.description}</p>
                  )}
                  {rev ? (
                    <div className="rounded-md border p-3 bg-muted/30">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                        ))}
                        {rev.is_hidden && <Badge variant="outline" className="ml-2">Hidden</Badge>}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{rev.comment || <em className="text-muted-foreground">No comment</em>}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Review has been deleted.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {rev && !rev.is_hidden && (
                      <Button size="sm" variant="outline" onClick={() => toggleHide(rev, true)} className="gap-2">
                        <EyeOff className="h-4 w-4" /> Hide
                      </Button>
                    )}
                    {rev && rev.is_hidden && (
                      <Button size="sm" variant="outline" onClick={() => toggleHide(rev, false)} className="gap-2">
                        <Eye className="h-4 w-4" /> Unhide
                      </Button>
                    )}
                    {rev && (
                      <Button size="sm" variant="destructive" onClick={() => deleteReview(rev.id)} className="gap-2">
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    )}
                    {r.status === "pending" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => resolveReport(r.id, "resolved")}>
                          Mark resolved
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => resolveReport(r.id, "dismissed")}>
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </>
    );
}
