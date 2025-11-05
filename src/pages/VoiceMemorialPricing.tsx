import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Mic, Volume2, MessageCircle, Library, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const VoiceMemorialPricing = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckout = async (priceId: string, type: 'subscription' | 'one-time') => {
    try {
      setLoading(priceId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      const functionName = type === 'one-time' 
        ? 'create-voice-clone-checkout' 
        : 'create-voice-subscription-checkout';
      
      const body = type === 'one-time' ? {} : { priceId };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Checkout Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Link to="/voice-memorial">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Voice Memorial
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Voice Memorial Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs to preserve and interact with cherished voices
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Voice Clone Setup */}
          <Card className="relative border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Voice Clone Setup</CardTitle>
              <CardDescription>One-time setup fee</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">€149</span>
                <span className="text-muted-foreground ml-2">once</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Create your first AI voice clone</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Professional ElevenLabs technology</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">High-quality voice replication</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Lifetime access to created clone</span>
                </li>
              </ul>
              <Button
                onClick={() => handleCheckout('price_1SQD3DGaXSfGtYFtg52PlpKe', 'one-time')}
                className="w-full"
                disabled={loading !== null}
              >
                {loading === 'price_1SQD3DGaXSfGtYFtg52PlpKe' ? 'Processing...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          {/* Voice Library */}
          <Card className="relative border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Library className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Voice Library</CardTitle>
              <CardDescription>Store multiple voices</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">€9.99</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Store up to 5 voice clones</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited access to stored voices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Secure cloud storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Easy voice management</span>
                </li>
              </ul>
              <Button
                onClick={() => handleCheckout('price_1SQD3qGaXSfGtYFtLEOizLmJ', 'subscription')}
                variant="outline"
                className="w-full"
                disabled={loading !== null}
              >
                {loading === 'price_1SQD3qGaXSfGtYFtLEOizLmJ' ? 'Processing...' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>

          {/* Text-to-Speech Unlimited */}
          <Card className="relative border-2 border-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full">
                POPULAR
              </span>
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>TTS Unlimited</CardTitle>
              <CardDescription>Unlimited generations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">€19.99</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited text-to-speech</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">No word count limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">HD audio quality</span>
                </li>
              </ul>
              <Button
                onClick={() => handleCheckout('price_1SQD3XGaXSfGtYFtmcOEBBfI', 'subscription')}
                className="w-full"
                disabled={loading !== null}
              >
                {loading === 'price_1SQD3XGaXSfGtYFtmcOEBBfI' ? 'Processing...' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>

          {/* AI Conversation Mode */}
          <Card className="relative border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI Conversation</CardTitle>
              <CardDescription>Premium feature</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">€29.99</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Real-time AI conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Chat with AI avatar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Natural voice responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Memory & context aware</span>
                </li>
              </ul>
              <Button
                onClick={() => handleCheckout('price_1SQD46GaXSfGtYFtqUR0AHDN', 'subscription')}
                variant="outline"
                className="w-full"
                disabled={loading !== null}
              >
                {loading === 'price_1SQD46GaXSfGtYFtqUR0AHDN' ? 'Processing...' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pay-per-use option */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Pay-Per-Use Option</CardTitle>
            <CardDescription>
              Not ready for a subscription? Use text-to-speech on demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">€2.99 per 100 words</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Perfect for occasional use. Credits never expire.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/voice-memorial">Try Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include secure storage and premium voice quality</p>
          <p className="mt-2">Cancel anytime. No hidden fees.</p>
        </div>
      </main>
    </div>
  );
};

export default VoiceMemorialPricing;
