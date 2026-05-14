import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ComedyLiveStreamPlayer } from "@/components/comedy/ComedyLiveStreamPlayer";
import { TipAnimation } from "@/components/comedy/TipAnimation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ComedyLiveShow() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShow();
  }, [showId]);

  const loadShow = async () => {
    const { data, error } = await supabase
      .from("comedy_shows")
      .select("*, comedian:comedian_profiles(*)")
      .eq("id", showId)
      .single();

    if (error) {
      console.error("Error loading show:", error);
      navigate("/comedy-club");
      return;
    }

    setShow(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!show) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6 mt-16">
        <Button variant="ghost" onClick={() => navigate("/comedian-dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-6">
          <h1 className="text-3xl font-black mb-2">{show.title}</h1>
          <p className="text-muted-foreground mb-6">by {show.comedian?.stage_name}</p>
          
          <ComedyLiveStreamPlayer showId={show.id} streamKey={show.stream_key || ""} />
        </Card>

        <TipAnimation performerName={show.comedian?.stage_name || "Comedian"} />
      </div>
    </div>
  );
}
