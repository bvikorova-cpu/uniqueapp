import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, Music, Users, Ticket, Crown, Sparkles, 
  Gift, Trophy, Star, Heart, Zap, Flame, Award,
  Clock, TrendingUp, DollarSign, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MusicianRegistration } from "@/components/musician/MusicianRegistration";

const LiveConcerts = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedConcert, setSelectedConcert] = useState<any>(null);

  const { data: concerts, isLoading } = useQuery({
    queryKey: ["live-concerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_concert_streams")
        .select(`
          *,
          musician_profiles(stage_name, genre, avatar_url, total_earnings, total_concerts),
          concert_ticket_types(*)
        `)
        .in("status", ["scheduled", "live"])
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: gifts } = useQuery({
    queryKey: ["platform-gifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_gifts")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Top supporters feature temporarily disabled due to database schema
  const topSupporters = [];

  const handleBuyTicket = async (concertId: string, ticketTypeId: string) => {
    try {
      setLoading(ticketTypeId);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to buy tickets");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-concert-ticket-checkout", {
        body: { concertId, ticketTypeId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout");
    } finally {
      setLoading(null);
    }
  };

  const handleSendGift = async (giftId: string, concertId: string) => {
    try {
      setLoading(giftId);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to send gifts");
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-concert-gift", {
        body: { 
          concertId, 
          giftId,
          message: "From a fan!" 
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send gift");
    } finally {
      setLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/2"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="h-96 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Music className="h-10 w-10" />
              </div>
              <Badge className="bg-white/20 text-white text-sm px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Premium Experience
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
              Exclusive Live Concerts
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Watch world-class musicians perform live. Send virtual gifts, interact in real-time, and become part of an elite community.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{concerts?.length || 0} Live Shows</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold">VIP Access Available</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <Gift className="h-5 w-5" />
                <span className="font-semibold">Virtual Gifts</span>
              </div>
            </div>
            <MusicianRegistration />
          </div>
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl"></div>
        </div>

        {/* How It Works Section */}
        <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              How Live Concerts Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* For Fans */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  For Fans
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                    <div>
                      <p className="font-semibold text-foreground">Browse Concerts</p>
                      <p>Discover upcoming live concerts from talented musicians worldwide. Each concert features exclusive performances streamed in HD quality.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                    <div>
                      <p className="font-semibold text-foreground">Purchase Tickets</p>
                      <p>Choose from different ticket tiers (Standard, VIP, Premium) with varying benefits. Secure checkout via Stripe with instant access.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                    <div>
                      <p className="font-semibold text-foreground">Watch & Interact</p>
                      <p>Join the live stream when the concert starts. Experience real-time HLS streaming with adaptive quality for smooth playback.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                    <div>
                      <p className="font-semibold text-foreground">Send Virtual Gifts</p>
                      <p>Show appreciation by sending virtual gifts (roses, hearts, diamonds, crowns) during the performance. 80% goes directly to the artist!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Musicians */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  For Musicians
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                    <div>
                      <p className="font-semibold text-foreground">Create Profile</p>
                      <p>Register as a musician by providing your stage name, genre, bio, and photo. Instant approval to start streaming.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                    <div>
                      <p className="font-semibold text-foreground">Schedule Concerts</p>
                      <p>Create concert events with custom ticket types and pricing. Set date, time, and stream details through your musician dashboard.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                    <div>
                      <p className="font-semibold text-foreground">Go Live</p>
                      <p>Stream your performance using HLS technology. Your stream URL is automatically generated with adaptive bitrate for all viewers.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                    <div>
                      <p className="font-semibold text-foreground">Earn Revenue</p>
                      <p>Keep up to 90% of ticket sales and 80% of virtual gifts. Track your earnings and analytics in real-time through the dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Key Features
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">HD Streaming</p>
                    <p className="text-xs text-muted-foreground">HLS adaptive bitrate technology</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Secure Payments</p>
                    <p className="text-xs text-muted-foreground">Stripe integration for safety</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Real-Time Chat</p>
                    <p className="text-xs text-muted-foreground">Interact with fans instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Analytics</p>
                    <p className="text-xs text-muted-foreground">Track earnings & engagement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-primary/10 rounded-lg p-6 text-center">
              <h4 className="text-lg font-semibold mb-2">Ready to Get Started?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Whether you're a fan looking for exclusive content or a musician ready to perform, join our platform today!
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="default" size="lg" className="gap-2">
                  <Ticket className="h-5 w-5" />
                  Browse Concerts
                </Button>
                <MusicianRegistration />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="concerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="concerts" className="gap-2">
              <Calendar className="h-4 w-4" />
              Concerts
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Top Supporters
            </TabsTrigger>
            <TabsTrigger value="gifts" className="gap-2">
              <Gift className="h-4 w-4" />
              Virtual Gifts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="concerts" className="space-y-6">
            {concerts?.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Music className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">No concerts scheduled yet</p>
                  <p className="text-sm text-muted-foreground">Check back soon for upcoming exclusive shows!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {concerts?.map((concert) => (
                  <Card key={concert.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary">
                    <div className="relative h-56 overflow-hidden">
                      {concert.musician_profiles?.avatar_url ? (
                        <img
                          src={concert.musician_profiles.avatar_url}
                          alt={concert.musician_profiles.stage_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Music className="h-24 w-24 text-primary" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      
                      {concert.status === "live" && (
                        <Badge className="absolute top-4 left-4 bg-destructive animate-pulse shadow-lg">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            LIVE NOW
                          </div>
                        </Badge>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-12 w-12 border-2 border-white">
                            <AvatarImage src={concert.musician_profiles?.avatar_url} />
                            <AvatarFallback className="bg-primary">
                              {concert.musician_profiles?.stage_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg">{concert.musician_profiles?.stage_name}</h3>
                            {concert.musician_profiles?.genre && (
                              <Badge variant="secondary" className="text-xs">
                                {concert.musician_profiles.genre}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="space-y-3">
                      <CardTitle className="text-xl line-clamp-1">{concert.title}</CardTitle>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(concert.scheduled_at), "MMM d, HH:mm")}
                        </Badge>
                        {concert.viewer_count > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {concert.viewer_count} watching
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          Exclusive
                        </Badge>
                      </div>

                      {concert.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {concert.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Ticket Types */}
                      <div className="space-y-2">
                        {concert.concert_ticket_types?.map((ticket: any) => (
                          <div
                            key={ticket.id}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              ticket.name === "vip"
                                ? "bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-yellow-500/50 shadow-lg"
                                : "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {ticket.name === "vip" ? (
                                  <Crown className="h-5 w-5 text-yellow-500" />
                                ) : (
                                  <Ticket className="h-5 w-5 text-primary" />
                                )}
                                <span className="font-bold uppercase text-sm">
                                  {ticket.name}
                                </span>
                              </div>
                              <Badge 
                                variant={ticket.name === "vip" ? "default" : "secondary"}
                                className="text-base font-bold"
                              >
                                €{ticket.price.toFixed(2)}
                              </Badge>
                            </div>
                            {ticket.description && (
                              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                {ticket.description}
                              </p>
                            )}
                            <Button
                              onClick={() => handleBuyTicket(concert.id, ticket.id)}
                              disabled={loading === ticket.id}
                              className={`w-full ${ticket.name === "vip" ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" : ""}`}
                              size="lg"
                            >
                              {loading === ticket.id ? (
                                "Processing..."
                              ) : (
                                <>
                                  {ticket.name === "vip" ? (
                                    <Crown className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Zap className="h-4 w-4 mr-2" />
                                  )}
                                  Get Ticket
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Send Gift Button */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full border-2 border-pink-500/50 hover:bg-pink-500/10"
                            onClick={() => setSelectedConcert(concert)}
                          >
                            <Gift className="h-4 w-4 mr-2" />
                            Send Virtual Gift
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Gift className="h-5 w-5 text-pink-500" />
                              Send Gift to {concert.musician_profiles?.stage_name}
                            </DialogTitle>
                            <DialogDescription>
                              Support your favorite artist with a virtual gift. 80% goes directly to the artist!
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {gifts?.map((gift) => (
                              <Card 
                                key={gift.id}
                                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
                                onClick={() => handleSendGift(gift.id, concert.id)}
                              >
                                <CardContent className="p-4 text-center">
                                  <div className="text-4xl mb-2">{gift.icon}</div>
                                  <p className="font-bold text-sm mb-1">{gift.name}</p>
                                  <Badge className="text-sm">€{gift.price.toFixed(2)}</Badge>
                                  {loading === gift.id && (
                                    <p className="text-xs text-muted-foreground mt-2">Processing...</p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Artist Stats */}
                      <div className="pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Award className="h-4 w-4" />
                          <span>{concert.musician_profiles?.total_concerts || 0} shows</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          <span>€{concert.musician_profiles?.total_earnings?.toFixed(0) || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Top Concert Supporters
                </CardTitle>
                <CardDescription>
                  The most generous fans supporting live music
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topSupporters?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>No supporters yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topSupporters?.map((supporter, index) => (
                      <div
                        key={supporter.sender_id}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-2 border-gray-400/50"
                            : index === 2
                            ? "bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-2 border-orange-600/50"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background font-bold text-lg">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </div>
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarImage src={supporter.avatar_url} />
                          <AvatarFallback>{supporter.full_name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-bold">{supporter.full_name || "Anonymous"}</p>
                          <p className="text-sm text-muted-foreground">Generous supporter</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">€{supporter.total_amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Total gifts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gifts">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {gifts?.map((gift) => (
                <Card key={gift.id} className="hover:shadow-xl transition-all hover:scale-105 border-2">
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-4">{gift.icon}</div>
                    <CardTitle>{gift.name}</CardTitle>
                    <CardDescription>{gift.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <Badge className="text-lg px-4 py-1">
                      €{gift.price.toFixed(2)}
                    </Badge>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="flex items-center justify-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        80% to artist
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        20% platform fee
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Benefits Section */}
        <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Exclusive Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="p-3 bg-primary/20 rounded-xl w-fit">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold">VIP Access</h3>
                <p className="text-sm text-muted-foreground">
                  Get front-row virtual seats, exclusive backstage content, and priority chat access
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-pink-500/20 rounded-xl w-fit">
                  <Gift className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="font-bold">Virtual Gifts</h3>
                <p className="text-sm text-muted-foreground">
                  Support artists directly with virtual gifts. 80% goes straight to the musician
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-purple-500/20 rounded-xl w-fit">
                  <MessageCircle className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-bold">Live Interaction</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with other fans, request songs, and get shoutouts during live performances
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveConcerts;
