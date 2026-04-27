import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, Send } from "lucide-react";
import { toast } from "sonner";

export default function ComedyLiveViewer() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tipMessage, setTipMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    loadShow();
    
    // Subscribe to real-time chat updates
    const channel = supabase
      .channel(`show_${showId}_chat`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comedy_show_messages',
        filter: `show_id=eq.${showId}`
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId]);

  const loadShow = async () => {
    const { data, error } = await supabase
      .from("comedy_shows")
      .select("*, comedian:comedian_profiles(*)")
      .eq("id", showId)
      .single();

    if (error) {
      console.error("Error loading show:", error);
      toast.error("Show not found");
      navigate("/comedy-club");
      return;
    }

    setShow(data);
    setLoading(false);

    // Load chat messages
    const { data: messages } = await supabase
      .from("comedy_show_messages")
      .select("*, sender:profiles(*)")
      .eq("show_id", showId)
      .order("created_at", { ascending: true });

    setChatMessages(messages || []);
  };

  const sendTip = async (tipType: string, amount: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to send tips");
        return;
      }

      const { error } = await supabase.functions.invoke("send-comedy-tip", {
        body: {
          showId,
          comedianId: show.comedian_id,
          tipType,
          amount,
          message: tipMessage
        }
      });

      if (error) throw error;

      toast.success(`Sent ${tipType}!`);
      setTipMessage("");
    } catch (error) {
      console.error("Error sending tip:", error);
      toast.error("Failed to send tip");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!show) return null;

  const tipOptions = [
    { type: "applause", label: "👏", cost: 10 },
    { type: "flowers", label: "🌹", cost: 25 },
    { type: "mic_drop", label: "🎤", cost: 50 },
    { type: "standing_ovation", label: "🙌", cost: 100 },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 mt-16">
        <Button variant="ghost" onClick={() => navigate("/comedy-club")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Comedy Club
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{show.title}</h1>
                  <p className="text-muted-foreground">by {show.comedian?.stage_name}</p>
                </div>
                <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="font-bold">LIVE</span>
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <p className="text-xl mb-2">🎤 Live Stream</p>
                    <p className="text-sm text-muted-foreground">
                      Stream will appear here when comedian starts broadcasting
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="space-y-3">
                <p className="font-medium">Send a tip:</p>
                <Input
                  placeholder="Add a message (optional)"
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                />
                <div className="flex gap-2">
                  {tipOptions.map((tip) => (
                    <Button
                      key={tip.type}
                      variant="outline"
                      onClick={() => sendTip(tip.type, tip.cost)}
                      className="flex-1"
                    >
                      {tip.label} {tip.cost}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div>
            <Card className="p-4 h-[600px] flex flex-col">
              <h3 className="font-bold mb-4">Live Chat</h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-medium">{msg.sender?.full_name || 'Anonymous'}: </span>
                    <span>{msg.message}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input placeholder="Type a message..." />
                <Button size="icon" onClick={() => toast.info("This action — coming soon")}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
