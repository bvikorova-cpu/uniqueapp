import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, ArrowRight, Sparkles } from "lucide-react";

interface ActiveSub {
  module: string;
  tier: string | null;
  status: string;
  expires_at: string | null;
}

const prettyModule = (m: string) =>
  m
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Ongoing";

/**
 * Shows every platform subscription the user currently has active,
 * aggregated across all modules by get_my_active_subscriptions().
 */
export function ActiveSubscriptionsCard() {
  const [subs, setSubs] = useState<ActiveSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.rpc("get_my_active_subscriptions" as any);
        if (!cancelled && Array.isArray(data)) setSubs(data as ActiveSub[]);
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
                  key={s.module}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{prettyModule(s.module)}</p>
                    <p className="text-xs text-muted-foreground">
                      Renews / valid until {fmtDate(s.expires_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {s.tier && (
                      <Badge variant="outline" className="text-xs capitalize">{s.tier}</Badge>
                    )}
                    <Badge
                      variant={s.status?.toLowerCase() === "past_due" ? "destructive" : "default"}
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
