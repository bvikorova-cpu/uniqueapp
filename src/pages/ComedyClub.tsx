import { useState } from "react";
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
} from "@/hooks/useComedy";
import { Mic2, Trophy, Video, TrendingUp, Ticket, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ComedyClub() {
  const { shows } = useComedyShows();
  const { battles } = useComedyBattles();
  const { tickets } = useUserTickets();
  const { profile: comedianProfile } = useComedianProfile();
  const buyTicket = useBuyTicket();
  const sendTip = useSendTip();
  const createProfile = useCreateComedianProfile();

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">🎤 Comedy Club</h1>
            <p className="text-muted-foreground mt-2">
              Live stand-up • Battles • Earn money performing
            </p>
          </div>
          
          {!comedianProfile ? (
            <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Mic2 className="mr-2 h-5 w-5" />
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
            <Button variant="outline" size="lg">
              <User className="mr-2 h-5 w-5" />
              Comedian Dashboard
            </Button>
          )}
        </div>

        <ComedyCurrencyDisplay />

        <Tabs defaultValue="shows" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shows">
              <Mic2 className="mr-2 h-4 w-4" />
              Live Shows
            </TabsTrigger>
            <TabsTrigger value="battles">
              <Trophy className="mr-2 h-4 w-4" />
              Battles
            </TabsTrigger>
            <TabsTrigger value="clips">
              <Video className="mr-2 h-4 w-4" />
              Clip Marketplace
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Ticket className="mr-2 h-4 w-4" />
              My Tickets
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
                    <div className="space-y-2">
                      <p className="text-sm font-bold mb-2">Vote for your favorite:</p>
                      {battle.battle_participants.map((participant: any) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold">
                              {participant.comedian?.stage_name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {participant.vote_count} votes
                            </span>
                          </div>
                          <Button size="sm">Vote (10 coins)</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clips" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Comedy Clip Marketplace</h2>
              <p className="text-muted-foreground">
                Browse and purchase comedy clips from your favorite comedians. Coming soon!
              </p>
            </Card>
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
                    <Button className="w-full mt-3">Watch Now</Button>
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
