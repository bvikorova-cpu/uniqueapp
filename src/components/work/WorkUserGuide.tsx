import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Shield, 
  CreditCard, 
  Briefcase, 
  ShoppingBag, 
  Users, 
  RefreshCw,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Percent,
  Building2,
  FileText,
  Zap
} from "lucide-react";
import { CommissionSummaryTable } from "./CommissionSummaryTable";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function WorkUserGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatingHowItWorks title={"Work User Guide - How it works"} steps={[{ title: 'Open', desc: 'Access the Work User Guide section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Work User Guide.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 backdrop-blur-xl bg-background/30 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
        >
          <BookOpen className="h-4 w-4" />
          User Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 backdrop-blur-xl bg-background/95 border-primary/20">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Unique Work: The Future of Economy
              </DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Your complete guide to earning, trading, and growing on Unique
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh] px-6 pb-6">
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="commissions">Commissions</TabsTrigger>
              <TabsTrigger value="trust">Trust Protocol</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="backdrop-blur-sm bg-card/50 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Welcome to Unique Work
                  </CardTitle>
                  <CardDescription>
                    A revolutionary ecosystem for the modern economy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Unique Work is a comprehensive platform that connects talent with opportunity, 
                    enables skill-based trading, and facilitates secure transactions for goods and services.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <ServiceQuickCard 
                      icon={Briefcase} 
                      title="Job Portal" 
                      description="Find your dream job"
                      color="blue"
                    />
                    <ServiceQuickCard 
                      icon={Users} 
                      title="Marketplace" 
                      description="Offer your skills"
                      color="green"
                    />
                    <ServiceQuickCard 
                      icon={RefreshCw} 
                      title="Skill Swap" 
                      description="Trade skills freely"
                      color="purple"
                    />
                    <ServiceQuickCard 
                      icon={ShoppingBag} 
                      title="Bazaar" 
                      description="Buy & sell items"
                      color="orange"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Getting Started</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Complete your profile with skills and experience
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Verify your identity for enhanced trust
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Explore services that match your needs
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Start earning or find what you need
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              {/* Job Portal */}
              <ServiceDetailCard
                icon={Briefcase}
                title="Job Portal"
                subtitle="Connect talent with opportunity"
                color="blue"
                features={[
                  { title: "For Job Seekers", items: ["AI-powered job matching", "One-click apply with resume upload", "Application tracking dashboard", "AI Job Assistant for optimization"] },
                  { title: "For Employers", items: ["Verified company registration", "Flexible posting packages (€29/€49/€79)", "Candidate management tools", "Analytics and insights"] }
                ]}
              />

              {/* Skills Marketplace */}
              <ServiceDetailCard
                icon={Users}
                title="Skills Marketplace"
                subtitle="Monetize your expertise"
                color="green"
                features={[
                  { title: "For Service Providers", items: ["Create detailed skill offerings", "Set your own rates", "Receive 85% of each transaction", "Build your reputation with reviews"] },
                  { title: "For Clients", items: ["Browse verified professionals", "Secure escrow payments", "Track project progress", "Rate and review completed work"] }
                ]}
              />

              {/* Skill Swap */}
              <ServiceDetailCard
                icon={RefreshCw}
                title="Skill Swap"
                subtitle="Trade skills, not money"
                color="purple"
                features={[
                  { title: "How It Works", items: ["List skills you can offer", "Browse skills you need", "Match with compatible users", "Exchange skills 1:1 - no fees!"] },
                  { title: "Premium Features", items: ["Unlimited swap initiations", "Priority matching algorithm", "Advanced skill analytics", "Premium badge display"] }
                ]}
              />

              {/* Online Bazaar */}
              <ServiceDetailCard
                icon={ShoppingBag}
                title="Online Bazaar"
                subtitle="Buy and sell physical goods"
                color="orange"
                features={[
                  { title: "For Sellers", items: ["List items with photos", "Set competitive prices", "Receive 90% of sale price", "Track order fulfillment"] },
                  { title: "For Buyers", items: ["Browse local and shipped items", "Secure escrow protection", "Confirm delivery to release funds", "Dispute resolution support"] }
                ]}
              />
            </TabsContent>

            <TabsContent value="commissions" className="space-y-6">
              <Card className="backdrop-blur-sm bg-card/50 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-primary" />
                    Real-Time Commission Rates
                  </CardTitle>
                  <CardDescription>
                    Transparent fees pulled directly from our system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CommissionSummaryTable />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-card/50 border-primary/10">
                <CardHeader>
                  <CardTitle>How Commissions Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Bazaar (10% Commission)</h4>
                        <p className="text-sm text-muted-foreground">
                          When you sell an item for €100, you receive €90. The 10% fee covers payment processing, 
                          escrow protection, and platform maintenance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Marketplace (15% Commission)</h4>
                        <p className="text-sm text-muted-foreground">
                          For a €100 service, you receive €85. The slightly higher fee reflects the additional 
                          project management tools, dispute resolution, and quality assurance provided.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <RefreshCw className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Skill Swap (No Commission)</h4>
                        <p className="text-sm text-muted-foreground">
                          Skill exchanges are completely free! This community-driven feature promotes learning 
                          and collaboration without any monetary barriers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Job Portal (Package-Based)</h4>
                        <p className="text-sm text-muted-foreground">
                          Employers pay one-time packages (€29/€49/€79) to post jobs. Job seekers apply 
                          for free with no commission on employment.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trust" className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Unique Trust Protocol</h3>
                <p className="text-muted-foreground">
                  Your security is our top priority. Every transaction is protected.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Escrow System */}
                <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                  <CardHeader>
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
                      <Lock className="h-7 w-7 text-blue-500" />
                    </div>
                    <CardTitle>Escrow System</CardTitle>
                    <CardDescription>
                      Funds held securely until work is completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <EscrowStep 
                        step={1} 
                        title="Payment Initiated" 
                        description="Buyer sends payment, funds are held in escrow"
                      />
                      <EscrowStep 
                        step={2} 
                        title="Work/Delivery" 
                        description="Seller completes work or ships item"
                      />
                      <EscrowStep 
                        step={3} 
                        title="Confirmation" 
                        description="Buyer confirms satisfaction with delivery"
                      />
                      <EscrowStep 
                        step={4} 
                        title="Release" 
                        description="Funds released to seller automatically"
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                      <Badge variant="outline" className="gap-1 text-blue-500 border-blue-500/30">
                        <Shield className="h-3 w-3" />
                        Auto-release after 14 days if no dispute
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Stripe Security */}
                <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                  <CardHeader>
                    <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                      <CreditCard className="h-7 w-7 text-purple-500" />
                    </div>
                    <CardTitle>Stripe Security</CardTitle>
                    <CardDescription>
                      Industry-leading payment encryption
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      <SecurityFeature 
                        title="PCI DSS Level 1" 
                        description="Highest level of payment security certification"
                      />
                      <SecurityFeature 
                        title="256-bit Encryption" 
                        description="Bank-grade encryption for all transactions"
                      />
                      <SecurityFeature 
                        title="Fraud Detection" 
                        description="AI-powered real-time fraud prevention"
                      />
                      <SecurityFeature 
                        title="Secure Payouts" 
                        description="Direct transfers to your verified bank account"
                      />
                    </ul>

                    <div className="pt-4 border-t border-border/50">
                      <Badge variant="outline" className="gap-1 text-purple-500 border-purple-500/30">
                        <Shield className="h-3 w-3" />
                        SOC 2 Type II Compliant
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Trust Features */}
              <Card className="backdrop-blur-sm bg-card/50 border-primary/10">
                <CardHeader>
                  <CardTitle>Additional Trust Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <TrustFeature 
                      icon={Building2} 
                      title="Verified Companies" 
                      description="All employers are verified before posting"
                    />
                    <TrustFeature 
                      icon={FileText} 
                      title="Dispute Resolution" 
                      description="Fair mediation for any conflicts"
                    />
                    <TrustFeature 
                      icon={CheckCircle2} 
                      title="Review System" 
                      description="Transparent ratings and reviews"
                    />
                    <TrustFeature 
                      icon={Shield} 
                      title="Data Protection" 
                      description="GDPR compliant data handling"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  );
}

// Helper Components
function ServiceQuickCard({ 
  icon: Icon, 
  title, 
  description, 
  color 
}: { 
  icon: typeof Briefcase; 
  title: string; 
  description: string; 
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-500",
    green: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-500",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-500",
    orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-500",
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border text-center`}>
      <div className="h-10 w-10 rounded-lg bg-current/20 flex items-center justify-center mx-auto mb-2">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ServiceDetailCard({ 
  icon: Icon, 
  title, 
  subtitle, 
  color, 
  features 
}: { 
  icon: typeof Briefcase; 
  title: string; 
  subtitle: string; 
  color: "blue" | "green" | "purple" | "orange";
  features: { title: string; items: string[] }[];
}) {
  const colors = {
    blue: "from-blue-500/5 to-blue-500/10 border-blue-500/20",
    green: "from-green-500/5 to-green-500/10 border-green-500/20",
    purple: "from-purple-500/5 to-purple-500/10 border-purple-500/20",
    orange: "from-orange-500/5 to-orange-500/10 border-orange-500/20",
  };

  const iconColors = {
    blue: "bg-blue-500/20 text-blue-500",
    green: "bg-green-500/20 text-green-500",
    purple: "bg-purple-500/20 text-purple-500",
    orange: "bg-orange-500/20 text-orange-500",
  };

  return (
    <Card className={`backdrop-blur-sm bg-gradient-to-br ${colors[color]} border`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${iconColors[color]} flex items-center justify-center`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <div key={i} className="space-y-2">
              <h4 className="font-medium text-sm">{feature.title}</h4>
              <ul className="space-y-1.5">
                {feature.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EscrowStep({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {step}
      </div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SecurityFeature({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
      <div>
        <span className="font-medium text-sm">{title}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}

function TrustFeature({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: typeof Shield; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-muted/50">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
