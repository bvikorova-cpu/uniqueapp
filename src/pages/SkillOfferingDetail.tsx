import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Euro, Trash2, Send, Calendar } from "lucide-react";

type Offering = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price_per_hour: number | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
};

type Profile = { id: string; full_name: string | null; avatar_url: string | null };

export default function SkillOfferingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [offering, setOffering] = useState<Offering | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: o } = await supabase
        .from("skill_offerings")
        .select("id,user_id,title,description,category,price_per_hour,location,image_url,created_at")
        .eq("id", id)
        .maybeSingle();
      setOffering(o as Offering | null);
      if (o) {
        const { data: p } = await supabase
          .from("profiles")
          .select("id,full_name,avatar_url")
          .eq("id", o.user_id)
          .maybeSingle();
        setSeller(p as Profile | null);
      }
      setLoading(false);
    })();
  }, [id]);

  const sendMessage = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!offering) return;
    if (message.trim().length < 5) {
      toast({ title: "Message too short", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("marketplace_responses").insert({
      offering_id: offering.id,
      sender_id: user.id,
      receiver_id: offering.user_id,
      message: message.trim(),
    });
    setSending(false);
    if (error) {
      toast({ title: "Could not send", description: error.message, variant: "destructive" });
      return;
    }
    setMessage("");
    toast({ title: "Message sent", description: "The provider will reply in their inbox." });
  };

  const deleteOffering = async () => {
    if (!offering || !user || offering.user_id !== user.id) return;
    if (!confirm("Delete this offering?")) return;
    const { error } = await supabase.from("skill_offerings").delete().eq("id", offering.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Offering deleted" });
    navigate("/skills-marketplace");
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /><Skeleton className="h-40 w-full" /></div>;
  }
  if (!offering) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-2">Offering not found</h1>
        <p className="text-muted-foreground mb-6">It may have been removed or is no longer active.</p>
        <Button asChild><Link to="/skills-marketplace">Back to marketplace</Link></Button>
      </div>
    );
  }

  const isOwner = user?.id === offering.user_id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate("/skills-marketplace")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Button>

      <Card className="overflow-hidden mb-6">
        {offering.image_url && (
          <div className="aspect-[2/1] bg-muted overflow-hidden">
            <img src={offering.image_url} alt={offering.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">{offering.category}</Badge>
                {offering.location && (
                  <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {offering.location}
                  </span>
                )}
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(offering.created_at).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{offering.title}</CardTitle>
            </div>
            {offering.price_per_hour != null && (
              <div className="text-right">
                <div className="text-3xl font-bold text-primary inline-flex items-center">
                  <Euro className="h-6 w-6" /> {offering.price_per_hour}
                </div>
                <div className="text-xs text-muted-foreground">per hour</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{offering.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-base">Provider</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={seller?.avatar_url ?? undefined} />
              <AvatarFallback>{(seller?.full_name ?? "U").slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{seller?.full_name || "Unnamed user"}</p>
              <Link to={`/profile/${offering.user_id}`} className="text-xs text-primary hover:underline">View profile</Link>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{isOwner ? "Manage your offering" : "Contact provider"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isOwner ? (
              <Button variant="destructive" onClick={deleteOffering} className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete offering
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you need, when, and where…"
                  rows={5}
                  maxLength={1000}
                />
                <Button onClick={sendMessage} disabled={sending} className="gap-2">
                  <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send message"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Payments are handled directly between you and the provider until checkout is enabled.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
