import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Users, Euro, Gift, TrendingUp, Loader2, Crown, ArrowLeft, MessageCircle, Send, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReferralProgram } from "@/hooks/useReferralProgram";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import heroVideo from "@/assets/megatalent-hero.mp4.asset.json";
import { ReferralLeaderboard } from "@/components/referral/ReferralLeaderboard";
import { ReferralMilestones } from "@/components/referral/ReferralMilestones";
import { ReferralWithdrawalRequest } from "@/components/referral/ReferralWithdrawalRequest";
import { ReferralQRDialog } from "@/components/referral/ReferralQRDialog";
import { ReferralEarningsCalculator } from "@/components/referral/ReferralEarningsCalculator";
import { AffiliateTierCard } from "@/components/affiliate/AffiliateTierCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const Referral = () => {
  const { stats, loading, refreshStats } = useReferralProgram();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setUser(user);
    };
    checkUser();
  }, [navigate]);

  const copyReferralCode = () => {
    if (!stats?.code) return;
    navigator.clipboard.writeText(stats.code);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
  };

  const shareReferral = async () => {
    if (!stats?.code) return;
    const shareUrl = `${window.location.origin}/auth?ref=${stats.code}`;
    const shareText = `Join MegaTalent and compete for €10,000! Use my code: ${stats.code}`;
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try { await navigator.share({ title: 'MegaTalent - Win €10,000', text: shareText, url: shareUrl }); return; } catch {}
    }
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
  };

  const inviteByEmail = () => {
    if (!stats?.code) return;
    const subject = encodeURIComponent('Join MegaTalent - Win €10,000!');
    const body = encodeURIComponent(`Hi!\n\nI'd like to invite you to MegaTalent, where you can compete for €10,000!\n\nUse my referral code: ${stats.code}\n\nSign up: ${window.location.origin}/auth?ref=${stats.code}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareWhatsApp = () => {
    if (!stats?.code) return;
    const url = `${window.location.origin}/auth?ref=${stats.code}`;
    const text = `🎉 Join me on MegaTalent and compete for €10,000! Use my code ${stats.code}: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareTelegram = () => {
    if (!stats?.code) return;
    const url = `${window.location.origin}/auth?ref=${stats.code}`;
    const text = `🎉 Join me on MegaTalent! Use my code ${stats.code}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-yellow-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <FloatingHowItWorks
        title={'Invite a Friend'}
        intro={'Share your link — earn credits when friends join and reach milestones.'}
        steps={[
          { title: 'Copy your link', desc: 'Every account has a unique referral code and share link.' },
        { title: 'Share it', desc: 'Send by WhatsApp, email, or QR. Track opens in your dashboard.' },
        { title: 'Friend signs up', desc: 'You get credits when they register and stay active for 7 days.' },
        { title: 'Milestone bonuses', desc: 'Extra rewards at 5, 10, and 25 referrals plus a monthly leaderboard prize.' }
        ]}
      />
      {/* Cinematic Hero */}
      <div className="relative overflow-hidden mb-8 min-h-[300px]">
        <div className="absolute inset-0 z-0">
          <video src={heroVideo.url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ filter: "brightness(1.1) saturate(1.15)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/40" />
        </div>
        <div className="relative z-10 container mx-auto px-4 max-w-6xl py-12 sm:py-14">
          <Button variant="ghost" onClick={() => navigate("/megatalent")} className="mb-4 gap-2 text-white/90 hover:text-white bg-black/30 backdrop-blur-sm border border-white/20">
            <ArrowLeft className="h-4 w-4" /> Back to MegaTalent
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl rounded-2xl border-2 border-yellow-500/30 bg-black/40 px-4 py-5 text-center shadow-2xl backdrop-blur-lg sm:px-8 sm:py-8">
            <Badge className="bg-yellow-500/90 text-black font-bold mb-4">💰 €5 for each friend</Badge>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
              Referral <span className="text-yellow-400">Program</span>
            </h1>
            <p className="text-white/85 text-base sm:text-lg font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow">
              Invite your friends to MegaTalent and earn €5 for each one who activates a Premium subscription
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <AffiliateTierCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Referral Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-yellow-500 to-amber-600 text-black border-0">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><Gift className="h-8 w-8" /> Your Referral Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 bg-black/10 rounded-lg p-4">
                    <div className="text-2xl font-mono font-bold tracking-wider break-all">{stats?.code || "Loading..."}</div>
                  </div>
                  <Button variant="secondary" onClick={copyReferralCode} className="px-6"><Copy className="h-4 w-4 mr-2" /> Copy</Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <Button variant="secondary" onClick={shareReferral} className="w-full"><Share2 className="h-4 w-4 mr-1.5" /> Share</Button>
                  <Button variant="secondary" onClick={shareWhatsApp} className="w-full bg-[#25D366]/90 hover:bg-[#25D366] text-white"><MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp</Button>
                  <Button variant="secondary" onClick={shareTelegram} className="w-full bg-[#0088cc]/90 hover:bg-[#0088cc] text-white"><Send className="h-4 w-4 mr-1.5" /> Telegram</Button>
                  <Button variant="secondary" onClick={inviteByEmail} className="w-full"><Users className="h-4 w-4 mr-1.5" /> Email</Button>
                  <Button variant="secondary" onClick={() => setQrOpen(true)} className="w-full"><QrCode className="h-4 w-4 mr-1.5" /> QR</Button>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <ReferralMilestones totalReferrals={stats?.totalReferrals || 0} />

            {/* How it works */}
            <Card className="border-yellow-500/10 bg-card/80 backdrop-blur-xl">
              <CardHeader><CardTitle>How Does It Work?</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { step: 1, title: "Share your code", desc: "Send your referral code to friends via social media, email or directly", color: "bg-yellow-500" },
                    { step: 2, title: "Friend signs up", desc: "Your friend uses your code when registering and activates Premium subscription", color: "bg-amber-500" },
                    { step: 3, title: "You get €5", desc: "You automatically receive €5 to your account after subscription activation", color: "bg-yellow-400" },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0`}>{item.step}</div>
                      <div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Referrals */}
            <Card className="border-yellow-500/10 bg-card/80 backdrop-blur-xl">
              <CardHeader><CardTitle>Recent Invitations</CardTitle></CardHeader>
              <CardContent>
                {stats?.recentReferrals && stats.recentReferrals.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentReferrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 border border-yellow-500/10 rounded-lg">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center text-black font-bold shrink-0">
                            {referral.profiles?.full_name?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{referral.profiles?.full_name || "New user"}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(referral.created_at), { addSuffix: true, locale: enUS })}</p>
                              {referral.source_kind === "subscription" && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-400">Subscription</Badge>
                              )}
                              {referral.source_kind === "one_off" && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-blue-500/40 text-blue-400">One-time</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-yellow-500">+{referral.amount}€</div>
                          <Badge className={referral.paid ? 'bg-yellow-500 text-black' : 'bg-muted'}>{referral.paid ? 'Paid' : 'Pending'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">You don't have any successful invitations yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-yellow-500" /> Your Statistics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-yellow-500">€{stats?.totalEarnings.toFixed(2) || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-yellow-400">{stats?.totalReferrals || 0}</div>
                  <p className="text-sm text-muted-foreground">Successful Invitations</p>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-amber-500">€{stats?.pendingEarnings.toFixed(2) || 0}</div>
                    <p className="text-xs text-muted-foreground">Pending Payout</p>
                  </div>
                  <Button
                    onClick={() => setWithdrawOpen(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold"
                    disabled={!stats?.pendingEarnings || (stats?.pendingEarnings || 0) < 10}
                  >
                    <Euro className="h-4 w-4 mr-2" /> Withdraw Money
                  </Button>
                  {(stats?.pendingEarnings || 0) > 0 && (stats?.pendingEarnings || 0) < 10 && (
                    <p className="text-xs text-center text-muted-foreground">Minimum €10 to withdraw</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <ReferralEarningsCalculator />
            <ReferralLeaderboard currentUserId={user?.id} />
          </div>
        </div>
      </div>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Withdraw Referral Earnings</DialogTitle>
          </DialogHeader>
          <ReferralWithdrawalRequest />
        </DialogContent>
      </Dialog>

      {stats?.code && (
        <ReferralQRDialog
          open={qrOpen}
          onOpenChange={setQrOpen}
          url={`${window.location.origin}/auth?ref=${stats.code}`}
          code={stats.code}
        />
      )}
    </div>
  );
};

export default Referral;
