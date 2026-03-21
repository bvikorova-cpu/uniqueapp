import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { usePetSubscription } from '@/hooks/usePetSubscription';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PetTranslatorPricing = () => {
  const { subscription, loading, createCheckout } = usePetSubscription();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Pet Parent',
      price: '€4.99',
      period: '/month',
      priceId: 'price_1SQDNZ0QTWhd4oRpHRPIDTTW',
      productId: 'prod_TMxIAIiKlSWTef',
      features: [
        '5 translations per month',
        'Emotion tracker',
        '1 pet profile',
        'Basic behavior insights',
        'Email support'
      ]
    },
    {
      name: 'Multi-Pet',
      price: '€8.99',
      period: '/month',
      priceId: 'price_1SQDNuGaXSfGtYFt9o91SK2J',
      productId: 'prod_TMxI5ZbjB28R6Z',
      popular: true,
      features: [
        'Everything in Pet Parent',
        'Up to 5 pet profiles',
        'Advanced behavior insights',
        'Mood history tracking',
        'Priority support'
      ]
    },
    {
      name: 'Pet Psychologist',
      price: '€24.99',
      period: '/month',
      priceId: 'price_1SQDOFGaXSfGtYFtDQsh6HlL',
      productId: 'prod_TMxIMYFcwmvzvV',
      features: [
        'Everything in Multi-Pet',
        'Unlimited pet profiles',
        'Weekly AI health reports',
        'Veterinary alerts',
        'Behavior pattern analysis',
        '24/7 priority support'
      ]
    }
  ];

  const handleSubscribe = async (priceId: string) => {
    try {
      await createCheckout(priceId);
    } catch (error) {
      console.error('Failed to create checkout:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Unlock the power of AI pet translation
        </p>
        
        <div className="max-w-3xl mx-auto text-left bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">How It Works</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">🎤 Record Your Pet:</strong> Simply record your pet's sounds - barks, meows, chirps, or any vocalization. Our AI works with dogs, cats, birds, and other pets.</p>
            <p><strong className="text-foreground">🧠 AI Analysis:</strong> Our advanced AI analyzes the audio patterns, frequency, and tone to understand your pet's emotional state and intent.</p>
            <p><strong className="text-foreground">💬 Get Translation:</strong> Receive a detailed translation including what your pet is trying to communicate, their emotional state (happy, anxious, hungry, etc.), and a confidence score.</p>
            <p><strong className="text-foreground">📊 Track Patterns:</strong> With a subscription, track your pet's mood over time and get insights into their behavior patterns.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {plans.map((plan) => {
          const isActive = subscription.product_id === plan.productId;
          
          return (
            <Card
              key={plan.name}
              className={`p-8 relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${isActive ? 'border-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              {isActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Your Plan
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={isActive}
              >
                {isActive ? 'Current Plan' : 'Get Started'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">🎤 Single Translation</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Try it once without subscription
            </p>
            <p className="text-2xl font-black mb-4">€2 <span className="text-sm font-normal text-muted-foreground">one-time</span></p>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => handleSubscribe('price_1SQDRRGaXSfGtYFts87Q1N9y')}
            >
              Get 1 Translation
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">🎭 Premium Voice</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Make your pet sound like a celebrity!
            </p>
            <p className="text-2xl font-black mb-4">€14.99 <span className="text-sm font-normal text-muted-foreground">one-time</span></p>
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={() => handleSubscribe('price_1SQDRRGaXSfGtYFts87Q1N9y')}
            >
              Get Premium Voice
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PetTranslatorPricing;
