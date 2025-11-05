import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  CheckCircle2,
  Gift,
  Heart,
  DollarSign,
} from "lucide-react";

interface Creator {
  id: string;
  display_name: string;
  bio: string;
  total_subscribers: number;
  is_verified: boolean;
}

interface VirtualGift {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export default function CreatorProfile() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [gifts, setGifts] = useState<VirtualGift[]>([]);
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadCreatorProfile();
    loadGifts();
  }, [creatorId]);

  const loadCreatorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("id", creatorId)
        .single();

      if (error) throw error;
      setCreator(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/browse-creators");
    } finally {
      setLoading(false);
    }
  };

  const loadGifts = async () => {
    try {
      const { data, error } = await supabase
        .from("virtual_gifts")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      setGifts(data || []);
    } catch (error: any) {
      console.error("Error loading gifts:", error);
    }
  };

  const handleSendGift = async () => {
    if (!selectedGift) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to send gifts",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-gift-payment", {
        body: {
          giftId: selectedGift.id,
          creatorId: creatorId,
          message: message || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Gift Sent!",
        description: `You sent ${selectedGift.name} to ${creator?.display_name}`,
      });

      setSelectedGift(null);
      setMessage("");
      loadCreatorProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const groupedGifts = gifts.reduce((acc, gift) => {
    if (!acc[gift.category]) {
      acc[gift.category] = [];
    }
    acc[gift.category].push(gift);
    return acc;
  }, {} as Record<string, VirtualGift[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Creator Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white font-bold text-4xl">
                {creator?.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-3xl">{creator?.display_name}</CardTitle>
                  {creator?.is_verified && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <CardDescription className="text-lg mb-4">
                  {creator?.bio || "No bio yet"}
                </CardDescription>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>{creator?.total_subscribers || 0} subscribers</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="lg">
                  <Heart className="mr-2 h-5 w-5" />
                  Subscribe
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Send Gift Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              Send a Virtual Gift
            </CardTitle>
            <CardDescription>
              Show your support by sending a virtual gift (20% platform fee, 80% goes to creator)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedGifts).map(([category, categoryGifts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categoryGifts.map((gift) => (
                      <Dialog key={gift.id}>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => setSelectedGift(gift)}
                            className="flex flex-col items-center p-4 border-2 rounded-lg hover:border-primary transition-all cursor-pointer"
                          >
                            <div className="text-4xl mb-2">🎁</div>
                            <p className="font-semibold text-sm text-center">{gift.name}</p>
                            <p className="text-xs text-primary font-bold">${gift.price}</p>
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send {gift.name}</DialogTitle>
                            <DialogDescription>{gift.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                              <div>
                                <p className="text-sm text-muted-foreground">Gift Price</p>
                                <p className="text-2xl font-bold">${gift.price}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Creator Gets</p>
                                <p className="text-xl font-bold text-primary">
                                  ${(gift.price * 0.8).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">(80%)</p>
                              </div>
                            </div>
                            <Textarea
                              placeholder="Add a message (optional)"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={3}
                            />
                            <Button
                              onClick={handleSendGift}
                              disabled={sending}
                              className="w-full"
                              size="lg"
                            >
                              {sending ? "Processing..." : `Send Gift - $${gift.price}`}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}