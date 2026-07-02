import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Trophy, 
  Heart, 
  Users, 
  TrendingUp,
  PartyPopper,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Milestone {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  reached: boolean;
  reward?: string;
}

interface Donor {
  id: string;
  name: string;
  amount: number;
  message?: string;
  avatar?: string;
  isAnonymous?: boolean;
}

interface FundraisingDashboardProps {
  campaignTitle?: string;
  goalAmount?: number;
  raisedAmount?: number;
  donorsCount?: number;
  daysLeft?: number;
  milestones?: Milestone[];
  topDonors?: Donor[];
  impactMetrics?: { label: string; value: string }[];
}

const defaultMilestones: Milestone[] = [
  { id: "1", title: "First goal", targetAmount: 1000, currentAmount: 1000, reached: true, reward: "Thank you video" },
  { id: "2", title: "Halfway there", targetAmount: 5000, currentAmount: 5000, reached: true, reward: "Live stream" },
  { id: "3", title: "Almost there", targetAmount: 8000, currentAmount: 7500, reached: false, reward: "Exclusive content" },
  { id: "4", title: "Goal!", targetAmount: 10000, currentAmount: 7500, reached: false, reward: "VIP access" },
];

const defaultDonors: Donor[] = [
  { id: "1", name: "Ján K.", amount: 500, message: "Good luck!" },
  { id: "2", name: "Mária S.", amount: 350, message: "Great initiative" },
  { id: "3", name: "Anonymous donor", amount: 300, isAnonymous: true },
  { id: "4", name: "Peter M.", amount: 250, message: "Happy to help" },
  { id: "5", name: "Anna B.", amount: 200 },
];

const defaultImpact = [
  { label: "People supported", value: "127" },
  { label: "Projects completed", value: "12" },
  { label: "Communities reached", value: "8" },
  { label: "Volunteers", value: "45" },
];

export const FundraisingDashboard = ({
  campaignTitle = "Let's help together",
  goalAmount = 10000,
  raisedAmount = 7500,
  donorsCount = 156,
  daysLeft = 14,
  milestones = defaultMilestones,
  topDonors = defaultDonors,
  impactMetrics = defaultImpact,
}: FundraisingDashboardProps) => {
  const progressPercent = (raisedAmount / goalAmount) * 100;

  return (
    <>
      <FloatingHowItWorks title={"Fundraising Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Fundraising Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Fundraising Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Main Progress Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{campaignTitle}</h2>
            <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary">
              €{raisedAmount.toLocaleString()}
            </div>
            <p className="text-muted-foreground">
              of €{goalAmount.toLocaleString()} goal
            </p>
          </div>

          <Progress value={progressPercent} className="h-4 mb-4" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{Math.round(progressPercent)}%</p>
              <p className="text-sm text-muted-foreground">Collected</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{donorsCount}</p>
              <p className="text-sm text-muted-foreground">Darcov</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{daysLeft}</p>
              <p className="text-sm text-muted-foreground">Days remaining</p>
            </div>
          </div>

          <Button className="w-full mt-6" size="lg" onClick={async () => {
            const amountStr = window.prompt("Contribution amount in €:", "10");
            if (!amountStr) return;
            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) { toast.error("Invalid amount"); return; }
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) { toast.error("Please log in first"); return; }
              const { data, error } = await supabase.functions.invoke("create-checkout", {
                body: { product_type: "fundraising_donation", amount, name: "Fundraising Donation" }
              });
              if (error) throw error;
              if (data?.url) window.open(data.url, "_blank");
            } catch (e: any) {
              toast.error(e.message || "Checkout zlyhal");
            }
          }}>
            <Heart className="h-4 w-4 mr-2" />
            Contribute now
          </Button>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-4 pl-10"
                >
                  <div
                    className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                      milestone.reached
                        ? "bg-green-500"
                        : "bg-muted border-2 border-border"
                    }`}
                  >
                    {milestone.reached && (
                      <PartyPopper className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{milestone.title}</p>
                      <Badge variant={milestone.reached ? "default" : "secondary"}>
                        €{milestone.targetAmount.toLocaleString()}
                      </Badge>
                    </div>
                    {milestone.reward && (
                      <p className="text-sm text-muted-foreground">
                        Odmena: {milestone.reward}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donor Wall */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Stena darcov
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDonors.map((donor, index) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-primary flex items-center justify-center text-primary-foreground font-bold">
                  {donor.isAnonymous ? "?" : donor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{donor.name}</p>
                  {donor.message && (
                    <p className="text-sm text-muted-foreground truncate">
                      "{donor.message}"
                    </p>
                  )}
                </div>
                <Badge variant="outline">€{donor.amount}</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Dopad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {impactMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-lg bg-muted/50"
              >
                <p className="text-3xl font-bold text-primary">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share */}
      <Button variant="outline" className="w-full" onClick={async () => {
        const url = window.location.href;
        const shareData = { title: "Fundraising Campaign", text: "Support this campaign!", url };
        try {
          if (navigator.share) await navigator.share(shareData);
          else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
        } catch {}
      }}>
        <Share2 className="h-4 w-4 mr-2" />
        Share Campaign
      </Button>
    </div>
    </>
  );
};

export default FundraisingDashboard;
