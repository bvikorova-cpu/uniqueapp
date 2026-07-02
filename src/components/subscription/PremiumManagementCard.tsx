import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Settings, Crown, Shield, RefreshCw, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PremiumManagementCardProps {
  subscribed: boolean;
  onManage: () => void;
  title?: string;
  description?: string;
  tierLabel?: string;
}

export const PremiumManagementCard = ({
  subscribed,
  onManage,
  title = "Premium Subscription",
  description = "Manage your subscription, invoices and billing.",
  tierLabel = "Active",
}: PremiumManagementCardProps) => {
  if (!subscribed) return null;

  return (
    <>
      <FloatingHowItWorks title={"Premium Management Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Premium Management Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Premium Management Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/5 to-amber-400/5 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-amber-400" />
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-purple-500 text-primary-foreground border-0 shadow-md">
              ✨ {tierLabel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          <Button
            onClick={onManage}
            className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/20 font-semibold"
            size="lg"
          >
            <Settings className="mr-2 h-4 w-4" />
            Open Billing Portal
          </Button>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { icon: FileText, label: "Invoices" },
              { icon: CreditCard, label: "Payment" },
              { icon: RefreshCw, label: "Plan" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-background/40 border border-border/40"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Secure billing portal — managed by Stripe. Cancel anytime.</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
