import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ComedianGoLiveButtonProps {
  comedianId: string;
}

export function ComedianGoLiveButton({ comedianId }: ComedianGoLiveButtonProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState({
    title: "",
    description: "",
    ticketPrice: "20",
    duration: "60",
  });

  const startShow = async () => {
    if (!showData.title.trim()) {
      toast.error("Enter a show title");
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = new Date();
      const endsAt = new Date(scheduledAt.getTime() + parseInt(showData.duration) * 60000);

      const { data, error } = await supabase
        .from("comedy_shows")
        .insert({
          comedian_id: comedianId,
          title: showData.title,
          description: showData.description,
          ticket_price_coins: parseInt(showData.ticketPrice),
          duration_minutes: parseInt(showData.duration),
          scheduled_at: scheduledAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: "live",
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success("Show started!");
      setOpen(false);
      navigate(`/comedy-live/${data.id}`);
    } catch (error) {
      console.error("Error starting show:", error);
      toast.error("Failed to start show");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Comedian Go Live Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Comedian Go Live Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Comedian Go Live Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
            Start Live Comedy Show
          </DialogTitle>
          <DialogDescription>
            Start a live comedy show for your audience
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Show Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Friday Night Laughs"
              value={showData.title}
              onChange={(e) =>
                setShowData({ ...showData, title: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's your show about..."
              value={showData.description}
              onChange={(e) =>
                setShowData({ ...showData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ticketPrice">Ticket Price (coins)</Label>
              <Input
                id="ticketPrice"
                type="number"
                min="0"
                value={showData.ticketPrice}
                onChange={(e) =>
                  setShowData({ ...showData, ticketPrice: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                value={showData.duration}
                onChange={(e) =>
                  setShowData({ ...showData, duration: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={startShow}
            disabled={loading || !showData.title.trim()}
            className="bg-gradient-to-r from-red-600 to-pink-600"
          >
            {loading ? "Starting..." : "Start Show"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
