import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModuleSubscriptionHero } from "@/components/subscription/ModuleSubscriptionHero";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CAPSULE_PLANS = {
  oneYear: { name: "1 Year Capsule", price: "12 credits", icon: Clock, popular: false, duration: 1,
    description: "Send a message to yourself or loved ones 1 year into the future",
    features: ["Text, video, or letter format", "Automatic delivery in 1 year", "Email notifications", "Secure encrypted storage"] },
  fiveYears: { name: "5 Years Capsule", price: "25 credits", icon: Clock, popular: true, duration: 5,
    description: "Create a time capsule to be opened 5 years from now",
    features: ["All formats supported", "Delivery in 5 years", "Priority storage", "HD video support"] },
  tenYears: { name: "10 Years Capsule", price: "50 credits", icon: Clock, popular: false, duration: 10,
    description: "A decade-long message for major life milestones",
    features: ["All formats + attachments", "Delivery in 10 years", "Premium storage", "HD video support"] },
  twentyYears: { name: "20 Years Capsule", price: "125 credits", icon: Sparkles, popular: false, duration: 20,
    description: "Legacy messages for the next generation",
    features: ["Unlimited formats & files", "Delivery in 20+ years", "Lifetime storage guarantee", "4K video support"] },
};

export default function TimeCapsuleSubscription() {
  const navigate = useNavigate();

  const handleStart = () => navigate("/time-capsule");

  return (
    
    <>
      <FloatingHowItWorks title="Time Capsule Subscription" steps={[{ title: "Pick a duration", desc: "Longer delivery windows cost more credits." }, { title: "Pay with credits", desc: "12 / 25 / 50 / 125 credits per capsule." }, { title: "Create the capsule", desc: "Credits are deducted once when sealed." }, { title: "Refund on failure", desc: "Credits return automatically if creation fails." }]} />
      <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZGIyZWEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC0yYy0xLjEgMC0yIC45LTIgMnYyYzAgMS4xLjkgMiAyIDJoMmMxLjEgMCAyLS45IDItMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-16">
          <ModuleSubscriptionHero
            module="Time Capsule Network"
            icon={Clock}
            badge="Future delivery"
            title="Time Capsule 2.0"
            subtitle="Send messages, videos and letters to your future self. Delivered automatically at the perfect moment."
          />
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Create messages, videos, and letters for your future self or loved ones. Delivered automatically at the perfect moment.
          </p>
        </div>

        {/* Detailed Description Section */}
        <div className="mb-16 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-950/60 to-cyan-950/60 border border-blue-500/30">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">What is Time Capsule 2.0?</h2>
          <p className="text-gray-200 mb-6 leading-relaxed">
            Time Capsule 2.0 is a revolutionary digital platform that allows you to send messages, videos, photos, and letters into the future. Whether you want to leave a heartfelt message for your future self, create a surprise for loved ones on a special anniversary, or preserve memories for the next generation, our platform ensures your messages are delivered exactly when they're meant to be received. With military-grade encryption and guaranteed storage, your precious moments are safe for years to come.
          </p>
          
          <h3 className="text-xl font-bold text-yellow-300 mb-4">How to Use:</h3>
          <ul className="text-gray-200 space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">1.</span>
              <span><strong>Choose Your Capsule:</strong> Pick how far into the future your message is delivered - from 1 year to 20+ years. Each capsule is paid once with AI credits, no subscription.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">2.</span>
              <span><strong>Create Your Content:</strong> Write a letter, record a video message, attach photos, or combine multiple formats. Express yourself in whatever way feels most meaningful.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">3.</span>
              <span><strong>Set the Recipient:</strong> Send the capsule to yourself or specify a loved one's email address. You can also set specific delivery conditions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">4.</span>
              <span><strong>Schedule Delivery:</strong> Choose the exact date or let our AI suggest the perfect moment based on the content of your message.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">5.</span>
              <span><strong>Secure & Forget:</strong> Your capsule is encrypted and stored securely. On the delivery date, the recipient receives an email with a link to unlock and view the time capsule.</span>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-yellow-300 mb-4">Key Features:</h3>
          <ul className="text-gray-200 space-y-2 mb-6">
            <li>• <strong>Multiple Formats:</strong> Send text messages, video recordings, photos, letters, and file attachments</li>
            <li>• <strong>Secure Storage:</strong> Military-grade encryption protects your memories for decades</li>
            <li>• <strong>Flexible Delivery:</strong> Choose delivery dates from 1 year to 20+ years in the future</li>
            <li>• <strong>AI-Powered Timing:</strong> Our AI can suggest the perfect delivery moment based on your content</li>
            <li>• <strong>Email Notifications:</strong> Recipients are notified when their capsule is ready to open</li>
            <li>• <strong>HD Video Support:</strong> Upload high-quality videos up to 5GB depending on your plan</li>
          </ul>

          <p className="text-gray-400 text-sm italic">
            Note: All capsules are stored with guaranteed delivery. We maintain backup systems and legal provisions to ensure your messages reach their destination even decades in the future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {(Object.keys(CAPSULE_PLANS) as Array<keyof typeof CAPSULE_PLANS>).map((planKey) => {
            const plan = CAPSULE_PLANS[planKey];
            const Icon = plan.icon;

            return (
              <Card
                key={planKey}
                className={`relative ${
                  plan.popular ? "border-blue-500 shadow-lg shadow-blue-500/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                    <div className="text-right">
                      <div className="text-3xl font-bold">{plan.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {"per capsule"}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={handleStart}
                  >
                    {"Create Capsule"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-12 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">1</div>
              <h3 className="font-semibold mb-2 text-lg">Write Your Message</h3>
              <p className="text-sm text-muted-foreground">Compose a message for your future self or loved ones</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">2</div>
              <h3 className="font-semibold mb-2 text-lg">AI Predicts Delivery</h3>
              <p className="text-sm text-muted-foreground">Our AI analyzes the perfect moment to deliver your message</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">3</div>
              <h3 className="font-semibold mb-2 text-lg">Message Travels Through Time</h3>
              <p className="text-sm text-muted-foreground">Your message is stored securely until the delivery date</p>
            </div>
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-3">4</div>
              <h3 className="font-semibold mb-2 text-lg">Future Delivery</h3>
              <p className="text-sm text-muted-foreground">Receive your message exactly when you need it most</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
