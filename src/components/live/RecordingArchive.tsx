import { Play, Trash2, Eye, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLiveRecordings } from "@/hooks/useLiveRecordings";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  ownerId?: string;
  canDelete?: boolean;
}

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const RecordingArchive = ({ ownerId, canDelete }: Props) => {
  const { recordings, isLoading, deleteRecording } = useLiveRecordings(ownerId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading recordings...</p>;
  if (recordings.length === 0)
    return <p className="text-sm text-muted-foreground text-center py-8">No recordings yet</p>;

  return (
    <>
      <FloatingHowItWorks title={"Recording Archive - How it works"} steps={[{ title: 'Open', desc: 'Access the Recording Archive section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Recording Archive.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recordings.map((r) => (
        <Card key={r.id} className="overflow-hidden group">
          <div className="relative aspect-video bg-muted">
            {r.thumbnail_url ? (
              <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Play className="h-12 w-12 opacity-30" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDuration(r.duration_seconds)}
            </div>
            <a
              href={r.playback_url}
              target="_blank"
              rel="noreferrer"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition"
            >
              <Play className="h-12 w-12 text-white" />
            </a>
          </div>
          <div className="p-3 space-y-1">
            <h4 className="font-semibold text-sm line-clamp-1">{r.title}</h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {r.views_count}
              </span>
              <span>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
            </div>
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-destructive"
                onClick={() => deleteRecording(r.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
    </>
  );
};
