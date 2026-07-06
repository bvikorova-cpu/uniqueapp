import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Store, Clock, Euro, ArrowLeft, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface Provider {
  owner_id: string;
  business_name: string;
  category: string;
  description: string | null;
  city: string | null;
  avatar_url: string | null;
  price_cents: number | null;
  duration_min: number | null;
  languages: string[] | null;
}

interface Offering {
  id: string;
  name: string;
  description: string | null;
  duration_min: number;
  price_cents: number;
  is_active: boolean;
}

function groupSlotsByDay(slots: string[]) {
  const map = new Map<string, string[]>();
  for (const iso of slots) {
    const key = new Date(iso).toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(iso);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function ServiceProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: profile }, { data: offs }] = await Promise.all([
        supabase.from("service_providers")
          .select("owner_id, business_name, category, description, city, avatar_url, price_cents, duration_min, languages")
          .eq("owner_id", id).eq("is_accepting_bookings", true).maybeSingle(),
        supabase.from("service_offerings").select("*").eq("provider_id", id).eq("is_active", true).order("sort_order"),
      ]);
      setProvider((profile as Provider) ?? null);
      const list = (offs as Offering[]) ?? [];
      setOfferings(list);
      if (list.length > 0) setSelectedOffering(list[0]);
      setLoading(false);
    })();
  }, [id]);

  // Reload slots when offering changes
  useEffect(() => {
    if (!id || !provider) return;
    // If provider has offerings, require one to be picked
    if (offerings.length > 0 && !selectedOffering) return;
    (async () => {
      setSlotsLoading(true); setSelected(null);
      const from = new Date();
      const to = new Date(Date.now() + 21 * 24 * 3600 * 1000);
      const { data } = await supabase.functions.invoke("service-availability-slots", {
        body: {
          provider_id: id,
          from: from.toISOString(),
          to: to.toISOString(),
          offering_id: selectedOffering?.id,
        },
      });
      setSlots((data?.slots as string[]) ?? []);
      setSlotsLoading(false);
    })();
  }, [id, provider, selectedOffering, offerings.length]);

  const grouped = useMemo(() => groupSlotsByDay(slots), [slots]);

  const effectivePriceCents = selectedOffering?.price_cents ?? provider?.price_cents ?? 0;
  const effectiveDuration = selectedOffering?.duration_min ?? provider?.duration_min ?? 60;
  const priceEur = (effectivePriceCents / 100).toFixed(2);

  const handleBook = async () => {
    if (!selected || !id) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in to book"); navigate("/auth"); return; }
    setBooking(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-service-booking", {
        body: {
          provider_id: id,
          scheduled_at: selected,
          customer_notes: notes || undefined,
          offering_id: selectedOffering?.id,
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (e: any) { toast.error(e.message ?? "Booking failed"); setBooking(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 py-24 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" /></div>
    </div>
  );

  if (!provider) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-muted-foreground mb-4">Provider not found or not accepting bookings.</p>
        <Button onClick={() => navigate("/services")} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to list</Button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`Book ${provider.business_name} · Unique`}</title>
        <meta name="description" content={`Book ${provider.business_name} (${provider.category}) — €${priceEur} for ${effectiveDuration} minutes.`} />
      </Helmet>
      <div className="min-h-screen bg-background"><Navbar />
        <div className="container mx-auto px-4 py-24 mt-16 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/services")} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" /> All services</Button>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start gap-4">
                {provider.avatar_url ? <img src={provider.avatar_url} alt={provider.business_name} className="w-20 h-20 rounded-full object-cover" />
                  : <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"><Store className="w-8 h-8 text-primary" /></div>}
                <div className="flex-1">
                  <CardTitle className="text-2xl">{provider.business_name}</CardTitle>
                  <CardDescription className="capitalize">{provider.category}{provider.city ? ` · ${provider.city}` : ""}</CardDescription>
                  <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                    <span className="flex items-center gap-1 font-semibold"><Euro className="w-4 h-4" /> {priceEur}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {effectiveDuration} min</span>
                    {provider.city && <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" />{provider.city}</span>}
                    {provider.languages?.map((l) => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{provider.description ?? "No description provided."}</p>
            </CardContent>
          </Card>

          {offerings.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Choose a service</CardTitle>
                <CardDescription>Duration and price adjust to what you pick.</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                {offerings.map((o) => {
                  const active = selectedOffering?.id === o.id;
                  return (
                    <button key={o.id} type="button" onClick={() => setSelectedOffering(o)}
                      className={`text-left border-2 rounded-lg p-3 transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{o.name}</span>
                        {active && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{o.description || "—"}</div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 font-semibold"><Euro className="w-3 h-3" /> {(o.price_cents / 100).toFixed(2)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {o.duration_min} min</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Pick a time slot</CardTitle>
              <CardDescription>Times shown in your local time. Next 21 days.{selectedOffering ? ` · ${selectedOffering.name}` : ""}</CardDescription>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <div className="py-6 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" /></div>
              ) : grouped.length === 0 ? (
                <p className="text-muted-foreground text-sm">No available slots in the next 21 days for this option.</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {grouped.map(([day, daySlots]) => (
                    <div key={day}>
                      <div className="text-sm font-semibold mb-2">
                        {new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((iso) => (
                          <Button key={iso} size="sm" variant={selected === iso ? "default" : "outline"} onClick={() => setSelected(iso)}>
                            {new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selected && (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <div>
                    <Label htmlFor="notes">Notes for the provider (optional)</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 2000))} placeholder="Anything the provider should know…" className="mt-1" />
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="text-sm">
                      <div className="font-semibold">
                        {new Date(selected).toLocaleString(undefined, { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="text-muted-foreground">
                        {selectedOffering ? `${selectedOffering.name} · ` : ""}€{priceEur} · {effectiveDuration} min
                      </div>
                    </div>
                    <Button onClick={handleBook} disabled={booking} size="lg">
                      {booking ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting…</>) : `Pay €${priceEur} & Book`}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After payment you get a calendar (.ics) file to add to your phone — it will remind you 24 h before the slot. Cancel &gt; 24 h in advance for a full refund.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
