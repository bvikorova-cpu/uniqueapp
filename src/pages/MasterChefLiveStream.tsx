import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Radio, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function MasterChefLiveStream() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setIsStreaming(true);
    toast({ title: "Stream Started!", description: "Your kitchen is now live. Share the link with viewers!" });
  };

  return (
    <>
      <FloatingHowItWorks title="How Master Chef Live Stream works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            Live Kitchen Stream
          </h1>
          <p className="text-muted-foreground text-lg">Stream your cooking live and get real-time votes from viewers</p>
        </div>

        <Card className={isStreaming ? "border-red-500/50 bg-red-500/5" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isStreaming ? <Radio className="h-5 w-5 text-red-500 animate-pulse" /> : <Video className="h-5 w-5 text-primary" />}
              {isStreaming ? "You Are LIVE!" : "Start Your Kitchen Stream"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isStreaming ? (
              <>
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Radio className="h-16 w-16 mx-auto mb-4 text-red-500 animate-pulse" />
                    <p className="text-xl font-bold">Camera Feed Active</p>
                    <p className="text-sm text-white/60 mt-2">Viewers can see your cooking in real-time</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-medium">Live Viewers</span>
                  </div>
                  <span className="text-2xl font-bold">0</span>
                </div>
                <Button variant="destructive" className="w-full" onClick={() => setIsStreaming(false)}>
                  End Stream
                </Button>
              </>
            ) : (
              <>
                <div className="aspect-video bg-secondary/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Your camera preview will appear here</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h3 className="font-semibold mb-2">How Live Streaming Works:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Start your stream and cook your dish live</li>
                    <li>• Viewers watch and can vote in real-time</li>
                    <li>• Top-voted streams get featured on the main page</li>
                    <li>• Earn bonus XP for live cooking sessions</li>
                  </ul>
                </div>
                <Button size="lg" className="w-full" onClick={startStream}>
                  <Radio className="h-4 w-4 mr-2" /> Go Live
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
