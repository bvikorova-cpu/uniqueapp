import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Bug, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BugReport {
  id: string;
  title: string;
  description: string;
  steps: string | null;
  page_url: string | null;
  severity: "minor" | "major" | "critical";
  status: "new" | "triage" | "confirmed" | "rejected" | "duplicate" | "fixed";
  rewarded: boolean;
  reward_amount: number;
  response_message: string | null;
  response_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  new: { label: "Received", color: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  triage: { label: "In review", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  confirmed: { label: "Confirmed", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  fixed: { label: "Fixed", color: "bg-primary/15 text-primary border-primary/30" },
  rejected: { label: "Not a bug", color: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  duplicate: { label: "Duplicate", color: "bg-muted text-muted-foreground border-border" },
};

const SEVERITY_META: Record<string, { label: string; color: string }> = {
  minor: { label: "Minor", color: "bg-slate-500/15 text-slate-600 border-slate-500/30" },
  major: { label: "Major", color: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  critical: { label: "Critical", color: "bg-red-500/15 text-red-600 border-red-500/30" },
};

export default function MyBugReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bug_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setReports((data as BugReport[]) ?? []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`my-bug-reports-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bug_reports", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!user) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Sign in to view your bug reports.</p>
        <Button className="mt-4" onClick={() => navigate("/auth")}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bug className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My bug reports</h1>
          <p className="text-sm text-muted-foreground">
            Track the status of your submissions and read replies from the team.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">You have not submitted any bug reports yet.</p>
          <Button className="mt-4" onClick={() => navigate("/report-bug")}>
            Report a bug
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const status = STATUS_META[r.status] ?? STATUS_META.new;
            const severity = SEVERITY_META[r.severity] ?? SEVERITY_META.minor;
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={status.color}>
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className={severity.color}>
                    {severity.label}
                  </Badge>
                  {r.rewarded && (
                    <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                      +{r.reward_amount} credits
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{r.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                  {r.description}
                </p>
                {r.response_message && (
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      Team reply
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{r.response_message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {r.response_at && formatDistanceToNow(new Date(r.response_at), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
