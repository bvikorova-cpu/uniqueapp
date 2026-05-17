import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Pause, Play, X, CreditCard, Repeat, Calendar, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RecurringDonation {
  id: string;
  campaign_id: string;
  campaign_type: string;
  amount: number;
  is_monthly: boolean;
  status: string;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
  next_billing_at: string | null;
  paused_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  medical: "🏥 Medical", dream: "✨ Dream", hero: "🦸 Hero",
  crisis: "🚨 Crisis", pet: "🐾 Pet", student: "🎓 Student", talent: "🎭 Talent",
};

export default function RecurringDonationsHub() {
  const navigate = useNavigate();
  const [subs, setSubs] = useState<RecurringDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    const { data, error } = await supabase
      .from("campaign_donations")
      .select("*")
      .eq("donor_id", session.user.id)
      .eq("is_monthly", true)
      .not("stripe_subscription_id", "is", null)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setSubs((data as RecurringDonation[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: "pause" | "resume" | "cancel" | "portal") => {
    setBusyId(id);
    try {
      const { data, error } = await supabase.functions.invoke("manage-donation-subscription", {
        body: { donationId: id, action },
      });
      if (error) throw error;
      if (action === "portal" && (data as any)?.url) {
        window.location.href = (data as any).url;
        return;
      }
      toast({ title: `Subscription ${action}d`, description: "Your change was saved." });
      await load();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message || String(e), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const totalMonthly = subs
    .filter(s => !s.cancelled_at && !s.paused_at)
    .reduce((sum, s) => sum + Number(s.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate("/fundraising/my-donations")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to my donations
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Repeat className="h-6 w-6 text-primary" />
            <Badge variant="secondary">Recurring Donations</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Manage your monthly giving</h1>
          <p className="text-muted-foreground">
            Pause, cancel or update your card. Active monthly impact:{" "}
            <strong className="text-primary">€{totalMonthly.toFixed(2)}/mo</strong>
          </p>
        </motion.div>

        {subs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="mb-4">You don't have any active monthly donations yet.</p>
              <Button onClick={() => navigate("/fundraising")}>Explore campaigns</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subs.map(s => {
              const isPaused = !!s.paused_at;
              const isCancelled = !!s.cancelled_at;
              const status = isCancelled ? "cancelled" : isPaused ? "paused" : (s.subscription_status || "active");

              return (
                <Card key={s.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline">{typeLabels[s.campaign_type] || s.campaign_type}</Badge>
                          <Badge variant={isCancelled ? "destructive" : isPaused ? "secondary" : "default"}>
                            {status}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl">€{Number(s.amount).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Started {new Date(s.created_at).toLocaleDateString()}
                          {s.next_billing_at && !isCancelled && !isPaused && (
                            <> · Next charge {new Date(s.next_billing_at).toLocaleDateString()}</>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => navigate(`/fundraising/${s.campaign_type}/${s.campaign_id}`)}
                      >
                        View campaign
                      </Button>

                      {!isCancelled && (
                        <Button
                          variant="outline" size="sm" disabled={busyId === s.id}
                          onClick={() => act(s.id, "portal")}
                        >
                          <CreditCard className="h-4 w-4 mr-1" /> Update card
                        </Button>
                      )}

                      {!isCancelled && !isPaused && (
                        <Button
                          variant="outline" size="sm" disabled={busyId === s.id}
                          onClick={() => act(s.id, "pause")}
                        >
                          <Pause className="h-4 w-4 mr-1" /> Pause
                        </Button>
                      )}

                      {!isCancelled && isPaused && (
                        <Button
                          variant="default" size="sm" disabled={busyId === s.id}
                          onClick={() => act(s.id, "resume")}
                        >
                          <Play className="h-4 w-4 mr-1" /> Resume
                        </Button>
                      )}

                      {!isCancelled && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel monthly donation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Your €{Number(s.amount).toFixed(2)}/month support will end immediately.
                                You can always start a new monthly donation later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep giving</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => act(s.id, "cancel")}
                              >
                                Cancel donation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
