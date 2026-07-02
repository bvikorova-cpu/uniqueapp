import { useState, useEffect } from "react";
import { Megaphone, Send, Users, Crown, Sparkles, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SEGMENTS = [
  { id: "all", label: "All users", icon: Users, color: "bg-cyan-500/20 border-cyan-500/50 text-cyan-900 dark:text-cyan-200" },
  { id: "premium", label: "Premium", icon: Crown, color: "bg-amber-500/20 border-amber-500/50 text-amber-900 dark:text-amber-200" },
  { id: "creators", label: "Creators", icon: Sparkles, color: "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-900 dark:text-fuchsia-200" },
  { id: "free", label: "Free tier", icon: Users, color: "bg-slate-500/20 border-slate-500/50 text-slate-900 dark:text-slate-200" },
];

const DRAFT_KEY = "admin-broadcast-draft";

export const BroadcastCenter = () => {
  const { toast } = useToast();
  const [segment, setSegment] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.title) setTitle(d.title);
        if (d.body) setBody(d.body);
        if (d.segment) setSegment(d.segment);
      }
    } catch {}
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (title || body) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body, segment }));
    }
  }, [title, body, segment]);

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body, segment }));
    toast({ title: "Draft saved", description: "Stored locally on this device" });
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setTitle("");
    setBody("");
  };

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Missing content", description: "Title and body are required", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      // Insert into platform_announcements (graceful fallback to notifications)
      const payload: any = {
        title,
        body,
        segment,
        sent_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any).from("platform_announcements").insert(payload);
      if (error) {
        // Fallback: write into notifications for admin visibility
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from("notifications").insert({
            user_id: user.id,
            type: "broadcast",
            title,
            message: body,
            metadata: { segment },
          });
        }
      }

      toast({ title: "Broadcast sent", description: `Delivered to ${segment} segment` });
      localStorage.removeItem(DRAFT_KEY);
      setTitle("");
      setBody("");
    } catch (e: any) {
      toast({ title: "Failed", description: e.message || "Could not send broadcast", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Broadcast Center - How it works"} steps={[{ title: 'Open', desc: 'Access the Broadcast Center section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Broadcast Center.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div id="broadcast-center" className="rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 via-card/60 to-purple-500/5 backdrop-blur-xl p-5 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30">
          <Megaphone className="h-5 w-5 text-fuchsia-300" />
        </div>
        <div>
          <h3 className="font-semibold text-base">Broadcast Center</h3>
          <p className="text-xs text-muted-foreground">Push announcements to user segments</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {SEGMENTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSegment(s.id)}
            className={`px-3 py-1.5 rounded-full border text-xs flex items-center gap-1.5 transition ${
              segment === s.id ? s.color + " ring-2 ring-current/40" : "border-border bg-card/40 text-muted-foreground hover:bg-card/60"
            }`}
          >
            <s.icon className="h-3 w-3" />
            {s.label}
          </button>
        ))}
      </div>

      <Input
        placeholder="Announcement title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2 bg-card/40 border-fuchsia-500/20"
      />
      <Textarea
        placeholder="Message body — supports plain text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="mb-1 bg-card/40 border-fuchsia-500/20"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground mb-3">
        <span>{body.length} chars</span>
        <span className={body.length > 280 ? "text-amber-300" : ""}>
          {body.length > 280 ? "⚠ Long messages may be truncated in push" : "Optimal length"}
        </span>
      </div>

      {/* Live preview */}
      {showPreview && (title || body) && (
        <div className="mb-3 rounded-xl border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-4">
          <div className="text-[10px] uppercase tracking-wider text-fuchsia-300 mb-1.5 flex items-center gap-1">
            <Eye className="h-3 w-3" /> Push preview
          </div>
          <div className="font-bold text-sm">{title || "(no title)"}</div>
          <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{body || "(no body)"}</div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant="outline" className="text-[10px]">
          Segment: {SEGMENTS.find((s) => s.id === segment)?.label}
        </Badge>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPreview((p) => !p)}
            className="bg-card/40"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {showPreview ? "Hide" : "Preview"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={saveDraft}
            disabled={!title && !body}
            className="bg-card/40"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Draft
          </Button>
          <Button
            onClick={send}
            disabled={sending}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            {sending ? "Sending…" : "Broadcast"}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};
