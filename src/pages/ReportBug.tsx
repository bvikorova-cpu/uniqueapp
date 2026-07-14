import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bug, Gift, Loader2, ArrowLeft } from "lucide-react";

type Severity = "minor" | "major" | "critical";

const REWARDS: Record<Severity, number> = { minor: 5, major: 25, critical: 50 };

export default function ReportBug() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [pageUrl, setPageUrl] = useState(
    typeof window !== "undefined" ? window.location.href : ""
  );
  const [severity, setSeverity] = useState<Severity>("minor");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 4 || description.trim().length < 10) {
      toast.error("Please provide a clear title and description.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bug_reports").insert({
      user_id: user?.id ?? null,
      email: email || user?.email || null,
      title: title.trim(),
      description: description.trim(),
      steps: steps.trim() || null,
      page_url: pageUrl || null,
      severity,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      "Thank you! We received your report. Confirmed bugs are rewarded with AI credits."
    );
    navigate("/");
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bug className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Report a bug</h1>
            <p className="text-sm text-muted-foreground">
              Help us polish Unique. Confirmed reports are rewarded.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <Gift className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold">Reward for confirmed bugs</div>
            <div className="text-muted-foreground">
              Minor +5 · Major +25 · Critical/security +50 AI credits
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Short title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Checkout button does nothing on mobile"
              required
              minLength={4}
              maxLength={140}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">What happened? *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue as clearly as you can."
              required
              minLength={10}
              maxLength={4000}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Steps to reproduce (optional)</Label>
            <Textarea
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="1. Open page X&#10;2. Click Y&#10;3. See error"
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_url">Page URL</Label>
            <Input
              id="page_url"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="https://uniqueapp.fun/..."
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="email">Your email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Sign in to receive AI credit rewards automatically.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Severity *</Label>
            <RadioGroup
              value={severity}
              onValueChange={(v) => setSeverity(v as Severity)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              {(["minor", "major", "critical"] as Severity[]).map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${
                    severity === s
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={s} id={`sev-${s}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium capitalize">{s}</div>
                    <Badge variant="secondary" className="mt-1">
                      +{REWARDS[s]} credits
                    </Badge>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bug className="h-4 w-4" />
            )}
            Submit report
          </Button>
        </form>
      </Card>
    </div>
  );
}
