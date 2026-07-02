import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const VirtualPostcards = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { credits, refresh } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [style, setStyle] = useState("classic");
  const [postcards, setPostcards] = useState<any[]>([]);

  useEffect(() => { loadPostcards(); }, []);

  const loadPostcards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("virtual_postcards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(12);
    if (data) setPostcards(data);
  };

  const handleGenerate = async () => {
    if (!destination.trim() || !recipientName.trim() || !message.trim()) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const currentCredits = typeof credits === "number" ? credits : credits.credits_remaining;
      if (currentCredits < 8) {
        toast({ title: "Insufficient Credits", description: "You need 8 credits.", variant: "destructive" });
        setTimeout(() => navigate("/ai-credits-store"), 2000);
        return;
      }
      const { data, error } = await supabase.functions.invoke("experience-ai", {
        body: { action: "virtual-postcard", destination, recipientName, message, style },
      });
      if (error) throw error;
      toast({ title: "💌 Postcard Created!", description: `Your postcard from ${destination} is ready` });
      await loadPostcards();
      await refresh();
      setMessage("");
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "Failed to generate postcard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Virtual Postcards - How it works"} steps={[{ title: 'Open', desc: 'Access the Virtual Postcards section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Virtual Postcards.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Virtual Postcards</CardTitle>
          <CardDescription>Generate beautiful AI postcards from any destination worldwide</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Destination</label>
              <Input placeholder="e.g. Paris, Tokyo, Mars..." value={destination} onChange={e => setDestination(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Recipient Name</label>
              <Input placeholder="Who is this for?" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Your Message</label>
            <Textarea placeholder="Write your message..." value={message} onChange={e => setMessage(e.target.value)} className="mt-1" rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium">Postcard Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic Vintage</SelectItem>
                <SelectItem value="modern">Modern Minimalist</SelectItem>
                <SelectItem value="artistic">Artistic Watercolor</SelectItem>
                <SelectItem value="retro">Retro Travel Poster</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !destination.trim()} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating Postcard...</> : <>Generate Postcard (8 credits)</>}
          </Button>
        </CardContent>
      </Card>

      {postcards.length > 0 && (
        <div>
          <h3 className="font-bold text-xl mb-4">Your Postcards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {postcards.map((pc, i) => (
              <motion.div key={pc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-bold">{pc.destination}</span>
                      <Badge variant="secondary" className="text-[10px] ml-auto">{pc.style}</Badge>
                    </div>
                    <div className="bg-card/50 rounded-lg p-3 border italic text-sm text-muted-foreground">
                      "{pc.postcard_text || pc.message}"
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3 text-pink-500" />
                      To: {pc.recipient_name}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};
