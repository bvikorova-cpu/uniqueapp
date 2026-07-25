import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { StreamAnalyticsDashboard } from "@/components/creator/StreamAnalyticsDashboard";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function CreatorLiveAnalytics() {
  const navigate = useNavigate();
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase
        .from("influencer_profiles")
        .select("id")
        .eq("user_id", u.user.id)
        .maybeSingle();
      setInfluencerId(data?.id ?? null);
      setLoading(false);
    })();
  }, [navigate]);

  return (
    <>
      <FloatingHowItWorks
        title="Live Stream Analytics — How it works"
        steps={[
          { title: "Overview", desc: "See every stream you have hosted, most recent first." },
          { title: "Metrics", desc: "Unique viewers, peak concurrent, average watch time and total tips per stream." },
          { title: "Top supporters", desc: "The 5 fans who tipped the most during each stream." },
          { title: "Improve", desc: "Use peaks and watch time to plan future streams and reward top fans." },
        ]}
      />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/influ-king")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Live Stream Analytics</h1>
              <p className="text-sm text-muted-foreground">Viewers, watch time, peaks, and top fans</p>
            </div>
          </div>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : influencerId ? (
            <StreamAnalyticsDashboard influencerId={influencerId} />
          ) : (
            <p className="text-muted-foreground">Create an influencer profile first.</p>
          )}
        </div>
      </div>
    </>
  );
}
