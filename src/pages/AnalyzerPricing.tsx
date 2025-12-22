import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAnalyzerCredits } from "@/hooks/useAnalyzerCredits";
import { toast } from "sonner";

const PRICING_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '€4.99',
    period: '/month',
    icon: Sparkles,
    color: 'text-blue-500',
    popular: false,
    features: [
      '10 analyses per month',
      'Detailed analysis',
      'Unlimited text extraction',
      'Translation support',
      'Shopping links',
      '30-day history',
      'PDF export',
      'No watermark',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€9.99',
    period: '/month',
    icon: Zap,
    color: 'text-primary',
    popular: true,
    features: [
      '50 analyses per month',
      'Everything in Basic, plus:',
      'AI chat follow-up',
      'Batch upload (multi-image)',
      'API access',
      'Priority processing',
      'Compare mode',
      'Custom reports',
      '1-year history',
      'Early access to new features',
    ],
  },
  {
    id: 'expert',
    name: 'Expert',
    price: '€19.99',
    period: '/month',
    icon: Crown,
    color: 'text-yellow-500',
    popular: false,
    features: [
      'Unlimited analyses',
      'Everything in Pro, plus:',
      'Expert AI model (highest accuracy)',
      'White-label reports',
      'Team collaboration (5 users)',
      'Custom AI training',
      'Priority support',
      'Commercial use license',
      'Higher API limits',
    ],
  },
];

const CREDIT_PACKS = [
  { credits: 20, price: '€8', perAnalysis: '€0.40' },
  { credits: 50, price: '€18', perAnalysis: '€0.36', popular: true },
  { credits: 100, price: '€30', perAnalysis: '€0.30' },
];

export default function AnalyzerPricing() {
  const navigate = useNavigate();
  const { credits } = useAnalyzerCredits();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="mb-4">Pricing Plans</Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI-powered image analysis
          </p>
          {credits && (
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <span className="text-sm text-muted-foreground">Current tier:</span>
              <Badge className="capitalize">{credits.tier}</Badge>
              <span className="text-sm text-muted-foreground">
                • {credits.credits_remaining} credits remaining
              </span>
            </div>
          )}
        </div>

        {/* Monthly Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Monthly Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.id}
                  className={`relative p-6 ${
                    tier.popular
                      ? 'border-primary shadow-lg scale-105'
                      : 'hover:border-primary/50'
                  } transition-all`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Icon className={`w-10 h-10 ${tier.color}`} />
                      <h3 className="text-2xl font-bold">{tier.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground">{tier.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 min-h-[300px]">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={tier.popular ? 'default' : 'outline'}
                      onClick={() => {
                        toast.info(`Upgrade to ${tier.name} coming soon! Payment integration in progress.`);
                      }}
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Credit Packs */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Pay-Per-Use Credit Packs</h2>
          <p className="text-center text-muted-foreground mb-8">
            Perfect for occasional use or to supplement your subscription
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CREDIT_PACKS.map((pack) => (
              <Card
                key={pack.credits}
                className={`p-6 text-center ${
                  pack.popular
                    ? 'border-primary shadow-lg'
                    : 'hover:border-primary/50'
                } transition-all relative`}
              >
                {pack.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Best Value
                  </Badge>
                )}
                <div className="space-y-4">
                  <div className="text-5xl font-bold text-primary">
                    {pack.credits}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Credits
                  </div>
                  <div className="text-3xl font-bold">{pack.price}</div>
                  <div className="text-sm text-muted-foreground">
                    {pack.perAnalysis} per analysis
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => toast.info("Credit purchase coming soon! Payment integration in progress.")}
                  >
                    Buy Credits
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Feature Comparison</h2>
          <Card className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">Free</th>
                  <th className="text-center py-4 px-4">Basic</th>
                  <th className="text-center py-4 px-4 bg-primary/5">Pro</th>
                  <th className="text-center py-4 px-4">Expert</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4">Analyses per month</td>
                  <td className="text-center py-4 px-4">1/day</td>
                  <td className="text-center py-4 px-4">10</td>
                  <td className="text-center py-4 px-4 bg-primary/5">50</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">AI Model</td>
                  <td className="text-center py-4 px-4">Basic</td>
                  <td className="text-center py-4 px-4">Standard</td>
                  <td className="text-center py-4 px-4 bg-primary/5">Standard</td>
                  <td className="text-center py-4 px-4">Expert</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">AI Chat Follow-up</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Batch Upload</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Compare Mode</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">API Access</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5">Basic</td>
                  <td className="text-center py-4 px-4">Advanced</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">History</td>
                  <td className="text-center py-4 px-4">7 days</td>
                  <td className="text-center py-4 px-4">30 days</td>
                  <td className="text-center py-4 px-4 bg-primary/5">1 year</td>
                  <td className="text-center py-4 px-4">Forever</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Priority Support</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5">-</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Commercial Use</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5">-</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I switch plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What happens to unused credits?</h3>
              <p className="text-muted-foreground text-sm">
                Monthly subscription credits reset each month. Credit pack purchases never expire.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we offer a 7-day money-back guarantee on all subscriptions.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-12">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Start with our free plan and upgrade anytime.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/analyzer')}>
              Try Free Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
