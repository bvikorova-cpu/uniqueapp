import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Calendar, Radio, FileText } from "lucide-react";
import { useAudioSpaces } from "@/hooks/useAudioSpaces";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function SpacesDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const { spaces, schedule, transcribe } = useAudioSpaces();

  const submit = () => {
    if (!title.trim()) return;
    schedule.mutate(
      { title, description, scheduled_at: scheduledAt || null },
      { onSuccess: () => { setTitle(""); setDescription(""); setScheduledAt(""); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mic className="h-4 w-4" /> Spaces
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Audio Spaces</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 p-3 rounded-lg border">
            <h4 className="font-semibold text-sm">Schedule a new Space</h4>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            <Button onClick={submit} disabled={!title.trim() || schedule.isPending} className="w-full gap-2">
              {scheduledAt ? <><Calendar className="h-4 w-4" /> Schedule</> : <><Radio className="h-4 w-4" /> Go Live Now</>}
            </Button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {spaces.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No spaces yet</p>}
            {spaces.map((s) => (
              <div key={s.id} className="p-3 rounded-lg border space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.title}</p>
                    {s.scheduled_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(s.scheduled_at), "PPp")}
                      </p>
                    )}
                  </div>
                  <Badge variant={s.status === "live" ? "destructive" : s.status === "ended" ? "secondary" : "default"}>
                    {s.status}
                  </Badge>
                </div>
                {s.recording_url && s.transcript_status !== "done" && (
                  <Button size="sm" variant="ghost" className="gap-1 h-7"
                    onClick={() => transcribe.mutate({ spaceId: s.id, recordingUrl: s.recording_url! })}
                    disabled={transcribe.isPending}>
                    <FileText className="h-3 w-3" /> Transcribe
                  </Button>
                )}
                {s.transcript && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.transcript}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
