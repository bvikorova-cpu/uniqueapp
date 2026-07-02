import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Heart, CheckCircle2, Star, DollarSign, Shield, Zap, Globe } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MembershipAbout = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6 mb-8"
    >
      <FloatingHowItWorks
        title={"Membership About"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {/* What is Membership Community */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-all">
        <CardHeader>
          <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            What is Membership Community?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Membership Community is a premium subscription platform similar to Patreon or OnlyFans (SFW version), 
            designed for creators who want to monetize their content and build dedicated fan communities. 
            Whether you're a fitness coach, educator, artist, musician, or business mentor, our platform 
            provides all the tools you need to earn recurring revenue from your most loyal supporters.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Crown className="h-3.5 w-3.5 text-white" />
                </div>
                For Creators: How to Start Earning
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                <li><strong>Sign in</strong> to your account or create a new one</li>
                <li>Click <strong>"Become a Creator"</strong> to set up your profile</li>
                <li>Create <strong>subscription tiers</strong> with different price points</li>
                <li>Define <strong>exclusive benefits</strong> for each tier</li>
                <li>Start posting <strong>exclusive content</strong> for subscribers</li>
                <li>Engage through <strong>real-time group chats</strong></li>
                <li><strong>Receive monthly payouts</strong> — you keep 90%!</li>
              </ol>
            </div>
            
            <div className="space-y-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
                  <Heart className="h-3.5 w-3.5 text-white" />
                </div>
                For Fans: How to Support Creators
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                <li><strong>Browse creators</strong> in the discovery section</li>
                <li>Click <strong>"View"</strong> to see profile and content preview</li>
                <li>Choose a <strong>subscription tier</strong> that fits your budget</li>
                <li>Complete payment via <strong>secure Stripe checkout</strong></li>
                <li>Access <strong>exclusive content</strong> immediately</li>
                <li>Join <strong>community chats</strong> and interact</li>
                <li>Send <strong>tips and gifts</strong> for extra appreciation</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-all">
        <CardHeader>
          <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Creator Revenue Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: DollarSign, title: "You Keep 90%", desc: "Industry-leading payout rate. For every €100 in subscriptions, you receive €90.", gradient: "from-green-500 to-emerald-400" },
              { icon: CheckCircle2, title: "Monthly Payouts", desc: "Automatic monthly payments via Stripe Connect. No minimum threshold required.", gradient: "from-blue-500 to-cyan-400" },
              { icon: Star, title: "Multiple Revenue Streams", desc: "Earn from subscriptions, tips, gifts, merch, and exclusive paid content.", gradient: "from-yellow-500 to-amber-400" },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-2 hover:border-primary/20 transition-all">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why Choose Us */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-all">
        <CardHeader>
          <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Why Choose Our Platform?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Shield, label: "SFW First", desc: "Safe, community-focused", gradient: "from-emerald-500 to-green-400" },
              { icon: Zap, label: "AI Powered", desc: "Smart content tools", gradient: "from-purple-500 to-violet-400" },
              { icon: Globe, label: "16 Tools", desc: "Everything you need", gradient: "from-blue-500 to-cyan-400" },
              { icon: DollarSign, label: "90% Revenue", desc: "Industry-leading rate", gradient: "from-yellow-500 to-amber-400" },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.02 }}
                className="text-center p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-sm text-foreground">{item.label}</h4>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
