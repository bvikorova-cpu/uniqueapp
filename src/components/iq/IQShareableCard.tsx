import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Share2, Download, Twitter, Facebook, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIQUserStats } from "@/hooks/useIQUserStats";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQShareableCard() {
  const { data: stats, isLoading } = useIQUserStats();
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `iq-score-${stats?.best_iq ?? "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Downloaded!", description: "Share your achievement." });
    } catch (e) {
      toast({ title: "Failed", description: "Could not generate image", variant: "destructive" });
    }
  };

  const shareNative = async () => {
    const text = `🧠 My IQ score is ${stats?.best_iq ?? "—"}! Tier: ${stats?.tier ?? "Bronze"}. Beat me on Unique IQ Platform!`;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My IQ Score", text, url });
      } catch {/* cancelled */}
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast({ title: "Copied to clipboard" });
    }
  };

  const shareTo = (platform: "twitter" | "facebook") => {
    const text = encodeURIComponent(`🧠 My IQ is ${stats?.best_iq ?? "—"}! Beat me on Unique IQ Platform.`);
    const url = encodeURIComponent(window.location.href);
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    };
    window.open(links[platform], "_blank", "width=600,height=500");
  };

  if (isLoading) return <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  if (!stats || !stats.best_iq) return null;

  return (
    <>
      <FloatingHowItWorks title="How IQShareable Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">📣 Share Your Score</h2>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2"><Share2 className="h-4 w-4 text-violet-500" /> Brag a little</CardTitle>
          <CardDescription className="text-xs">Generate a beautiful card to share on social media</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div
            ref={cardRef}
            className="relative aspect-[16/9] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden p-8 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, hsl(270 91% 25%), hsl(330 100% 35%))",
            }}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                <span className="font-black text-lg">Unique IQ</span>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">{stats.tier}</Badge>
            </div>
            <div className="text-center text-white">
              <p className="text-xs opacity-80 uppercase tracking-widest">Verified IQ Score</p>
              <p className="text-7xl sm:text-8xl font-black drop-shadow-lg">{stats.best_iq}</p>
              <p className="text-sm opacity-90 mt-1">{stats.total_tests} tests · {stats.current_streak}-day streak</p>
            </div>
            <div className="text-right text-white/80 text-xs">uniqueapp.fun</div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button size="sm" onClick={shareNative} className="bg-gradient-to-r from-violet-600 to-purple-600">
              <Share2 className="h-3.5 w-3.5 mr-1" /> Share
            </Button>
            <Button size="sm" variant="outline" onClick={downloadAsImage}>
              <Download className="h-3.5 w-3.5 mr-1" /> Download PNG
            </Button>
            <Button size="sm" variant="outline" onClick={() => shareTo("twitter")}>
              <Twitter className="h-3.5 w-3.5 mr-1" /> Twitter
            </Button>
            <Button size="sm" variant="outline" onClick={() => shareTo("facebook")}>
              <Facebook className="h-3.5 w-3.5 mr-1" /> Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
}
