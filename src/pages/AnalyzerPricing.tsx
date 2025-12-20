import { Check, Sparkles, Zap, Eye, ImageIcon, Languages, FileText, Clock, MessageSquare, Layers, BarChart3 } from "lucide-react";
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
];

const CREDIT_PACKS = [
  { credits: 10, price: '€6', perAnalysis: '€0.60' },
  { credits: 30, price: '€15', perAnalysis: '€0.50', popular: true },
  { credits: 60, price: '€25', perAnalysis: '€0.42' },
];

export default function AnalyzerPricing() {
  const navigate = useNavigate();
  const { credits, purchaseCredits } = useAnalyzerCredits();

  const handlePurchaseCredits = async (amount: number) => {
    const url = await purchaseCredits(amount);
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="mb-4">Pricing Plans</Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Universal Vision Analyzer
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered image analysis for everything around you. Identify plants, animals, objects, art, food, and more with detailed insights and actionable information.
          </p>
        </div>

        {/* How It Works Section */}
        <div className="bg-card/50 border rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">1. Upload Image</h3>
              <p className="text-sm text-muted-foreground">
                Take a photo or upload any image you want to analyze. Our AI accepts all common formats.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">2. Select Category</h3>
              <p className="text-sm text-muted-foreground">
                Choose from Nature, Food, Art, Fashion, Technology, Real Estate, and more specialized categories.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">3. AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our advanced AI model identifies objects, extracts text, provides details, and generates actionable insights.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">4. Get Results</h3>
              <p className="text-sm text-muted-foreground">
                Receive detailed reports with identification, values, shopping links, care tips, and export options.
              </p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-card/50 border rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">What You Can Analyze</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🌿", title: "Nature & Wildlife", desc: "Plants, animals, insects, fungi identification" },
              { icon: "🍕", title: "Food & Recipes", desc: "Identify dishes, get recipes, nutrition info" },
              { icon: "🎨", title: "Art & Collectibles", desc: "Artwork analysis, authenticity, value estimation" },
              { icon: "👗", title: "Fashion & Style", desc: "Clothing identification, style matching, shopping" },
              { icon: "🏠", title: "Real Estate", desc: "Property analysis, room assessment, design tips" },
              { icon: "💻", title: "Technology", desc: "Gadget identification, specs, troubleshooting" },
              { icon: "📄", title: "Documents", desc: "Text extraction, translation, summarization" },
              { icon: "🔍", title: "Mystery Objects", desc: "Identify anything unknown you encounter" },
            ].map((item, index) => (
              <Card key={index} className="p-4 text-center hover:border-primary/50 transition-all">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Current Credits Status - Moved lower for mobile */}
        {credits && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Eye className="h-10 w-10 text-primary" />
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground">Your Current Balance</p>
                  <p className="text-3xl font-bold">{credits.credits_remaining} Credits</p>
                  <p className="text-xs text-muted-foreground capitalize">Tier: {credits.tier}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {CREDIT_PACKS.map((pack) => (
                  <Button
                    key={pack.credits}
                    variant={pack.popular ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePurchaseCredits(pack.credits)}
                  >
                    {pack.credits} Credits - {pack.price}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Monthly Subscriptions</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe for the best value. Monthly credits reset each billing period. Perfect for regular users who need consistent access to AI-powered image analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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

                    <ul className="space-y-3 min-h-[280px]">
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
                      Subscribe Now
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
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Buy credits whenever you need them. Credits never expire and can be used for any type of analysis. 
            Each analysis consumes 1 credit. Perfect for occasional users or to supplement your subscription.
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
                    variant={pack.popular ? 'default' : 'outline'}
                    onClick={() => handlePurchaseCredits(pack.credits)}
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
                  <th className="text-center py-4 px-4">Basic</th>
                  <th className="text-center py-4 px-4 bg-primary/5">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4">Analyses per month</td>
                  <td className="text-center py-4 px-4">10</td>
                  <td className="text-center py-4 px-4 bg-primary/5">50</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">AI Model</td>
                  <td className="text-center py-4 px-4">Standard</td>
                  <td className="text-center py-4 px-4 bg-primary/5">Advanced</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Text Extraction</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Translation</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">PDF Export</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">AI Chat Follow-up</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Batch Upload</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Compare Mode</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">API Access</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">History</td>
                  <td className="text-center py-4 px-4">30 days</td>
                  <td className="text-center py-4 px-4 bg-primary/5">1 year</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Priority Processing</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-primary" /></td>
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
              <h3 className="font-semibold mb-2">How does one credit work?</h3>
              <p className="text-muted-foreground text-sm">
                Each image analysis costs 1 credit, regardless of the category or complexity. Upload your image, select a category, and receive a comprehensive analysis with identification, details, and actionable insights.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I switch plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and are pro-rated for the current billing period.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What happens to unused credits?</h3>
              <p className="text-muted-foreground text-sm">
                Monthly subscription credits reset each billing period. However, credits purchased as credit packs never expire and remain in your account indefinitely.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we offer a 7-day money-back guarantee on all subscriptions. Credit pack purchases are non-refundable once used.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and SEPA Direct Debit for EU customers.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">How accurate is the AI analysis?</h3>
              <p className="text-muted-foreground text-sm">
                Our AI uses state-of-the-art vision models with 95%+ accuracy for common objects, plants, and animals. Specialized categories like antiques and art provide detailed context but should be verified by professionals for high-value items.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-12">
          <h2 className="text-3xl font-bold">Ready to start analyzing?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Purchase credits and unlock the power of AI-powered image analysis. Identify anything, anywhere, anytime.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => handlePurchaseCredits(30)}>
              Get 30 Credits - €15
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/analyzer')}>
              Try Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}