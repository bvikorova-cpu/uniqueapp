import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";

interface JobListing {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  is_active: boolean;
  created_at: string;
  applications_count: number | null;
  job_listing_payments: Array<{
    id: string;
    expires_at: string;
    duration_days: number;
    amount: number;
    status: string;
    expiration_notification_sent_at: string | null;
  }>;
}

export default function EmployerDashboard() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    setUser(user);
    fetchListings(user.id);
  };

  const fetchListings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("job_listings")
        .select(`
          *,
          job_listing_payments (
            id,
            expires_at,
            duration_days,
            amount,
            status,
            expiration_notification_sent_at
          )
        `)
        .eq("employer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať ponuky práce",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiration = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationBadge = (listing: JobListing) => {
    if (!listing.is_active) {
      return <Badge variant="secondary">Neaktívna</Badge>;
    }

    const activePayment = listing.job_listing_payments?.find(p => p.status === "completed");
    if (!activePayment) {
      return <Badge variant="secondary">Čaká sa na platbu</Badge>;
    }

    const daysLeft = getDaysUntilExpiration(activePayment.expires_at);
    
    if (daysLeft < 0) {
      return <Badge variant="destructive">Vypršala</Badge>;
    } else if (daysLeft <= 3) {
      return <Badge variant="destructive">Vyprší o {daysLeft} {daysLeft === 1 ? 'deň' : 'dni'}</Badge>;
    } else if (daysLeft <= 7) {
      return <Badge className="bg-warning text-warning-foreground">Vyprší o {daysLeft} dní</Badge>;
    } else {
      return <Badge variant="default">Aktívna ({daysLeft} dní)</Badge>;
    }
  };

  const handleRenew = (listingId: string) => {
    navigate(`/jobs?renew=${listingId}`);
  };

  const activeListings = listings.filter(l => l.is_active);
  const inactiveListings = listings.filter(l => !l.is_active);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard zamestnávateľa</h1>
          <p className="text-muted-foreground">Spravujte svoje ponuky práce</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Celkovo ponúk</p>
                <p className="text-2xl font-bold">{listings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktívne ponuky</p>
                <p className="text-2xl font-bold">{activeListings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Čoskoro vyprší</p>
                <p className="text-2xl font-bold">
                  {activeListings.filter(l => {
                    const payment = l.job_listing_payments?.find(p => p.status === "completed");
                    return payment && getDaysUntilExpiration(payment.expires_at) <= 7;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Aktívne ({activeListings.length})</TabsTrigger>
            <TabsTrigger value="inactive">Neaktívne ({inactiveListings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeListings.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">Nemáte žiadne aktívne ponuky práce</p>
                <Button onClick={() => navigate("/jobs")}>
                  Pridať novú ponuku
                </Button>
              </Card>
            ) : (
              activeListings.map((listing) => {
                const activePayment = listing.job_listing_payments?.find(p => p.status === "completed");
                const daysLeft = activePayment ? getDaysUntilExpiration(activePayment.expires_at) : null;

                return (
                  <Card key={listing.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{listing.title}</h3>
                          {getExpirationBadge(listing)}
                        </div>
                        <p className="text-muted-foreground mb-2">{listing.company_name}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>📍 {listing.location}</span>
                          <span>💼 {listing.job_type}</span>
                          {listing.salary_min && listing.salary_max && (
                            <span>💰 {listing.salary_min} - {listing.salary_max} €</span>
                          )}
                          <span>👥 {listing.applications_count || 0} žiadostí</span>
                        </div>
                        {activePayment && (
                          <div className="mt-3 text-sm">
                            <p className="text-muted-foreground">
                              Vyprší: {new Date(activePayment.expires_at).toLocaleDateString('sk-SK')} 
                              ({formatDistanceToNow(new Date(activePayment.expires_at), { addSuffix: true, locale: sk })})
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {daysLeft !== null && daysLeft <= 7 && (
                          <Button 
                            onClick={() => handleRenew(listing.id)}
                            className="w-full md:w-auto"
                          >
                            Predĺžiť ponuku
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/jobs`)}
                          className="w-full md:w-auto"
                        >
                          Zobraziť detail
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            {inactiveListings.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nemáte žiadne neaktívne ponuky práce</p>
              </Card>
            ) : (
              inactiveListings.map((listing) => (
                <Card key={listing.id} className="p-6 opacity-75">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{listing.title}</h3>
                        {getExpirationBadge(listing)}
                      </div>
                      <p className="text-muted-foreground mb-2">{listing.company_name}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>📍 {listing.location}</span>
                        <span>💼 {listing.job_type}</span>
                        <span>👥 {listing.applications_count || 0} žiadostí</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleRenew(listing.id)}
                      className="w-full md:w-auto"
                    >
                      Obnoviť ponuku
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
