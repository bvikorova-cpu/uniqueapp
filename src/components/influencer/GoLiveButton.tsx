import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Switch } from "@/components/ui/switch";
import { Video, Radio, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface GoLiveButtonProps {
  influencerId: string;
}

export function GoLiveButton({ influencerId }: GoLiveButtonProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduled_at: "",
  });
  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("Enter stream title");
      return;
    }
    if (scheduleLater && !form.scheduled_at) {
      toast.error("Pick a start time");
      return;
    }

    setLoading(true);
    try {
      const streamKey = `${influencerId}_${Date.now()}`;
      const payload: Record<string, unknown> = {
        influencer_id: influencerId,
        title: form.title,
        description: form.description,
        stream_key: streamKey,
        min_tier: null,
      };

      if (scheduleLater) {
        payload.is_live = false;
        payload.scheduled_at = new Date(form.scheduled_at).toISOString();
      } else {
        payload.is_live = true;
        payload.started_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("live_streams")
        .insert(payload as any)
        .select()
        .single();

      if (error) throw error;

      if (scheduleLater) {
        toast.success("Stream scheduled!");
        setOpen(false);
      } else {
        toast.success("Stream started!");
        setOpen(false);
        navigate(`/live/${data.id}`);
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      toast.error("Error starting stream");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title={"Go Live - How it works"}
        steps={[
          { title: "Start or Schedule", desc: "Go live now or pick a future date/time to notify your fans in advance." },
          { title: "Choose audience", desc: "Open to everyone or restrict to Bronze / Silver / Gold Fan Club members." },
          { title: "Broadcast & interact", desc: "Chat, receive tips, and see the top supporter leaderboard in real time." },
          { title: "Save the replay", desc: "Archive your recording so fans can rewatch after the stream ends." },
        ]}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
            <Radio className="h-4 w-4 animate-pulse" />
            Go Live
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {scheduleLater ? "Schedule Live Stream" : "Start Live Stream"}
            </DialogTitle>
            <DialogDescription>
              {scheduleLater
                ? "Announce upcoming broadcasts to your fans"
                : "Go live right now and interact with your audience"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                <Label htmlFor="sch" className="cursor-pointer">Schedule for later</Label>
              </div>
              <Switch id="sch" checked={scheduleLater} onCheckedChange={setScheduleLater} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Stream Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Q&A with fans"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What will the stream be about..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>

            {scheduleLater && (
              <div className="grid gap-2">
                <Label htmlFor="when">Start date & time *</Label>
                <Input
                  id="when"
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Every stream is public — anyone can watch, send gifts and Super Chats.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={loading || !form.title.trim()}
              className="bg-gradient-to-r from-red-600 to-pink-600"
            >
              {loading ? "Working..." : scheduleLater ? "Schedule" : "Start Stream"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
