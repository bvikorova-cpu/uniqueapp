import { useState } from "react";
import { ArrowLeft, Ticket, Sparkles, Calendar, MapPin, Clock, Share2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const COLLECTIBLE_TICKETS = [
  {
    id: "1", artist: "Luna Wave", event: "Neon Dreams Tour", date: "Mar 15, 2026",
    venue: "Virtual Arena", edition: "Gold", number: 142, totalMinted: 500,
    gradient: "from-amber-500 via-yellow-400 to-amber-600", price: 9.99,
    rarity: "Rare", perks: ["Backstage video", "Signed poster digital"],
  },
  {
    id: "2", artist: "DJ Pulse", event: "Bass Drop Festival", date: "Apr 2, 2026",
    venue: "Cyber Stadium", edition: "Diamond", number: 23, totalMinted: 100,
    gradient: "from-violet-500 via-purple-400 to-indigo-600", price: 24.99,
    rarity: "Legendary", perks: ["1-on-1 video call", "Exclusive remix", "Name in credits"],
  },
  {
    id: "3", artist: "The Vibes", event: "Acoustic Sessions", date: "Apr 10, 2026",
    venue: "Harmony Hall", edition: "Silver", number: 378, totalMinted: 1000,
    gradient: "from-gray-400 via-slate-300 to-gray-500", price: 4.99,
    rarity: "Common", perks: ["Concert replay access"],
  },
  {
    id: "4", artist: "Echo Chamber", event: "Rhythm Revolution", date: "May 1, 2026",
    venue: "Sound Dome", edition: "Platinum", number: 67, totalMinted: 250,
    gradient: "from-cyan-400 via-teal-300 to-emerald-500", price: 14.99,
    rarity: "Epic", perks: ["Priority song request", "Exclusive merch discount"],
  },
];

const RARITY_COLORS: Record<string, string> = {
  Common: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Rare: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Epic: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Legendary: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export const CollectibleTickets = ({ onBack }: Props) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handlePurchase = async (ticket: typeof COLLECTIBLE_TICKETS[0]) => {
    setPurchasing(ticket.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-concert-payment", {
        body: {
          type: "collectible_ticket",
          amount: Math.round(ticket.price * 100),
          metadata: { ticketId: ticket.id, artist: ticket.artist, edition: ticket.edition },
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        setOwned(prev => new Set(prev).add(ticket.id));
        toast({ title: "Purchase Initiated!", description: `${ticket.edition} Edition collectible ticket` });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to purchase ticket", variant: "destructive" });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Collectible Tickets works" steps={[
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
            Collectible Tickets
          </h2>
          <p className="text-sm text-muted-foreground">Limited edition digital collectibles with exclusive perks</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Collections", value: COLLECTIBLE_TICKETS.length, icon: "🎫" },
          { label: "Owned", value: owned.size, icon: "✨" },
          { label: "Rarest Owned", value: owned.size > 0 ? "Rare" : "—", icon: "💎" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <span className="text-xl block mb-1">{s.icon}</span>
              <p className="text-lg font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COLLECTIBLE_TICKETS.map((ticket, i) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all">
              {/* Ticket Header */}
              <div className={`bg-gradient-to-r ${ticket.gradient} p-4 relative`}>
                <div className="absolute top-2 right-2">
                  <Badge className={RARITY_COLORS[ticket.rarity]}>{ticket.rarity}</Badge>
                </div>
                <div className="text-center text-white">
                  <Ticket className="w-8 h-8 mx-auto mb-2 drop-shadow-lg" />
                  <h3 className="font-black text-lg drop-shadow">{ticket.artist}</h3>
                  <p className="text-sm text-white/80">{ticket.event}</p>
                </div>
                {/* Perforated edge */}
                <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-1">
                  {Array.from({ length: 20 }).map((_, j) => (
                    <div key={j} className="w-2 h-2 rounded-full bg-background" />
                  ))}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" /> {ticket.date}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {ticket.venue}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{ticket.edition} Edition</p>
                    <p className="text-xs font-mono text-muted-foreground">#{ticket.number} / {ticket.totalMinted}</p>
                  </div>
                  <p className="text-xl font-black text-primary">€{ticket.price}</p>
                </div>

                {/* Perks */}
                <div className="space-y-1">
                  <p className="text-xs font-bold">Included Perks:</p>
                  {ticket.perks.map((perk, j) => (
                    <div key={j} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="w-3 h-3 text-primary" /> {perk}
                    </div>
                  ))}
                </div>

                {owned.has(ticket.id) ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={async () => {
                      const shareData = {
                        title: `${ticket.artist} — ${ticket.event}`,
                        text: `I own ticket #${ticket.number}/${ticket.totalMinted} (${ticket.edition}) for ${ticket.artist}'s ${ticket.event}!`,
                        url: window.location.href,
                      };
                      try {
                        if (navigator.share) await navigator.share(shareData);
                        else { await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); toast({ description: "Copied to clipboard" }); }
                      } catch {}
                    }}><Share2 className="w-3 h-3 mr-1" /> Share</Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                      const data = { ...ticket, ownedAt: new Date().toISOString() };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `ticket-${ticket.artist}-${ticket.number}.json`; a.click();
                      URL.revokeObjectURL(url);
                      toast({ description: "Ticket saved" });
                    }}><Download className="w-3 h-3 mr-1" /> Save</Button>
                  </div>
                ) : (
                  <Button onClick={() => handlePurchase(ticket)} disabled={purchasing === ticket.id} className="w-full" size="sm">
                    {purchasing === ticket.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                    Collect — €{ticket.price}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
    );
};
