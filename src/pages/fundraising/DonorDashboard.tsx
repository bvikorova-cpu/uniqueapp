import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Receipt, Repeat, TrendingUp, ArrowLeft, Download, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface Donation {
  id: string;
  campaign_id: string;
  campaign_type: string;
  amount: number;
  is_monthly: boolean;
  is_anonymous: boolean;
  message: string | null;
  status: string;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  medical: "🏥 Medical",
  dream: "✨ Dream",
  hero: "🦸 Hero",
  crisis: "🚨 Crisis",
  pet: "🐾 Pet",
  student: "🎓 Student",
  talent: "🎭 Talent",
};

const typeRoutes: Record<string, string> = {
  medical: "medical", dream: "dream", hero: "hero",
  crisis: "crisis", pet: "pet", student: "student", talent: "talent",
};

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      const { data, error } = await supabase
        .from("campaign_donations")
        .select("*")
        .eq("donor_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) {
        toast({ title: "Error loading donations", description: error.message, variant: "destructive" });
      } else {
        setDonations((data as Donation[]) || []);
      }
      setLoading(false);
    })();
  }, [navigate]);

  const stats = useMemo(() => {
    const paid = donations.filter(d => d.status === "paid" || d.status === "completed");
    const total = paid.reduce((s, d) => s + Number(d.amount), 0);
    const monthly = paid.filter(d => d.is_monthly);
    const byType: Record<string, number> = {};
    paid.forEach(d => {
      byType[d.campaign_type] = (byType[d.campaign_type] || 0) + Number(d.amount);
    });
    return {
      total,
      count: paid.length,
      monthlyCount: monthly.length,
      monthlyAmount: monthly.reduce((s, d) => s + Number(d.amount), 0),
      byType,
      thisYear: paid.filter(d => new Date(d.created_at).getFullYear() === new Date().getFullYear())
        .reduce((s, d) => s + Number(d.amount), 0),
    };
  }, [donations]);

  const monthlyDonations = donations.filter(d => d.is_monthly && (d.status === "paid" || d.status === "completed"));

  const downloadReceipt = (donationId: string) => {
    navigate(`/fundraising/receipt/${donationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate("/fundraising")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fundraising
        </Button>
        <Button variant="secondary" size="sm" onClick={() => navigate("/fundraising/recurring")} className="mb-6 ml-2">
          <Repeat className="mr-2 h-4 w-4" /> Manage monthly donations
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <Badge variant="secondary">Donor Dashboard</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Impact</h1>
          <p className="text-muted-foreground">Every euro you give helps real people, animals, and dreams come true.</p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Heart, label: "Total donated", value: `€${stats.total.toFixed(2)}`, color: "text-pink-500" },
            { icon: Receipt, label: "Donations", value: stats.count, color: "text-primary" },
            { icon: Repeat, label: "Monthly active", value: stats.monthlyCount, color: "text-blue-500" },
            { icon: TrendingUp, label: "This year", value: `€${stats.thisYear.toFixed(2)}`, color: "text-green-500" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="pt-6">
                  <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Impact by category */}
        {Object.keys(stats.byType).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Impact by category</CardTitle>
              <CardDescription>Where your giving went</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, amount]) => {
                  const pct = (amount / stats.total) * 100;
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{typeLabels[type] || type}</span>
                        <span className="font-medium">€{amount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All ({donations.length})</TabsTrigger>
            <TabsTrigger value="monthly">Monthly ({monthlyDonations.length})</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {donations.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="mb-4">No donations yet</p>
                <Button onClick={() => navigate("/fundraising")}>Explore campaigns</Button>
              </CardContent></Card>
            ) : (
              donations.map(d => (
                <Card key={d.id}>
                  <CardContent className="py-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline">{typeLabels[d.campaign_type] || d.campaign_type}</Badge>
                        {d.is_monthly && <Badge variant="secondary"><Repeat className="h-3 w-3 mr-1" />Monthly</Badge>}
                        {d.is_anonymous && <Badge variant="secondary">Anonymous</Badge>}
                        <Badge variant={d.status === "paid" || d.status === "completed" ? "default" : "outline"}>
                          {d.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(d.created_at).toLocaleDateString()}
                      </p>
                      {d.message && <p className="text-sm italic mt-1">"{d.message}"</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">€{Number(d.amount).toFixed(2)}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/fundraising/${typeRoutes[d.campaign_type]}/${d.campaign_id}`)}>
                        View
                      </Button>
                      {(d.status === "paid" || d.status === "completed") && (
                        <Button variant="ghost" size="icon" onClick={() => downloadReceipt(d.id)} title="Receipt">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-3 mt-4">
            {monthlyDonations.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                <Repeat className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No active monthly donations</p>
              </CardContent></Card>
            ) : (
              <>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly recurring impact</p>
                      <p className="text-2xl font-bold">€{stats.monthlyAmount.toFixed(2)}/mo</p>
                    </div>
                    <Repeat className="h-8 w-8 text-primary" />
                  </CardContent>
                </Card>
                {monthlyDonations.map(d => (
                  <Card key={d.id}>
                    <CardContent className="py-4 flex items-center justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="mb-1">{typeLabels[d.campaign_type]}</Badge>
                        <p className="text-sm text-muted-foreground">Started {new Date(d.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xl font-bold text-primary">€{Number(d.amount).toFixed(2)}/mo</p>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="receipts" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tax-deductible receipts</CardTitle>
                <CardDescription>Download receipts for your records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {donations.filter(d => d.status === "paid" || d.status === "completed").map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            €{Number(d.amount).toFixed(2)} — {typeLabels[d.campaign_type]}
                          </p>
                          <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => downloadReceipt(d.id)}>
                        <Download className="h-4 w-4 mr-2" /> Receipt
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
