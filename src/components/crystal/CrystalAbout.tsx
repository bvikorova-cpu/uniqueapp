import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Heart, CheckCircle2, Star, DollarSign, Shield, Sparkles, Globe, Brain, Eye } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const CrystalAbout = () => {
  return (
    <>
      <FloatingHowItWorks
        title='Crystal About'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Crystal About panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6 mb-8"
    >
      {/* What is Crystal Energy Network */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-all">
        <CardHeader>
          <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            What is Crystal & Energy Network?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Crystal & Energy Network is an innovative AI-powered platform that combines ancient crystal healing wisdom
            with modern artificial intelligence technology. Our system analyzes your personal energy patterns through
            photos and provides tailored crystal recommendations to help balance and enhance your wellbeing. Whether
            you're a seasoned crystal healer or just beginning your journey, our 22 tools offer everything you need.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Gem className="h-3.5 w-3.5 text-white" />
                </div>
                How to Use This Service
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                <li><strong>Choose Your Service:</strong> AI Energy Reading (€3), Healing Session (€20), Chakra Balancing (€30), or Encyclopedia (€7/mo)</li>
                <li><strong>Upload Your Photo:</strong> Share a clear photo of yourself or your crystals for AI analysis</li>
                <li><strong>Receive AI Analysis:</strong> Advanced AI examines your energy levels, aura patterns, and chakra alignment</li>
                <li><strong>Get Recommendations:</strong> Receive crystal suggestions tailored to your energy needs</li>
                <li><strong>Shop Crystals:</strong> Browse our marketplace for verified crystals with AI certificates</li>
              </ol>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
                  <Heart className="h-3.5 w-3.5 text-white" />
                </div>
                Key Benefits
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> AI-powered energy detection from photos</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Personalized crystal recommendations</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> 7-day chakra balancing programs</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> 500+ crystal encyclopedia entries</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Verified crystal marketplace</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Daily AI coaching & progress tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Overview */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-all">
        <CardHeader>
          <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Service Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: Sparkles, title: "AI Energy Reading", price: "€3", desc: "One-time photo-based energy analysis", gradient: "from-violet-500 to-purple-400" },
              { icon: Heart, title: "Healing Session", price: "€20", desc: "1-hour guided healing with AI assessment", gradient: "from-pink-500 to-rose-400" },
              { icon: Gem, title: "Chakra Program", price: "€30", desc: "7-day complete chakra alignment", gradient: "from-indigo-500 to-violet-400", popular: true },
              { icon: Brain, title: "Encyclopedia", price: "€7/mo", desc: "500+ crystal profiles & daily insights", gradient: "from-cyan-500 to-blue-400" },
            ].map((item) => (
              <div key={item.title} className={`p-4 rounded-xl bg-muted/30 border ${item.popular ? "border-primary/40 ring-1 ring-primary/20" : "border-border/30"} space-y-2 hover:border-primary/20 transition-all relative`}>
                {item.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                    Popular
                  </span>
                )}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <div className="text-lg font-black text-primary">{item.price}</div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why Choose */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-all">
        <CardHeader>
          <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Why Choose Crystal & Energy Network?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Shield, label: "Safe & Natural", desc: "Holistic healing approach", gradient: "from-emerald-500 to-green-400" },
              { icon: Eye, label: "AI Powered", desc: "Advanced energy detection", gradient: "from-violet-500 to-purple-400" },
              { icon: Globe, label: "16 Tools", desc: "Complete healing suite", gradient: "from-blue-500 to-cyan-400" },
              { icon: Star, label: "Verified Crystals", desc: "AI authenticity certs", gradient: "from-yellow-500 to-amber-400" },
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

      <p className="text-xs text-center text-muted-foreground italic px-4">
        Disclaimer: Crystal healing is used for relaxation and wellness purposes. This service does not replace professional medical advice, diagnosis, or treatment.
      </p>
    </motion.div>
    </>
  );
};
