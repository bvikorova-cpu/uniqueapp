import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Users, Euro, Gift, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReferralProgram } from "@/hooks/useReferralProgram";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";

const Referral = () => {
  const { stats, loading, refreshStats } = useReferralProgram();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    };
    checkUser();
  }, [navigate]);

  const copyReferralCode = () => {
    if (!stats?.code) return;
    navigator.clipboard.writeText(stats.code);
    toast({
      title: "Skopírované!",
      description: "Referenčný kód bol skopírovaný do schránky",
    });
  };

  const shareReferral = async () => {
    if (!stats?.code) return;
    const shareText = `Pripoj sa k Megatalent a súťaž o 100.000€! Použi môj kód: ${stats.code}`;
    const shareUrl = `${window.location.origin}/auth?ref=${stats.code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Megatalent - Súťaž o 100.000€',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: "Skopírované!",
        description: "Odkaz bol skopírovaný do schránky",
      });
    }
  };

  const inviteByEmail = () => {
    if (!stats?.code) return;
    const subject = encodeURIComponent('Pozvánka do Megatalent - Súťaž o 100.000€');
    const body = encodeURIComponent(
      `Ahoj!\n\nChcel by som ťa pozvať do Megatalent, kde môžeš súťažiť o 100.000€!\n\nPouži môj referenčný kód pri registrácii: ${stats.code}\n\nRegistruj sa tu: ${window.location.origin}/auth?ref=${stats.code}\n\nTešíme sa na teba!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-gold text-gold-foreground animate-glow text-lg px-4 py-2">
            💰 5€ za každého priateľa
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold">
            Referenčný{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              Program
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pozvi svojich priateľov do Megatalent a zarábaj 5€ za každého, 
            kto si aktivuje Premium predplatné
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Referral Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gift className="h-8 w-8" />
                  Tvoj referenčný kód
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-background/10 rounded-lg p-4">
                    <div className="text-2xl font-mono font-bold tracking-wider">
                      {stats?.code || "Načítavam..."}
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={copyReferralCode}
                    className="px-6"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Kopírovať
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="secondary" 
                    onClick={shareReferral}
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Zdieľať odkaz
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={inviteByEmail}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Pozvať emailom
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle>Ako to funguje?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">Zdieľaj svoj kód</h3>
                      <p className="text-muted-foreground">
                        Pošli svoj referenčný kód priateľom cez social media, email alebo priamo
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">Priateľ sa registruje</h3>
                      <p className="text-muted-foreground">
                        Tvoj priateľ použije tvoj kód pri registrácii a aktivuje si Premium predplatné
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-gold-foreground font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">Získaš 5€</h3>
                      <p className="text-muted-foreground">
                        Automaticky dostaneš 5€ na svoj účet po aktivácii predplatného
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Referrals */}
            <Card>
              <CardHeader>
                <CardTitle>Nedávne pozvánky</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentReferrals && stats.recentReferrals.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentReferrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                            {referral.profiles?.full_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-semibold">{referral.profiles?.full_name || "Nový používateľ"}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(referral.created_at), { 
                                addSuffix: true,
                                locale: sk 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">+{referral.amount}€</div>
                          <Badge 
                            variant={referral.paid ? 'default' : 'secondary'}
                            className={referral.paid ? 'bg-success' : ''}
                          >
                            {referral.paid ? 'Vyplatené' : 'Čaká'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Zatiaľ nemáš žiadne úspešné pozvánky
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tvoje štatistiky
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-success">{stats?.totalEarnings.toFixed(2) || 0}€</div>
                  <p className="text-muted-foreground">Celkové zárobky</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{stats?.totalReferrals || 0}</div>
                  <p className="text-muted-foreground">Úspešné pozvánky</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gold">{stats?.pendingEarnings.toFixed(2) || 0}€</div>
                    <p className="text-xs text-muted-foreground">Čaká na výplatu</p>
                  </div>
                  <Button variant="hero" className="w-full" disabled={!stats?.pendingEarnings}>
                    <Euro className="h-4 w-4 mr-2" />
                    Vybrať peniaze
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>🏆 Top refereri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Najlepší refereri tohto mesiaca
                  </p>
                  {[
                    { name: "Ty", referrals: stats?.totalReferrals || 0, earnings: stats?.totalEarnings || 0, isYou: true },
                  ].map((person, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded ${
                      person.isYou ? "bg-gold/10 border border-gold/20" : ""
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gold text-gold-foreground`}>
                          {index + 1}
                        </div>
                        <span className="font-bold">
                          {person.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{person.referrals}</div>
                        <div className="text-xs text-muted-foreground">{person.earnings.toFixed(2)}€</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
