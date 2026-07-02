import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Brain, Mail, Shield, Calendar, Video, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TimeCapsuleHowItWorks = ({ onBack }: { onBack: () => void }) => {
  const steps = [
    { icon: Clock, title: "1. Choose Your Plan", desc: "Select a time capsule plan based on how far into the future you want your message delivered — from 1 year to 20+ years." },
    { icon: Video, title: "2. Create Your Content", desc: "Write a letter, record a video message, attach photos, or combine multiple formats. Express yourself freely." },
    { icon: Mail, title: "3. Set the Recipient", desc: "Send the capsule to yourself or specify a loved one's email. Set specific delivery conditions if needed." },
    { icon: Brain, title: "4. AI-Powered Timing", desc: "Our AI analyzes your content and suggests the perfect delivery moment for maximum emotional impact." },
    { icon: Shield, title: "5. Secure & Forget", desc: "Your capsule is encrypted with military-grade security. On delivery day, the recipient gets an email to unlock it." },
    { icon: Calendar, title: "6. Future Delivery", desc: "Your message arrives exactly when it's meant to, creating a powerful emotional experience across time." },
  ];

  const features = [
    { icon: Video, title: "Multiple Formats", desc: "Text, video, photos, letters, and file attachments" },
    { icon: Shield, title: "Secure Storage", desc: "Military-grade encryption for decades of protection" },
    { icon: Calendar, title: "Flexible Delivery", desc: "From 1 year to 20+ years into the future" },
    { icon: Brain, title: "AI-Powered Timing", desc: "Smart suggestions for perfect delivery moments" },
    { icon: Users, title: "Collaborative Capsules", desc: "Group capsules with multiple contributors" },
    { icon: Sparkles, title: "Community Gallery", desc: "Browse and share public capsule stories" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Time Capsule How It Works - How it works"} steps={[{ title: 'Open', desc: 'Access the Time Capsule How It Works section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Time Capsule How It Works.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-8">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Hub</Button>

      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          How Time Capsule 2.0 Works
        </h2>
        <p className="text-sm text-muted-foreground">
          A revolutionary platform to send messages, videos, and letters to your future self or loved ones with guaranteed delivery.
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/40 hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-black mb-4">Key Features</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
              <Card className="border-border/40 h-full">
                <CardContent className="p-3 text-center">
                  <f.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <h4 className="font-bold text-xs mb-1">{f.title}</h4>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
