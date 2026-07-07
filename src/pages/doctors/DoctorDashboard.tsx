import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";
import { Stethoscope, Loader2, Settings, CalendarClock, Euro, Share2, ClipboardList } from "lucide-react";
import AppointmentsPanel from "@/components/healthcare/AppointmentsPanel";
import DoctorEarningsCard from "@/components/healthcare/DoctorEarningsCard";
import ReferralsPanel from "@/components/healthcare/ReferralsPanel";
import DoctorAvailabilityEditor from "@/components/healthcare/DoctorAvailabilityEditor";

/**
 * Doctor-facing hub. Shows appointments, availability rules, earnings, referrals.
 * Redirects to /doctors/apply if the user has no healthcare_profiles row.
 */
export default function DoctorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("healthcare_profiles")
        .select("id, user_id, provider_name, specialty, timezone, is_accepting_bookings, consultation_price_cents")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto max-w-2xl px-4 py-8 pt-24">
          <Alert>
            <AlertTitle>Sign in required</AlertTitle>
            <AlertDescription>
              <Button asChild size="sm" className="mt-2">
                <Link to="/auth?next=/doctor-dashboard">Sign in</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-8 pt-24">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading dashboard…
          </p>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto max-w-2xl px-4 py-8 pt-24">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" /> You are not registered as a doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create your provider profile to start accepting paid video consultations in EUR.
              </p>
              <Button asChild>
                <Link to="/doctors/apply">Become a doctor</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Doctor dashboard · Unique Health</title>
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-6xl space-y-6 px-4 py-8 pt-24">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <Stethoscope className="h-6 w-6 text-primary" />
              {profile.provider_name ?? "Doctor dashboard"}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{profile.specialty}</span>
              <Badge variant={profile.is_accepting_bookings ? "default" : "outline"}>
                {profile.is_accepting_bookings ? "Accepting bookings" : "Not accepting"}
              </Badge>
              <span>· €{((profile.consultation_price_cents ?? 0) / 100).toFixed(2)} / session</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/doctors/${profile.user_id}`}>
                <Share2 className="mr-1 h-3 w-3" /> View public page
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/doctors/apply">
                <Settings className="mr-1 h-3 w-3" /> Edit profile
              </Link>
            </Button>
          </div>
        </div>

        {!profile.is_accepting_bookings && (
          <Alert>
            <AlertTitle>Your profile is hidden</AlertTitle>
            <AlertDescription>
              Set your availability below, then toggle "Accepting bookings" on your{" "}
              <Link to="/doctors/apply" className="underline">profile</Link> to appear in the doctor list.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments" className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" /> Appointments
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-1">
              <ClipboardList className="h-3 w-3" /> Availability
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-1">
              <Euro className="h-3 w-3" /> Earnings
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-1">
              <Share2 className="h-3 w-3" /> Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-4">
            <AppointmentsPanel />
          </TabsContent>
          <TabsContent value="availability" className="mt-4">
            <DoctorAvailabilityEditor doctorId={profile.user_id} timezone={profile.timezone ?? "UTC"} />
          </TabsContent>
          <TabsContent value="earnings" className="mt-4">
            <DoctorEarningsCard />
          </TabsContent>
          <TabsContent value="referrals" className="mt-4">
            <ReferralsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
