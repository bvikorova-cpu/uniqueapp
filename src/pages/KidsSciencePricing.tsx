import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScienceSubscription } from "@/hooks/useScienceSubscription";
import { useNavigate } from "react-router-dom";

const KidsSciencePricing = () => {
  const navigate = useNavigate();
  const { subscription, subscribe } = useScienceSubscription();

  const features = {
    premium: [
      "Unlimited experiment analyses",
      "Priority AI analysis",
      "Detailed scientific explanations",
      "Extra fun facts & learning resources",
      "Ad-free experience",
      "Save experiment history",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground text-lg">
              Start learning science with AI-powered experiment analysis
            </p>
          </div>

          <div className="flex justify-center">
            {/* Premium Plan */}
            <Card className="border-2 border-primary relative shadow-lg max-w-md w-full">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  Premium Plan
                </CardTitle>
                <CardDescription className="text-lg">
                  Unlimited science learning for young explorers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-black mb-2">
                    €5
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Cancel anytime</p>
                </div>

                <ul className="space-y-3">
                  {features.premium.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  onClick={subscribe}
                  disabled={subscription.subscribed}
                >
                  {subscription.subscribed ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What experiments can I analyze?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You can analyze any science experiment across Physics, Chemistry, Biology, Earth Science, and Astronomy. Simply describe what you did and what you observed!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is it safe for kids?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Yes! Our AI provides kid-friendly explanations perfect for ages 6-12. Remember: real experiments should always be done under adult supervision.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! You can cancel your premium subscription at any time. No questions asked, no cancellation fees.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards through our secure Stripe payment processor. Your payment information is encrypted and secure.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KidsSciencePricing;
