import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, Search, Clock, Euro } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { Helmet } from "react-helmet-async";

interface Doctor {
  user_id: string;
  provider_name: string | null;
  provider_logo_url: string | null;
  specialty: string | null;
  bio: string | null;
  consultation_price_cents: number | null;
  consultation_duration_min: number | null;
  languages: string[] | null;
}

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("healthcare_profiles")
        .select(
          "user_id, provider_name, provider_logo_url, specialty, bio, consultation_price_cents, consultation_duration_min, languages",
        )
        .eq("is_accepting_bookings", true)
        .not("consultation_price_cents", "is", null)
        .order("created_at", { ascending: false });
      setDoctors((data as Doctor[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = doctors.filter((d) => {
    if (!q) return true;
    const hay = `${d.provider_name ?? ""} ${d.specialty ?? ""} ${d.bio ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <>
      <Helmet>
        <title>Find a Doctor · Book a Consultation · Unique</title>
        <meta
          name="description"
          content="Browse verified doctors, pick a time slot and book a paid consultation in EUR. Instant confirmation."
        />
      </Helmet>
      <FloatingHowItWorks
        title="How doctor booking works"
        steps={[
          { title: "Browse doctors", description: "Filter by specialty, language and price." },
          { title: "Pick a slot", description: "Open a doctor's calendar and choose a free time." },
          { title: "Pay securely", description: "Checkout in EUR via Stripe (fixed consultation price)." },
          { title: "Get confirmed", description: "Doctor is notified. Cancel >24h for a full refund." },
        ]}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 mt-16">
          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-primary" /> Find a Doctor
              </h1>
              <p className="text-muted-foreground">
                Book a paid video/consultation with a verified doctor.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/my-bookings/doctors">My bookings</Link>
            </Button>
          </div>

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by specialty or name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading doctors…</p>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No doctors accepting bookings yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((d) => (
                <Card key={d.user_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {d.provider_logo_url ? (
                        <img
                          src={d.provider_logo_url}
                          alt={d.provider_name ?? "Doctor"}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {d.provider_name ?? "Doctor"}
                        </CardTitle>
                        <CardDescription>{d.specialty ?? "General"}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {d.bio ?? "No biography provided."}
                    </p>
                    <div className="flex items-center gap-3 text-sm mb-4">
                      <span className="flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        {((d.consultation_price_cents ?? 0) / 100).toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {d.consultation_duration_min ?? 30} min
                      </span>
                      {d.languages?.slice(0, 2).map((l) => (
                        <Badge key={l} variant="outline" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild className="w-full">
                      <Link to={`/doctors/${d.user_id}`}>View & Book</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
