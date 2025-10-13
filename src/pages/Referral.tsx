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
    const shareUrl = `${window.location.origin}/auth?ref=${stats.code}`;
    const shareText = `Pripoj sa k Megatalent a súťaž o 100.000€! Použi môj kód: ${stats.code}`;
    
    // Try native share first (works on mobile)
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'Megatalent - Súťaž o 100.000€',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
    
    // Desktop fallback - open social media sharing
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
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
    <div className="min-h-screen bg-background pt-20 pb-12 px-2 sm:px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <Badge className="bg-gold text-gold-foreground animate-glow text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
            💰 5€ za každého priateľa
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold px-2">
            Referenčný{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              Program
            </span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
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
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 bg-background/10 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider break-all">
                      {stats?.code || "Načítavam..."}
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={copyReferralCode}
                    className="px-4 sm:px-6 w-full sm:w-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Kopírovať
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Zdieľaj svoj kód</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Pošli svoj referenčný kód priateľom cez social media, email alebo priamo
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Priateľ sa registruje</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Tvoj priateľ použije tvoj kód pri registrácii a aktivuje si Premium predplatné
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gold rounded-full flex items-center justify-center text-gold-foreground font-bold text-sm sm:text-base flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Získaš 5€</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
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
                  <div className="space-y-3 sm:space-y-4">
                    {stats.recentReferrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base flex-shrink-0">
                            {referral.profiles?.full_name?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">{referral.profiles?.full_name || "Nový používateľ"}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(referral.created_at), { 
                                addSuffix: true,
                                locale: sk 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-base sm:text-lg font-bold text-success">+{referral.amount}€</div>
                          <Badge 
                            variant={referral.paid ? 'default' : 'secondary'}
                            className={`text-xs ${referral.paid ? 'bg-success' : ''}`}
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
                  <div className="text-2xl sm:text-3xl font-bold text-success">{stats?.totalEarnings.toFixed(2) || 0}€</div>
                  <p className="text-sm sm:text-base text-muted-foreground">Celkové zárobky</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stats?.totalReferrals || 0}</div>
                  <p className="text-sm sm:text-base text-muted-foreground">Úspešné pozvánky</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-semibold text-gold">{stats?.pendingEarnings.toFixed(2) || 0}€</div>
                    <p className="text-xs text-muted-foreground">Čaká na výplatu</p>
                  </div>
                  <Button variant="hero" className="w-full text-sm sm:text-base" disabled={!stats?.pendingEarnings}>
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
