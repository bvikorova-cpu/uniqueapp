import { useState } from "react";
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
import { Video, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GoLiveButtonProps {
  influencerId: string;
}

export function GoLiveButton({ influencerId }: GoLiveButtonProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamData, setStreamData] = useState({
    title: "",
    description: "",
  });

  const startStream = async () => {
    if (!streamData.title.trim()) {
      toast.error("Zadaj názov streamu");
      return;
    }

    setLoading(true);
    try {
      // Generate unique stream key
      const streamKey = `${influencerId}_${Date.now()}`;

      const { data, error } = await supabase
        .from("live_streams")
        .insert({
          influencer_id: influencerId,
          title: streamData.title,
          description: streamData.description,
          stream_key: streamKey,
          is_live: true,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Stream spustený!");
      setOpen(false);
      navigate(`/live/${data.id}`);
    } catch (error) {
      console.error("Error starting stream:", error);
      toast.error("Chyba pri spustení streamu");
    } finally {
      setLoading(false);
    }
  };

  return (
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
            Spusti živé vysielanie
          </DialogTitle>
          <DialogDescription>
            Spusti živý stream pre svojich fanúšikov
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Názov streamu *</Label>
            <Input
              id="title"
              placeholder="napr. Odpovede na vaše otázky"
              value={streamData.title}
              onChange={(e) =>
                setStreamData({ ...streamData, title: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Popis</Label>
            <Textarea
              id="description"
              placeholder="O čom bude stream..."
              value={streamData.description}
              onChange={(e) =>
                setStreamData({ ...streamData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Tip pre úspešný stream:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Priprav si témy na rozhovor</li>
              <li>• Interaguj so sledovateľmi v chate</li>
              <li>• Pozdrav nových sledovateľov menom</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Zrušiť
          </Button>
          <Button
            onClick={startStream}
            disabled={loading || !streamData.title.trim()}
            className="bg-gradient-to-r from-red-600 to-pink-600"
          >
            {loading ? "Spúšťam..." : "Spustiť stream"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
