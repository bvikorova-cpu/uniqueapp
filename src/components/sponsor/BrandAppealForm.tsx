import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquareWarning, Gavel } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Appeal = {
  id: string;
  status: "pending" | "under_review" | "accepted" | "dismissed";
  appeal_text: string;
  supporting_url: string | null;
  admin_response: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  under_review: "Under review",
  accepted: "Accepted",
  dismissed: "Dismissed",
};

export function BrandAppealForm({ brandId, brandUserId }: { brandId: string; brandUserId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: appeals = [] } = useQuery({
    queryKey: ["brand-appeals", brandId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("brand_moderation_appeals")
        .select("id, status, appeal_text, supporting_url, admin_response, created_at, reviewed_at")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Appeal[];
    },
  });

  const latest = appeals[0];
  const hasOpen = latest && (latest.status === "pending" || latest.status === "under_review");

  const submit = async () => {
    if (text.trim().length < 20) {
      toast.error("Please provide at least 20 characters explaining your appeal.");
      return;
    }
    setBusy(true);
    const { error } = await (supabase as any)
      .from("brand_moderation_appeals")
      .insert({
        brand_id: brandId,
        user_id: brandUserId,
        appeal_text: text.trim(),
        supporting_url: url.trim() || null,
        status: "pending",
      });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Appeal submitted — an admin will review shortly.");
    setOpen(false);
    setText(""); setUrl("");
    qc.invalidateQueries({ queryKey: ["brand-appeals", brandId] });
  };

  return (
    <div className="mt-3 space-y-2" data-testid="brand-appeal-section">
      {appeals.length > 0 && (
        <div className="space-y-2">
          {appeals.slice(0, 3).map((a) => (
            <div key={a.id} className="rounded-md border border-border/40 bg-black/30 p-3 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant={a.status === "accepted" ? "default" : a.status === "dismissed" ? "destructive" : "secondary"}>
                  {STATUS_LABEL[a.status]}
                </Badge>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-1 text-gray-300 line-clamp-2">{a.appeal_text}</p>
              {a.admin_response && (
                <p className="mt-1 text-gray-400"><Gavel className="inline h-3 w-3 mr-1" />{a.admin_response}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={hasOpen} data-testid="open-appeal-dialog">
            <MessageSquareWarning className="h-4 w-4 mr-2" />
            {hasOpen ? "Appeal in progress" : appeals.length ? "Submit another appeal" : "Submit an appeal"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appeal moderation decision</DialogTitle>
            <DialogDescription>
              Provide context, clarifications, and any supporting evidence (website, social proof, ID, etc.).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Why should we reconsider?</Label>
              <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)}
                        placeholder="Explain the situation, provide proof of brand ownership, address the rejection reason…"
                        data-testid="appeal-text" />
            </div>
            <div>
              <Label>Supporting URL (optional)</Label>
              <Input type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)}
                     data-testid="appeal-url" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={busy} data-testid="submit-appeal">Submit appeal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
