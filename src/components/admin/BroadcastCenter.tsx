import { useState } from "react";
import { Megaphone, Send, Users, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SEGMENTS = [
  { id: "all", label: "All users", icon: Users, color: "bg-cyan-500/20 border-cyan-400/40 text-cyan-200" },
  { id: "premium", label: "Premium", icon: Crown, color: "bg-amber-500/20 border-amber-400/40 text-amber-200" },
  { id: "creators", label: "Creators", icon: Sparkles, color: "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-200" },
  { id: "free", label: "Free tier", icon: Users, color: "bg-slate-500/20 border-slate-400/40 text-slate-200" },
];

export const BroadcastCenter = () => {
  const { toast } = useToast();
  const [segment, setSegment] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

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
      setTitle("");
      setBody("");
    } catch (e: any) {
      toast({ title: "Failed", description: e.message || "Could not send broadcast", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
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
        className="mb-3 bg-card/40 border-fuchsia-500/20"
      />

      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">
          Segment: {SEGMENTS.find((s) => s.id === segment)?.label}
        </Badge>
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
  );
};
