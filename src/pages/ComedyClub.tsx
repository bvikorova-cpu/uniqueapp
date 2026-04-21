import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComedyClubHero } from "@/components/comedy/ComedyClubHero";
import { ComedyCurrencyDisplay } from "@/components/comedy/ComedyCurrencyDisplay";
import { BattleVoting } from "@/components/comedy/BattleVoting";
import { VideoPlayer } from "@/components/comedy/VideoPlayer";
import { ComedyRoastArena } from "@/components/comedy/ComedyRoastArena";
import { JokeWritingWorkshop } from "@/components/comedy/JokeWritingWorkshop";
import { ComedyOpenMicNight } from "@/components/comedy/ComedyOpenMicNight";
import { ComedianHallOfFame } from "@/components/comedy/ComedianHallOfFame";
import {
  useComedyShows,
  useBuyTicket,
  useComedyBattles,
  useSendTip,
  useUserTickets,
  useComedianProfile,
  useCreateComedianProfile,
  useComedyClips,
  useBuyClip,
} from "@/hooks/useComedy";
import {
  Mic2, Trophy, Video, TrendingUp, Ticket, User, Flame,
  PenTool, Crown, Star, Sparkles, Swords,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
type ActiveView = "dashboard" | "shows" | "battles" | "clips" | "tickets" | "roast" | "workshop" | "openmic" | "halloffame";

export default function ComedyClub() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const { shows } = useComedyShows();
  const { battles, refetch: refetchBattles } = useComedyBattles();
  const { tickets } = useUserTickets();
  const { clips } = useComedyClips();
  const { profile: comedianProfile } = useComedianProfile();
  const buyTicket = useBuyTicket();
  const sendTip = useSendTip();
  const buyClip = useBuyClip();
  const createProfile = useCreateComedianProfile();
  const navigate = useNavigate();

  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");

  const handleCreateProfile = () => {
    if (!stageName) return;
    createProfile.mutate({ stageName, bio }, {
      onSuccess: () => { setShowCreateProfile(false); setStageName(""); setBio(""); },
    });
  };

  const tipOptions = [
    { type: "applause", label: "👏", cost: 10 },
    { type: "flowers", label: "🌹", cost: 25 },
    { type: "mic_drop", label: "🎤", cost: 50 },
    { type: "standing_ovation", label: "🙌", cost: 100 },
  ];

  const tools = [
    { id: "shows" as const, icon: Mic2, label: "Live Shows", desc: "Watch live performances", color: "text-red-500" },
    { id: "battles" as const, icon: Swords, label: "Battles", desc: "Comedy competitions", color: "text-orange-500" },
    { id: "clips" as const, icon: Video, label: "Clip Store", desc: "Buy comedy clips", color: "text-blue-500" },
    { id: "tickets" as const, icon: Ticket, label: "My Tickets", desc: "Your purchased tickets", color: "text-green-500" },
    { id: "roast" as const, icon: Flame, label: "Roast Arena", desc: "AI-judged roast battles", color: "text-orange-500" },
    { id: "workshop" as const, icon: PenTool, label: "Joke Workshop", desc: "AI joke writing coach", color: "text-blue-500" },
    { id: "openmic" as const, icon: Star, label: "Open Mic Night", desc: "Perform & vote", color: "text-green-500" },
    { id: "halloffame" as const, icon: Crown, label: "Hall of Fame", desc: "Top comedian leaderboard", color: "text-yellow-500" },
  ];

  // Sub-views
  if (activeView === "roast") return <div className="min-h-screen bg-background p-3 sm:p-6"><div className="max-w-7xl mx-auto mt-14 sm:mt-16"><ComedyRoastArena onBack={() => setActiveView("dashboard")} /></div></div>;
  if (activeView === "workshop") return <div className="min-h-screen bg-background p-3 sm:p-6"><div className="max-w-7xl mx-auto mt-14 sm:mt-16"><JokeWritingWorkshop onBack={() => setActiveView("dashboard")} /></div></div>;
  if (activeView === "openmic") return <div className="min-h-screen bg-background p-3 sm:p-6"><div className="max-w-7xl mx-auto mt-14 sm:mt-16"><ComedyOpenMicNight onBack={() => setActiveView("dashboard")} /></div></div>;
  if (activeView === "halloffame") return <div className="min-h-screen bg-background p-3 sm:p-6"><div className="max-w-7xl mx-auto mt-14 sm:mt-16"><ComedianHallOfFame onBack={() => setActiveView("dashboard")} /></div></div>;

  // Shows view
  if (activeView === "shows") return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto mt-14 sm:mt-16 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveView("dashboard")}>← Back</Button>
        <h2 className="text-2xl font-black">🔴 Live Shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows?.map((show: any) => (
            <Card key={show.id} className="p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  {show.status === "live" && <Badge className="bg-red-500 mb-2">🔴 LIVE</Badge>}
                  <h3 className="font-bold text-lg">{show.title}</h3>
                  <p className="text-sm text-muted-foreground">by {show.comedian?.stage_name}{show.comedian?.is_verified && " ✓"}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-500">{show.ticket_price_coins}</p>
                  <p className="text-xs text-muted-foreground">coins</p>
                </div>
              </div>
              <p className="text-sm mb-3 line-clamp-2">{show.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{format(new Date(show.scheduled_at), "MMM d, h:mm a")}</span>
                <span>{show.duration_minutes} min</span>
              </div>
              <Button className="w-full" onClick={() => buyTicket.mutate({ showId: show.id, price: show.ticket_price_coins })}>Buy Ticket</Button>
              {show.status === "live" && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Send a tip:</p>
                  <div className="flex gap-1">
                    {tipOptions.map((tip) => (
                      <Button key={tip.type} variant="outline" size="sm" className="text-xs" onClick={() => sendTip.mutate({ comedianId: show.comedian_id, amount: tip.cost, tipType: tip.type, showId: show.id })}>
                        {tip.label} {tip.cost}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Battles view
  if (activeView === "battles") return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto mt-14 sm:mt-16 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveView("dashboard")}>← Back</Button>
        <h2 className="text-2xl font-black">⚔️ Comedy Battles</h2>
        {battles?.map((battle: any) => (
          <Card key={battle.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-xl">{battle.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{battle.description}</p>
              </div>
              <Badge variant={battle.status === "live" ? "destructive" : battle.status === "voting" ? "default" : "secondary"}>{battle.status.toUpperCase()}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div><p className="text-xs text-muted-foreground">Entry Fee</p><p className="font-bold">{battle.entry_fee_coins} coins</p></div>
              <div><p className="text-xs text-muted-foreground">Prize Pool</p><p className="font-bold text-green-500">{battle.prize_pool_coins} coins</p></div>
              <div><p className="text-xs text-muted-foreground">Participants</p><p className="font-bold">{battle.battle_participants?.length || 0}/{battle.max_participants}</p></div>
              <div><p className="text-xs text-muted-foreground">Starts</p><p className="font-bold text-xs">{format(new Date(battle.starts_at), "MMM d")}</p></div>
            </div>
            {battle.status === "voting" && battle.battle_participants && <BattleVoting battle={battle} onVoteSuccess={() => refetchBattles()} />}
          </Card>
        ))}
      </div>
    </div>
  );

  // Clips view
  if (activeView === "clips") return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto mt-14 sm:mt-16 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveView("dashboard")}>← Back</Button>
        <h2 className="text-2xl font-black">🎬 Clip Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clips?.map((clip: any) => (
            <Card key={clip.id} className="p-4">
              <div className="mb-3"><VideoPlayer videoUrl={clip.video_url} /></div>
              <h3 className="font-bold text-lg mb-1">{clip.title}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{clip.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-yellow-500">{clip.price_coins} coins</p>
                <Button size="sm" onClick={() => buyClip.mutate({ clipId: clip.id, price: clip.price_coins })}>Buy Clip</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Tickets view
  if (activeView === "tickets") return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto mt-14 sm:mt-16 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveView("dashboard")}>← Back</Button>
        <h2 className="text-2xl font-black">🎫 My Tickets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets?.map((ticket: any) => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold">{ticket.show?.title}</h3>
                  <p className="text-sm text-muted-foreground">{ticket.show?.comedian?.stage_name}</p>
                </div>
                <Badge variant={ticket.show?.status === "live" ? "destructive" : "secondary"}>{ticket.show?.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Purchased: {format(new Date(ticket.purchased_at), "MMM d, h:mm a")}</p>
              {ticket.show?.status === "live" && <Button className="w-full mt-3" onClick={() => navigate(`/comedy-watch/${ticket.show.id}`)}>Watch Now</Button>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Main Dashboard
  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5 mt-14 sm:mt-16">
        {/* Hero Video */}
        <ComedyClubHero />


        <HeroRewardedAd sectionKey="page_comedyclub" />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <ComedyCurrencyDisplay />
          <div className="flex gap-2">
            {!comedianProfile ? (
              <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Mic2 className="mr-2 h-4 w-4" /> Become a Comedian
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Comedian Profile</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Stage Name</Label><Input value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="Your comedy stage name" /></div>
                    <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about your comedy style..." rows={3} /></div>
                    <Button onClick={handleCreateProfile} className="w-full">Create Profile</Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="outline" onClick={() => navigate("/comedian-dashboard")}>
                <User className="mr-2 h-4 w-4" /> Comedian Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* How It Works */}
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <h2 className="text-lg sm:text-xl font-black mb-3">How Comedy Club Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4 text-primary" /> For Viewers</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <strong>Buy Comedy Coins:</strong> 100 coins = €5</li>
                <li>• <strong>Buy Tickets:</strong> Watch live comedy shows</li>
                <li>• <strong>Send Tips:</strong> Virtual tips 10-100 coins</li>
                <li>• <strong>Vote in Battles:</strong> 10 coins per vote</li>
                <li>• <strong>Buy Clips:</strong> Recorded comedy clips</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><Mic2 className="h-4 w-4 text-primary" /> For Comedians</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <strong>Go Live:</strong> Stream shows & earn tickets</li>
                <li>• <strong>Receive Tips:</strong> Earn from viewer tips</li>
                <li>• <strong>Join Battles:</strong> Compete for prize pools</li>
                <li>• <strong>Sell Clips:</strong> Monetize best clips</li>
                <li>• <strong>Withdraw:</strong> Min €50, you keep 75%</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Tool Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Card
                className="p-3 sm:p-4 cursor-pointer hover:border-primary/40 transition-all group"
                onClick={() => setActiveView(tool.id)}
              >
                <tool.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${tool.color} mb-2 group-hover:scale-110 transition-transform`} />
                <p className="font-bold text-xs sm:text-sm">{tool.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{tool.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tips for Future Enhancements */}
        <Card className="p-4 sm:p-6 border-dashed border-primary/30">
          <h3 className="font-black text-lg mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Tips for Future Enhancements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: "🎭", title: "Comedy Improv AI", desc: "AI-generated improv scenarios with audience participation and scoring" },
              { icon: "📊", title: "Comedy Analytics", desc: "Detailed performance metrics: laugh rate, audience retention, tip patterns" },
              { icon: "🎓", title: "Comedy Masterclass", desc: "Premium video courses from top comedians with AI-graded assignments" },
              { icon: "🤝", title: "Comedian Collab Hub", desc: "Find comedy partners, form duos, and schedule joint shows" },
              { icon: "🎵", title: "Comedy Podcast Studio", desc: "Record, edit, and monetize comedy podcasts with AI enhancement" },
              { icon: "🌍", title: "Global Comedy Festival", desc: "Seasonal multi-day comedy events with international performers and prize pools" },
            ].map((tip) => (
              <div key={tip.title} className="p-3 bg-muted/30 rounded-lg">
                <span className="text-xl">{tip.icon}</span>
                <p className="font-bold text-sm mt-1">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
