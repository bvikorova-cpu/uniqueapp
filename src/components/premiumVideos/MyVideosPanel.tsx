import { useState } from "react";
import {
  Coins,
  Euro,
  Loader2,
  Lock,
  Pencil,
  Trash2,
  TrendingUp,
  Video as VideoIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BoostVideoDialog from "@/components/premiumVideos/BoostVideoDialog";
import VideoFrameDialog from "@/components/premiumVideos/VideoFrameDialog";
import { useMyPremiumVideos, type MyVideoStats } from "@/hooks/useMyPremiumVideos";

export default function MyVideosPanel({ onChanged }: { onChanged?: () => void }) {
  const { videos, loading, busyId, totals, update, remove, refetch } = useMyPremiumVideos();
  const [editing, setEditing] = useState<MyVideoStats | null>(null);
  const [deleting, setDeleting] = useState<MyVideoStats | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);

  const openEdit = (v: MyVideoStats) => {
    setEditing(v);
    setTitle(v.title);
    setDescription(v.description ?? "");
    setPublished(v.is_published);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!title.trim()) return;
    const ok = await update(editing.id, {
      title: title.trim(),
      description: description.trim() || null,
      is_published: published,
    });
    if (ok) {
      setEditing(null);
      onChanged?.();
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const ok = await remove(deleting);
    if (ok) {
      setDeleting(null);
      onChanged?.();
    }
  };

  const stats = [
    { label: "Videos", value: totals.videos, icon: VideoIcon },
    {
      label: "Earned in EUR",
      value: `€${(totals.unlocks * 0.25).toFixed(2)}`,
      icon: Euro,
    },
    { label: "Unlocks", value: totals.unlocks, icon: Lock },
    { label: "Earned credits", value: totals.earnedCredits, icon: Coins },
  ];

  return (
    <Card className="mb-6 border-border/60 bg-card/60 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" /> My videos &amp; earnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-background/50 p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </p>
              <p className="text-xl font-black">{loading ? "…" : s.value}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          You receive <strong>€0.25</strong> per unlock (0.5 video credit). Halves accumulate and are
          paid into your video credit wallet once they reach a full credit — already paid out:{" "}
          <strong>{totals.paidOutCredits}</strong> credits, waiting:{" "}
          <strong>{totals.pendingCredits}</strong>. Spent on boosts:{" "}
          <strong>{totals.boostSpent}</strong> credits.
        </p>

        <p className="rounded-xl border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
          <strong>Value &amp; fees:</strong> Each unlock earns you <strong>€0.25</strong> (0.5 video
          credit, valued at €0.50 per credit). Stripe charges a processing fee of{" "}
          <strong>1.5% + €0.25</strong> per European card transaction (2.5% + €0.25 for
          non-European cards). The minimum creator payout is <strong>€20</strong>. Please count
          with these fees — the final amount landing on your account is lower than the EUR value
          shown above.
        </p>

        <CreatorCashoutCard />




        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : videos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            You haven&apos;t uploaded a video yet.
          </p>
        ) : (
          <div className="space-y-3">
            {videos.map((v) => {
              const boosted = v.boost_until && new Date(v.boost_until) > new Date();
              return (
                <div
                  key={v.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/50 p-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{v.title}</p>
                      {!v.is_published && <Badge variant="outline">Hidden</Badge>}
                      {boosted && <Badge variant="secondary">{v.boost_tier} boost active</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {v.views_count} views · {v.unlocks_count} unlocks · {v.earned_credits} credits earned ·{" "}
                      {new Date(v.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <BoostVideoDialog videoId={v.id} onBoosted={onChanged} />
                    <VideoFrameDialog
                      videoId={v.id}
                      currentSlug={v.frame_slug}
                      onChanged={() => {
                        refetch();
                        onChanged?.();
                      }}
                    />
                    <Button size="sm" variant="outline" onClick={() => openEdit(v)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={busyId === v.id}
                      onClick={() => setDeleting(v)}
                    >
                      {busyId === v.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit video</DialogTitle>
            <DialogDescription>
              Change the title, description or hide the video from the feed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mv-title">Title</Label>
              <Input
                id="mv-title"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mv-desc">Description</Label>
              <Textarea
                id="mv-desc"
                value={description}
                maxLength={500}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Off = only you can see it.</p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={!title.trim() || busyId === editing?.id}>
              {busyId === editing?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” and its file will be removed permanently. Credits already earned stay
              in your wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
