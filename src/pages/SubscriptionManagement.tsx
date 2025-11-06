import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useAncestorTwin } from "@/hooks/useAncestorTwin";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { subscription, loading, checkSubscription } = useAncestorTwin();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await checkSubscription();
      toast.success("Stav predplatného bol aktualizovaný");
    } catch (error) {
      toast.error("Chyba pri aktualizácii stavu predplatného");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Musíte byť prihlásený");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Nepodarilo sa otvoriť portál pre správu predplatného");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Chyba pri otváraní portálu pre správu predplatného");
    } finally {
      setIsOpeningPortal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/ancestor-twin")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Správa predplatného</h1>
            <p className="text-muted-foreground mt-2">
              Spravujte svoje predplatné a platobné údaje
            </p>
          </div>
        </div>

        {/* Current Subscription Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Aktuálny stav predplatného
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Obnoviť
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {subscription.hasSubscription ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {subscription.hasSubscription ? "Aktívne predplatné" : "Žiadne aktívne predplatné"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.hasSubscription
                      ? "Máte prístup ku všetkým funkciám Ancestor Twin"
                      : "Zakúpte si predplatné pre neomedzený prístup"}
                  </p>
                </div>
              </div>
              <Badge variant={subscription.hasSubscription ? "default" : "secondary"}>
                {subscription.hasSubscription ? "AKTÍVNE" : "NEAKTÍVNE"}
              </Badge>
            </div>

            {subscription.hasSubscription && subscription.subscriptionEnd && (
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Platnosť do</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subscription.subscriptionEnd).toLocaleDateString("sk-SK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manage Subscription */}
        {subscription.hasSubscription && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Spravovať predplatné</CardTitle>
              <CardDescription>
                Aktualizujte platobné údaje, zrušte alebo zmeňte predplatné
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleManageSubscription}
                disabled={isOpeningPortal}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {isOpeningPortal ? "Otváram portál..." : "Otvoriť Stripe portál"}
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Budete presmerovaný na bezpečný Stripe portál pre správu predplatného
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Subscription - Call to Action */}
        {!subscription.hasSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Začnite s Ancestor Twin</CardTitle>
              <CardDescription>
                Objavte svojich historických dvojníkov s našimi prémiové balíčkmi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/ancestor-twin")}
                className="w-full"
                size="lg"
              >
                Zobraziť cenové balíčky
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="mt-6 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Potrebujete pomoc?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Všetky platby sú spracovávané bezpečne cez Stripe</p>
            <p>• Predplatné sa automaticky obnovuje každý mesiac</p>
            <p>• Môžete kedykoľvek zrušiť predplatné bez poplatkov</p>
            <p>• Pre podporu kontaktujte náš tím na support@megasocial.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
