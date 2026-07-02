import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Link2, Copy, Check, Users, DollarSign, TrendingUp, Share2, Gift, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const affiliateStats = {
  totalReferrals: 24,
  activeReferrals: 18,
  pendingEarnings: 156.80,
  totalEarnings: 892.40,
  conversionRate: 32,
  clicks: 248,
};

const recentReferrals = [
  { id: 1, user: "John D.", course: "Web Dev Bootcamp", commission: 14.99, status: "paid", date: "Apr 3, 2026" },
  { id: 2, user: "Sarah K.", course: "ML Fundamentals", commission: 23.99, status: "paid", date: "Apr 2, 2026" },
  { id: 3, user: "Mike R.", course: "Digital Marketing", commission: 11.99, status: "pending", date: "Apr 1, 2026" },
  { id: 4, user: "Emily T.", course: "Python Advanced", commission: 17.99, status: "pending", date: "Mar 30, 2026" },
  { id: 5, user: "Alex W.", course: "UX Design", commission: 13.49, status: "paid", date: "Mar 28, 2026" },
];

export function AffiliateProgramView({ onBack }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : "https://uniqueapp.fun"}/learning?ref=USR-2847`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link Copied!", description: "Share it to earn commissions" });
  };

  return (
    <>
      <FloatingHowItWorks title={"Affiliate Program View - How it works"} steps={[{ title: 'Open', desc: 'Access the Affiliate Program View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Affiliate Program View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Affiliate Program</h2>
          <p className="text-sm text-muted-foreground">Earn 30% commission on every referral</p>
        </div>
      </div>

      {/* Referral Link */}
      <Card className="mb-6 border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold">Your Referral Link</span>
          </div>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="bg-muted/50 font-mono text-sm" />
            <Button onClick={copyLink} variant={copied ? "default" : "outline"} className={copied ? "bg-emerald-500" : ""}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-black">{affiliateStats.totalReferrals}</p>
          <p className="text-xs text-muted-foreground">Total Referrals</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">€{affiliateStats.totalEarnings}</p>
          <p className="text-xs text-muted-foreground">Total Earned</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Gift className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">€{affiliateStats.pendingEarnings}</p>
          <p className="text-xs text-muted-foreground">Pending Payout</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-black">{affiliateStats.conversionRate}%</p>
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <p className="text-2xl font-black">{affiliateStats.clicks}</p>
          <p className="text-xs text-muted-foreground">Link Clicks</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-500" />
            </div>
          </div>
          <p className="text-2xl font-black">{affiliateStats.activeReferrals}</p>
          <p className="text-xs text-muted-foreground">Active Students</p>
        </Card>
      </div>

      {/* Recent Referrals */}
      <h3 className="text-lg font-bold mb-3">Recent Referrals</h3>
      <div className="space-y-2">
        {recentReferrals.map(ref => (
          <Card key={ref.id} className="p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{ref.user}</h4>
                <p className="text-xs text-muted-foreground">{ref.course} • {ref.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={ref.status === "paid" ? "default" : "secondary"} className={ref.status === "paid" ? "bg-emerald-500" : ""}>
                  {ref.status}
                </Badge>
                <span className="font-bold text-emerald-600">€{ref.commission}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}