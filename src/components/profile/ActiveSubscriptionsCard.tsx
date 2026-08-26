import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, ArrowRight, Sparkles } from "lucide-react";

interface ActiveSub {
  id: string;
  product_name: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Ongoing";

/**
 * Shows every platform subscription the user currently has active,
 * Uses Stripe as the source of truth instead of inferred module-table rows.
 */
export function ActiveSubscriptionsCard() {
  const [subs, setSubs] = useState<ActiveSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("list-user-subscriptions");
        if (error) throw error;
        const active = Array.isArray(data?.subscriptions)
          ? (data.subscriptions as ActiveSub[]).filter(
              (subscription) => subscription.status === "active" || subscription.status === "trialing",
            )
          : [];
        if (!cancelled) setSubs(active);
      } catch {
        /* silent — must never break the profile page */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-primary" />
          Active subscriptions
          {!loading && subs.length > 0 && (
            <Badge variant="secondary" className="ml-1">{subs.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : subs.length === 0 ? (
          <div className="text-center py-4 space-y-3">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              You don't have any active subscriptions yet.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/account/subscriptions" className="gap-2">
                Explore plans <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {subs.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.cancel_at_period_end ? "Ends" : "Renews"} {fmtDate(s.current_period_end)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant={s.status === "trialing" ? "secondary" : "default"}
                      className="text-xs capitalize"
                    >
                      {s.status?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full gap-2">
              <Link to="/account/subscriptions">
                Manage subscriptions <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ActiveSubscriptionsCard;
