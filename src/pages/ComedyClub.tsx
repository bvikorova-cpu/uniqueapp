import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComedyCurrencyDisplay } from "@/components/comedy/ComedyCurrencyDisplay";
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
import { BattleVoting } from "@/components/comedy/BattleVoting";
import { VideoPlayer } from "@/components/comedy/VideoPlayer";
import { Mic2, Trophy, Video, TrendingUp, Ticket, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ComedyClub() {
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
    createProfile.mutate(
      { stageName, bio },
      {
        onSuccess: () => {
          setShowCreateProfile(false);
          setStageName("");
          setBio("");
        },
      }
    );
  };

  const tipOptions = [
    { type: "applause", label: "👏 Applause", cost: 10 },
    { type: "flowers", label: "🌹 Flowers", cost: 25 },
    { type: "mic_drop", label: "🎤 Mic Drop", cost: 50 },
    { type: "standing_ovation", label: "🙌 Standing Ovation", cost: 100 },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 mt-14 sm:mt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-2">
              <Mic2 className="w-3 h-3" />
              <span className="font-medium">Live Entertainment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Comedy Club</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Live stand-up • Battles • Earn money performing
            </p>
          </div>
          
          {!comedianProfile ? (
            <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
              <DialogTrigger asChild>
                <Button size="sm" className="sm:size-lg">
                  <Mic2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Become a Comedian
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Comedian Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Stage Name</Label>
                    <Input
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      placeholder="Your comedy stage name"
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about your comedy style..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreateProfile} className="w-full">
                    Create Profile
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/comedian-dashboard")}
              className="sm:size-lg"
            >
              <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Comedian Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Button>
          )}
        </div>

        {/* How It Works Section */}
        <Card className="p-3 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <h2 className="text-lg sm:text-2xl font-black mb-3 sm:mb-4">How Comedy Club Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                For Viewers
              </h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>• <strong>Buy Comedy Coins:</strong> Purchase coins to access premium content (100 coins = €5)</li>
                <li>• <strong>Buy Tickets:</strong> Get tickets to live comedy shows and watch comedians perform in real-time</li>
                <li>• <strong>Send Tips:</strong> Show appreciation during live shows with virtual tips (10-100 coins)</li>
                <li>• <strong>Vote in Battles:</strong> Support your favorite comedians in comedy battles (10 coins per vote)</li>
                <li>• <strong>Buy Clips:</strong> Purchase recorded comedy clips from the marketplace</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center">
                <Mic2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                For Comedians
              </h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>• <strong>Go Live:</strong> Schedule and stream live comedy shows to earn from ticket sales</li>
                <li>• <strong>Receive Tips:</strong> Earn real money from viewer tips during your performances</li>
                <li>• <strong>Join Battles:</strong> Compete for prize pools and gain exposure</li>
                <li>• <strong>Sell Clips:</strong> Upload and monetize your best comedy clips</li>
                <li>• <strong>Withdraw Earnings:</strong> Request payouts when you reach €50 minimum balance</li>
                <li>• <strong>Platform Fee:</strong> We take 25% commission, you keep 75% of all earnings</li>
              </ul>
            </div>
          </div>
        </Card>

        <ComedyCurrencyDisplay />

        <Tabs defaultValue="shows" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="shows" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row gap-1">
              <Mic2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Live Shows</span>
              <span className="sm:hidden">Live</span>
            </TabsTrigger>
            <TabsTrigger value="battles" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row gap-1">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Battles</span>
            </TabsTrigger>
            <TabsTrigger value="clips" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row gap-1">
              <Video className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clip Marketplace</span>
              <span className="sm:hidden">Clips</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row gap-1">
              <Ticket className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">My Tickets</span>
              <span className="sm:hidden">Tickets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shows" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shows?.map((show: any) => (
                <Card key={show.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {show.status === "live" && (
                        <Badge className="bg-red-500 mb-2">🔴 LIVE NOW</Badge>
                      )}
                      <h3 className="font-bold text-lg">{show.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {show.comedian?.stage_name}
                        {show.comedian?.is_verified && " ✓"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-500">
                        {show.ticket_price_coins}
                      </p>
                      <p className="text-xs text-muted-foreground">coins</p>
                    </div>
                  </div>

                  <p className="text-sm mb-3 line-clamp-2">{show.description}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>
                      {format(new Date(show.scheduled_at), "MMM d, h:mm a")}
                    </span>
                    <span>{show.duration_minutes} min</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() =>
                        buyTicket.mutate({
                          showId: show.id,
                          price: show.ticket_price_coins,
                        })
                      }
                    >
                      Buy Ticket
                    </Button>
                  </div>

                  {show.status === "live" && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Send a tip:</p>
                      <div className="flex gap-1">
                        {tipOptions.map((tip) => (
                          <Button
                            key={tip.type}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              sendTip.mutate({
                                comedianId: show.comedian_id,
                                amount: tip.cost,
                                tipType: tip.type,
                                showId: show.id,
                              })
                            }
                          >
                            {tip.label.split(" ")[0]} {tip.cost}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="battles" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {battles?.map((battle: any) => (
                <Card key={battle.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl">{battle.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {battle.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        battle.status === "live"
                          ? "destructive"
                          : battle.status === "voting"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {battle.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Fee</p>
                      <p className="font-bold">{battle.entry_fee_coins} coins</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prize Pool</p>
                      <p className="font-bold text-green-500">
                        {battle.prize_pool_coins} coins
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <p className="font-bold">
                        {battle.battle_participants?.length || 0}/{battle.max_participants}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Starts</p>
                      <p className="font-bold text-xs">
                        {format(new Date(battle.starts_at), "MMM d")}
                      </p>
                    </div>
                  </div>

                  {battle.status === "voting" && battle.battle_participants && (
                    <BattleVoting 
                      battle={battle} 
                      onVoteSuccess={() => refetchBattles()}
                    />
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clips" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clips?.map((clip: any) => (
                <Card key={clip.id} className="p-4">
                  <div className="mb-3">
                    <VideoPlayer videoUrl={clip.video_url} />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{clip.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    by {clip.comedian?.stage_name}
                    {clip.comedian?.is_verified && " ✓"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {clip.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-yellow-500">
                      {clip.price_coins} coins
                    </p>
                    <Button
                      size="sm"
                      onClick={() =>
                        buyClip.mutate({
                          clipId: clip.id,
                          price: clip.price_coins,
                        })
                      }
                    >
                      Buy Clip
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets?.map((ticket: any) => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold">{ticket.show?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ticket.show?.comedian?.stage_name}
                      </p>
                    </div>
                    <Badge variant={ticket.show?.status === "live" ? "destructive" : "secondary"}>
                      {ticket.show?.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Purchased: {format(new Date(ticket.purchased_at), "MMM d, h:mm a")}
                  </p>
                  {ticket.show?.status === "live" && (
                    <Button 
                      className="w-full mt-3"
                      onClick={() => navigate(`/comedy-watch/${ticket.show.id}`)}
                    >
                      Watch Now
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
