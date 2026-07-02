import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Seat { id: string; member_email: string; status: string; invited_at: string; }

const SEAT_LIMITS: Record<string, number> = { basic: 0, premium: 2, business: 10 };

export const SeatManagement = ({ tier }: { tier: string }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = SEAT_LIMITS[tier] ?? 0;

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("subscription_seats").select("*").eq("owner_id", user.id).neq("status", "removed").order("invited_at", { ascending: false });
    setSeats((data || []) as Seat[]);
  };

  useEffect(() => { load(); }, []);

  const invite = async () => {
    if (!email.includes("@")) return toast.error("Valid email required");
    if (seats.length >= limit) return toast.error(`Max ${limit} seats on ${tier}`);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("subscription_seats").insert({
        owner_id: user.id, member_email: email, tier,
      });
      if (error) throw error;
      toast.success("Invitation sent");
      setEmail("");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    await supabase.from("subscription_seats").update({ status: "removed", removed_at: new Date().toISOString() }).eq("id", id);
    load();
  };

  if (limit === 0) return null;

  return (
    <>
      <FloatingHowItWorks title={"Seat Management - How it works"} steps={[{ title: 'Open', desc: 'Access the Seat Management section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Seat Management.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team seats ({seats.length}/{limit})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="member@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={seats.length >= limit} />
          <Button onClick={invite} disabled={loading || seats.length >= limit} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Invite
          </Button>
        </div>
        <div className="space-y-2">
          {seats.map(s => (
            <div key={s.id} className="flex items-center justify-between p-2 border rounded">
              <div className="text-sm">{s.member_email}</div>
              <div className="flex items-center gap-2">
                <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><X className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {seats.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">No team members yet</div>}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
