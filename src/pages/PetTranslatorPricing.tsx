import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, PawPrint, Mic, Brain, Heart, Stethoscope, GraduationCap, Apple } from 'lucide-react';
import { usePetSubscription } from '@/hooks/usePetSubscription';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroVideo from '@/assets/pet-translator-hero.mp4.asset.json';

const PetTranslatorPricing = () => {
  const { subscription, loading, createCheckout } = usePetSubscription();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Pet Parent',
      price: '€4.99',
      period: '/month',
      priceId: 'price_1TgR40GaXSfGtYFt82FwbNXt',
      productId: 'prod_Ufmdb3lcGFyQ58',
      icon: PawPrint,
      gradient: 'from-purple-500/20 to-violet-500/10',
      features: ['5 translations/month', 'Emotion tracker', '1 pet profile', 'Basic behavior insights', 'Email support'],
    },
    {
      name: 'Multi-Pet',
      price: '€8.99',
      period: '/month',
      priceId: 'price_1SQDNuGaXSfGtYFt9o91SK2J',
      productId: 'prod_TMxI5ZbjB28R6Z',
      popular: true,
      icon: Heart,
      gradient: 'from-fuchsia-500/20 to-pink-500/10',
      features: ['Everything in Pet Parent', 'Up to 5 pet profiles', 'AI Health Scanner', 'AI Training Coach', 'Mood history tracking', 'Priority support'],
    },
    {
      name: 'Pet Psychologist',
      price: '€24.99',
      period: '/month',
      priceId: 'price_1SQDOFGaXSfGtYFtDQsh6HlL',
      productId: 'prod_TMxIMYFcwmvzvV',
      icon: Crown,
      gradient: 'from-amber-500/20 to-yellow-500/10',
      features: ['Everything in Multi-Pet', 'Unlimited pet profiles', 'All 6 AI tools', 'Weekly AI health reports', 'Behavior pattern analysis', 'Leaderboards & Challenges', '24/7 priority support'],
    },
  ];

  const toolPreviews = [
    { icon: Mic, title: "AI Translator", desc: "Decode your pet's sounds", color: "text-purple-400" },
    { icon: Heart, title: "Emotion Detector", desc: "Analyze mood & stress", color: "text-pink-400" },
    { icon: Stethoscope, title: "Health Scanner", desc: "Early health detection", color: "text-fuchsia-400" },
    { icon: GraduationCap, title: "Training Coach", desc: "Custom training plans", color: "text-violet-400" },
    { icon: Apple, title: "Diet Planner", desc: "Optimal nutrition plans", color: "text-emerald-400" },
    { icon: Brain, title: "Behavior Analyzer", desc: "Deep pattern analysis", color: "text-blue-400" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Hero */}
      <div className="relative overflow-hidden min-h-[260px] sm:min-h-[320px]">
        <div className="absolute inset-0 z-0">
          <video src={heroVideo.url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ filter: "brightness(0.7) saturate(1.2)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-[#1a0a2e]/70 to-[#1a0a2e]/40" />
        </div>
        <div className="relative z-10 container mx-auto px-4 pt-24 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-purple-500/90 text-white font-bold border-purple-400/50 mb-4">
              <Sparkles className="h-3 w-3 mr-1" /> Premium AI Tools
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg mb-3">
              🐾 Choose Your <span className="text-purple-400">Plan</span>
            </h1>
            <p className="text-white/80 text-sm sm:text-lg max-w-xl mx-auto">
              Unlock the full power of AI pet translation and care tools
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tool Previews */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {toolPreviews.map((t, i) => (
            <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-3 text-center bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border-purple-500/10">
                <t.icon className={`h-6 w-6 mx-auto mb-1 ${t.color}`} />
                <p className="text-xs font-bold">{t.title}</p>
                <p className="text-[9px] text-muted-foreground">{t.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {plans.map((plan, i) => {
            const isActive = subscription.product_id === plan.productId;
            return (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`p-6 sm:p-8 relative bg-gradient-to-br ${plan.gradient} ${plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]' : 'border-border/30'} ${isActive ? 'border-green-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                      Most Popular
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                      Your Plan
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
                      <plan.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{plan.price}</span>
                        <span className="text-xs text-muted-foreground">{plan.period}</span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700' : ''}`}
                    size="lg"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => createCheckout(plan.priceId)}
                    disabled={isActive}
                  >
                    {isActive ? 'Current Plan' : 'Get Started'}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* One-time options */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <Card className="p-5 bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-purple-500/20 text-center">
            <h3 className="text-lg font-bold mb-1">🎤 Single Translation</h3>
            <p className="text-xs text-muted-foreground mb-2">Try once without subscription</p>
            <p className="text-2xl font-black mb-3">€2</p>
            <Button variant="outline" className="w-full" onClick={() => createCheckout('price_1SQDRRGaXSfGtYFts87Q1N9y')}>
              Get 1 Translation
            </Button>
          </Card>
          <Card className="p-5 bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20 text-center">
            <h3 className="text-lg font-bold mb-1">🎭 Premium Voice</h3>
            <p className="text-xs text-muted-foreground mb-2">Celebrity voice for your pet!</p>
            <p className="text-2xl font-black mb-3">€14.99</p>
            <Button variant="secondary" className="w-full" onClick={() => createCheckout('price_1TWBEFGaXSfGtYFtKH2ut18T')}>
              Get Premium Voice
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PetTranslatorPricing;
