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
import { enUS } from "date-fns/locale";

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
      title: "Copied!",
      description: "Referral code was copied to clipboard",
    });
  };

  const shareReferral = async () => {
    if (!stats?.code) return;
    const shareUrl = `${window.location.origin}/auth?ref=${stats.code}`;
    const shareText = `Join Megatalent and compete for €100,000! Use my code: ${stats.code}`;
    
    // Try native share first (works on mobile)
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'Megatalent - Compete for €100,000',
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
    const subject = encodeURIComponent('Invitation to Megatalent - Compete for €100,000');
    const body = encodeURIComponent(
      `Hi!\n\nI'd like to invite you to Megatalent, where you can compete for €100,000!\n\nUse my referral code when registering: ${stats.code}\n\nSign up here: ${window.location.origin}/auth?ref=${stats.code}\n\nLooking forward to seeing you!`
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
            💰 €5 for each friend
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold px-2">
            Referral{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              Program
            </span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Invite your friends to Megatalent and earn €5 for each one 
            who activates a Premium subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Referral Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Gift className="h-8 w-8" />
                  Your referral code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 bg-background/10 rounded-lg p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider break-all">
                      {stats?.code || "Loading..."}
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={copyReferralCode}
                    className="px-4 sm:px-6 w-full sm:w-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button 
                    variant="secondary" 
                    onClick={shareReferral}
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share link
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={inviteByEmail}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Invite by email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle>How does it work?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Share your code</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Send your referral code to friends via social media, email or directly
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Friend signs up</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Your friend uses your code when registering for the contest and activates Premium subscription in the Megatalent contest
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gold rounded-full flex items-center justify-center text-gold-foreground font-bold text-sm sm:text-base flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">You get €5</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        You automatically receive €5 to your account after subscription activation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Referrals */}
            <Card>
              <CardHeader>
                <CardTitle>Recent invitations</CardTitle>
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
                            <p className="font-semibold text-sm sm:text-base truncate">{referral.profiles?.full_name || "New user"}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(referral.created_at), { 
                                addSuffix: true,
                                locale: enUS 
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
                            {referral.paid ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    You don't have any successful invitations yet
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
                  Your statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl sm:text-3xl font-bold text-success">€{stats?.totalEarnings.toFixed(2) || 0}</div>
                  <p className="text-sm sm:text-base text-muted-foreground">Total earnings</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stats?.totalReferrals || 0}</div>
                  <p className="text-sm sm:text-base text-muted-foreground">Successful invitations</p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-semibold text-gold">€{stats?.pendingEarnings.toFixed(2) || 0}</div>
                    <p className="text-xs text-muted-foreground">Pending payout</p>
                  </div>
                  <Button variant="hero" className="w-full text-sm sm:text-base" disabled={!stats?.pendingEarnings}>
                    <Euro className="h-4 w-4 mr-2" />
                    Withdraw money
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>🏆 Top referrers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Best referrers this month
                  </p>
                  {[
                    { name: "You", referrals: stats?.totalReferrals || 0, earnings: stats?.totalEarnings || 0, isYou: true },
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
                        <div className="text-xs text-muted-foreground">€{person.earnings.toFixed(2)}</div>
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
