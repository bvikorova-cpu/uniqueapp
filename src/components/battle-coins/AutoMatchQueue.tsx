import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Users, Clock, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropZone, type DropZoneValidation } from "@/components/kitchen-battles/DropZone";
import { useBattleCoins, BATTLE_ENTRY_COINS, type BattleModule } from "@/hooks/useBattleCoins";

const STORAGE_BUCKET = "wall-media";
const MAX_VIDEO = 50 * 1024 * 1024;
const VIDEO_EXTS = ["mp4", "webm", "mov", "m4v", "3gp", "3gpp", "mkv", "avi", "mpeg", "mpg", "ogv"];

const isVideoFile = (file: File) => {
  if (file.type?.toLowerCase().startsWith("video/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return VIDEO_EXTS.includes(ext);
};
const safeMime = (file: File) =>
  ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) ? file.type : "video/mp4";
const formatBytes = (b: number) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

type QueueStatus = { waiting_count: number; in_queue: boolean; my_title: string | null; since: string | null };

interface AutoMatchQueueProps {
  module: Extract<BattleModule, "kitchenstars" | "reel_battles">;
  /** Wording for the uploaded media, e.g. "clip" or "dish video". */
  mediaLabel?: string;
  /** Called after a duel was created so the parent can reload and open it. */
  onMatched: (battleId: string) => void;
  /** Called after the player was queued (no opponent yet). */
  onQueued?: () => void;
}

/**
 * Automatic opponent matching: the player uploads their video, pays the entry fee
 * and is instantly paired with a random waiting player from the SAME module.
 * If nobody is waiting they stay in the queue and can cancel for a full refund.
 */
export default function AutoMatchQueue({
  module,
  mediaLabel = "clip",
  onMatched,
  onQueued,
}: AutoMatchQueueProps) {
  const { toast } = useToast();
  const { coins, refresh: refreshCoins } = useBattleCoins(module);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    const { data } = await (supabase as any).rpc("get_battle_queue_status", { _module: module });
    if (data) setStatus(data as QueueStatus);
  }, [module]);

  useEffect(() => {
    loadStatus();
    const t = setInterval(loadStatus, 20000);
    return () => clearInterval(t);
  }, [loadStatus]);

  const validateFile = (f: File): DropZoneValidation => {
    if (!isVideoFile(f)) {
      return { ok: false, title: "Video required", reason: `"${f.name}" is not a supported video format.`, suggestion: "Upload MP4, WEBM or MOV, max 50 MB." };
    }
    if (f.size > MAX_VIDEO) {
      return { ok: false, title: "Video too large", reason: `Your video is ${formatBytes(f.size)} — the limit is 50 MB.`, suggestion: "Trim it or re-encode at 720p." };
    }
    if (f.size === 0) {
      return { ok: false, title: "Empty file", reason: "The selected file is 0 bytes.", suggestion: "Pick another video and try again." };
    }
    return { ok: true, type: "video" };
  };

  const reset = () => { setOpen(false); setTitle(""); setDesc(""); setFile(null); };

  const submit = async () => {
    if (!title.trim() || title.length > 120) {
      toast({ title: "Title required (max 120 characters)", variant: "destructive" }); return;
    }
    if (desc.length > 500) {
      toast({ title: "Description too long (max 500 characters)", variant: "destructive" }); return;
    }
    if (!file) {
      toast({ title: `${mediaLabel} video required`, variant: "destructive" }); return;
    }
    if (coins < BATTLE_ENTRY_COINS) {
      toast({
        title: "Not enough Battle Coins",
        description: `Entry costs ${BATTLE_ENTRY_COINS} Battle Coins — you have ${coins}.`,
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setBusy(false); return; }

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const path = `${session.user.id}/${module}/queue/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET)
      .upload(path, file, { contentType: safeMime(file), upsert: false });
    if (upErr) {
      setBusy(false);
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return;
    }
    const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;

    const { data, error } = await (supabase as any).rpc("join_battle_queue", {
      _module: module,
      _title: title.trim(),
      _description: desc.trim() || null,
      _video_url: publicUrl,
      _media_size: file.size,
      _media_mime: safeMime(file),
    });
    setBusy(false);

    if (error) {
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      const msg = error.message || "";
      toast({
        title: msg.includes("INSUFFICIENT_COINS")
          ? "Not enough Battle Coins"
          : msg.includes("ALREADY_IN_QUEUE")
            ? "You are already waiting in the queue"
            : "Could not join matchmaking",
        description: msg.includes("INSUFFICIENT_COINS")
          ? `Entry costs ${BATTLE_ENTRY_COINS} Battle Coins — you have ${coins}.`
          : msg,
        variant: "destructive",
      });
      return;
    }

    window.dispatchEvent(new Event("battle-coins-updated"));
    await Promise.all([refreshCoins(), loadStatus()]);
    reset();

    if (data?.matched && data?.battle_id) {
      toast({ title: "Opponent found!", description: "Your duel is live — voting is open for 7 days." });
      onMatched(data.battle_id as string);
    } else {
      toast({
        title: "You are in the queue",
        description: "The next player who joins becomes your opponent automatically.",
      });
      onQueued?.();
    }
  };

  const cancel = async () => {
    setBusy(true);
    const { error } = await (supabase as any).rpc("leave_battle_queue", { _module: module });
    setBusy(false);
    if (error) {
      toast({ title: "Could not leave the queue", description: error.message, variant: "destructive" });
      return;
    }
    window.dispatchEvent(new Event("battle-coins-updated"));
    await Promise.all([refreshCoins(), loadStatus()]);
    toast({ title: "Queue left", description: `${BATTLE_ENTRY_COINS} Battle Coins were refunded.` });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 flex-wrap text-base">
          <span className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-primary" /> Automatic matchmaking
          </span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {status?.waiting_count ?? 0} waiting
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Upload your {mediaLabel} and we pair you with a random waiting player instantly. Entry {BATTLE_ENTRY_COINS} Battle Coins — fully refunded if you leave the queue before a match.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {status?.in_queue ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-primary/20 bg-secondary/20">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">Waiting for an opponent: {status.my_title}</p>
                <p className="text-xs text-muted-foreground">
                  In queue since {status.since ? new Date(status.since).toLocaleString() : "—"}. You will be matched automatically.
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={cancel} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
              Leave queue & refund {BATTLE_ENTRY_COINS} coins
            </Button>
          </div>
        ) : open ? (
          <div className="space-y-3">
            <Input
              placeholder={`${mediaLabel} title (max 120 characters)`}
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Short description (optional)"
              value={desc}
              maxLength={500}
              onChange={(e) => setDesc(e.target.value)}
            />
            <DropZone
              file={file}
              onChange={setFile}
              validate={validateFile}
              accept="video/*"
              hint="Video: MP4 / WEBM / MOV, max 50 MB"
            />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={submit} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shuffle className="h-4 w-4 mr-2" />}
                Find opponent ({BATTLE_ENTRY_COINS} coins)
              </Button>
              <Button variant="ghost" onClick={reset} disabled={busy}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
            <Shuffle className="h-4 w-4 mr-2" /> Auto-match me with an opponent
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
