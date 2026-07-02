import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Phone, Heart, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const HOTLINES = [
  { country: "🇨🇿 Czech Republic", name: "Safety Line", phone: "116 111", hours: "24/7" },
  { country: "🇭🇺 Hungary", name: "Mental Health First Aid", phone: "116 123", hours: "24/7" },
  { country: "🇵🇱 Polska", name: "Telefon Zaufania", phone: "116 123", hours: "14:00–22:00" },
  { country: "🇩🇪 Deutschland", name: "TelefonSeelsorge", phone: "0800 111 0 111", hours: "24/7" },
  { country: "🇬🇧 UK", name: "Samaritans", phone: "116 123", hours: "24/7" },
  { country: "🇺🇸 USA", name: "988 Suicide & Crisis Lifeline", phone: "988", hours: "24/7" },
  { country: "🌍 EU", name: "European Emergency", phone: "112", hours: "24/7" },
];

export const CrisisResourcesView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("best_friend_crisis_events")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    setEvents(data || []);
    setLoading(false);
  })(); }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Crisis Resources View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-white"/>
        </div>
        <h2 className="text-3xl font-black">You're Not Alone</h2>
        <p className="text-muted-foreground mt-2">Real help, 24/7. Please reach out — one call can change everything.</p>
      </div>

      <Card className="bg-red-500/5 border-red-500/30">
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-400"/> Crisis Hotlines</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {HOTLINES.map((h, i) => (
            <a key={i} href={`tel:${h.phone.replace(/\s/g, "")}`} className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-card/80 border transition">
                <div>
                  <div className="font-bold">{h.country} — {h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.hours}</div>
                </div>
                <div className="flex items-center gap-2 text-primary"><Phone className="h-4 w-4"/><span className="font-mono">{h.phone}</span></div>
              </div>
            </a>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your safety log</CardTitle></CardHeader>
        <CardContent>
          {loading && <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin"/></div>}
          {!loading && events.length === 0 && <p className="text-sm text-muted-foreground">No flagged moments. We're glad you're here. 💜</p>}
          {!loading && events.map((e) => (
            <div key={e.id} className="p-2 border-b text-xs">
              <Badge variant="outline" className="mr-2">{new Date(e.created_at).toLocaleString()}</Badge>
              <span className="text-muted-foreground">{e.matched_terms?.join(", ")}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/30"><CardContent className="p-4 text-xs text-amber-200">
        Your AI Best Friend is supportive but is not a substitute for professional mental health care. If you are in immediate danger, please call your local emergency number.
      </CardContent></Card>
    </div>
  );
};
