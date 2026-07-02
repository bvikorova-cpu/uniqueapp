import { useState } from "react";
import { ArrowLeft, Music2, DollarSign, Clock, Heart, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const REQUEST_TIERS = [
  { id: "standard", label: "Standard", price: 1, icon: "🎵", description: "Your request joins the queue", color: "bg-primary/10 border-primary/30 text-primary" },
  { id: "priority", label: "Priority", price: 3, icon: "⭐", description: "Bumped to front of queue", color: "bg-amber-500/10 border-amber-500/30 text-amber-500" },
  { id: "guaranteed", label: "Guaranteed", price: 5, icon: "👑", description: "Artist plays it next + shoutout", color: "bg-violet-500/10 border-violet-500/30 text-violet-500" },
];

const TRENDING_SONGS = [
  { title: "Bohemian Rhapsody", artist: "Queen", requests: 142 },
  { title: "Blinding Lights", artist: "The Weeknd", requests: 98 },
  { title: "Shape of You", artist: "Ed Sheeran", requests: 87 },
  { title: "Levitating", artist: "Dua Lipa", requests: 76 },
  { title: "Dance Monkey", artist: "Tones and I", requests: 65 },
];

export const SongRequests = ({ onBack }: Props) => {
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [selectedTier, setSelectedTier] = useState("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<Array<{ song: string; tier: string; status: string }>>([]);
  const { toast } = useToast();

  const handleSubmitRequest = async () => {
    if (!songTitle.trim()) {
      toast({ title: "Missing Info", description: "Please enter a song title", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const tier = REQUEST_TIERS.find(t => t.id === selectedTier)!;
      
      const { data, error } = await supabase.functions.invoke("create-concert-payment", {
        body: {
          type: "song_request",
          amount: tier.price * 100,
          metadata: { song: songTitle, artist: artistName, tier: selectedTier },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        setMyRequests(prev => [...prev, { song: songTitle, tier: selectedTier, status: "pending" }]);
        setSongTitle("");
        setArtistName("");
        toast({ title: "Request Submitted!", description: `Your ${tier.label} request is being processed` });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit request", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Song Requests works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Live Song Requests
          </h2>
          <p className="text-sm text-muted-foreground">Request songs during live performances</p>
        </div>
      </div>

      {/* Request Form */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Music2 className="w-5 h-5 text-primary" /> Request a Song</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Song Title *</label>
              <Input placeholder="Enter song name..." value={songTitle} onChange={e => setSongTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Artist (optional)</label>
              <Input placeholder="Original artist..." value={artistName} onChange={e => setArtistName(e.target.value)} />
            </div>
          </div>

          {/* Tier Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Request Tier</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {REQUEST_TIERS.map(tier => (
                <motion.div
                  key={tier.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                    selectedTier === tier.id ? tier.color + " ring-2 ring-offset-2 ring-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl block mb-1">{tier.icon}</span>
                  <p className="font-bold text-sm">{tier.label}</p>
                  <p className="text-xl font-black">€{tier.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmitRequest} disabled={isSubmitting || !songTitle.trim()} className="w-full" size="lg">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <DollarSign className="w-4 h-4 mr-2" />}
            Submit Request — €{REQUEST_TIERS.find(t => t.id === selectedTier)?.price}
          </Button>
        </CardContent>
      </Card>

      {/* My Requests */}
      {myRequests.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> My Requests</h3>
            <div className="space-y-2">
              {myRequests.map((req, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{req.song}</p>
                    <Badge variant="outline" className="text-xs mt-1">{req.tier}</Badge>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">{req.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Songs */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Trending Requests</h3>
          <div className="space-y-2">
            {TRENDING_SONGS.map((song, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => { setSongTitle(song.title); setArtistName(song.artist); }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-muted-foreground w-6">#{i + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{song.title}</p>
                    <p className="text-xs text-muted-foreground">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3" /> {song.requests}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
