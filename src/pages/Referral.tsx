import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Users, Euro, Gift, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Referral = () => {
  const [referralCode] = useState("MEGA2024XYZ");
  const [earnings] = useState(45); // Mock earnings
  const [referrals] = useState(9); // Mock referral count
  const { toast } = useToast();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Skopírované!",
      description: "Referenčný kód bol skopírovaný do schránky",
    });
  };

  const shareReferral = () => {
    const shareText = `Pripoj sa k Megatalent a súťaž o 100.000€! Použi môj kód: ${referralCode}`;
    const shareUrl = `https://megatalent.app/register?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Megatalent - Súťaž o 100.000€',
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Skopírované!",
        description: "Odkaz na zdieľanie bol skopírovaný",
      });
    }
  };

  const recentReferrals = [
    { name: "Martina K.", date: "pred 2 dňami", earnings: 5, status: "paid" },
    { name: "Tomáš H.", date: "pred 1 týždňom", earnings: 5, status: "paid" },
    { name: "Jana S.", date: "pred 2 týždňami", earnings: 5, status: "pending" },
  ];

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
                      {referralCode}
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
                  <Button variant="secondary" className="w-full">
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
                <div className="space-y-4">
                  {recentReferrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {referral.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{referral.name}</p>
                          <p className="text-sm text-muted-foreground">{referral.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-success">+{referral.earnings}€</div>
                        <Badge 
                          variant={referral.status === 'paid' ? 'default' : 'secondary'}
                          className={referral.status === 'paid' ? 'bg-success' : ''}
                        >
                          {referral.status === 'paid' ? 'Vyplatené' : 'Čaká'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="text-3xl font-bold text-success">{earnings}€</div>
                  <p className="text-muted-foreground">Celkové zárobky</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{referrals}</div>
                  <p className="text-muted-foreground">Úspešné pozvánky</p>
                </div>
                
                <Button variant="hero" className="w-full">
                  <Euro className="h-4 w-4 mr-2" />
                  Vybrať peniaze
                </Button>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>🏆 Top refereri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Peter M.", referrals: 23, earnings: 115 },
                    { name: "Anna K.", referrals: 18, earnings: 90 },
                    { name: "Michal T.", referrals: 15, earnings: 75 },
                    { name: "Ty", referrals: referrals, earnings: earnings },
                  ].sort((a, b) => b.referrals - a.referrals).map((person, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded ${
                      person.name === "Ty" ? "bg-gold/10 border border-gold/20" : ""
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-gold text-gold-foreground' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-400 text-white' :
                          'bg-secondary'
                        }`}>
                          {index + 1}
                        </div>
                        <span className={person.name === "Ty" ? "font-bold" : ""}>
                          {person.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{person.referrals}</div>
                        <div className="text-xs text-muted-foreground">{person.earnings}€</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bonus Info */}
            <Card className="bg-gradient-gold text-gold-foreground">
              <CardHeader>
                <CardTitle>🎁 Bonus za 10 priateľov</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Pozvi 10 priateľov a získaj bonus 25€!
                </p>
                <div className="w-full bg-gold-foreground/20 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gold-foreground h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((referrals / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center">
                  {referrals}/10 priateľov
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;