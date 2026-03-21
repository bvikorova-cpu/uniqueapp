import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mic, StopCircle, Loader2, PawPrint, Heart, AlertCircle, Sparkles, Brain, TrendingUp, Shield, Zap, CheckCircle } from 'lucide-react';
import { usePetSubscription } from '@/hooks/usePetSubscription';
import { Link } from 'react-router-dom';

const PetTranslator = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [translation, setTranslation] = useState<{
    emotion: string;
    message: string;
    confidence: number;
  } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { subscription, loading: subLoading } = usePetSubscription();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await analyzeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];

        const { data, error } = await supabase.functions.invoke('analyze-pet-sound', {
          body: { audio: base64Data }
        });

        if (error) throw error;

        setTranslation(data);
        toast.success('Translation complete!');
      };
    } catch (error: any) {
      console.error('Error analyzing audio:', error);
      toast.error(error.message || 'Failed to analyze pet sound');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (subLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <PawPrint className="w-20 h-20 text-primary animate-pulse" />
              <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Pet Translator
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ever wonder what your dog or cat is really trying to tell you? Our advanced AI analyzes your pet's sounds to reveal their emotions and translate their messages.
          </p>
          
          {!subscription.subscribed && (
            <Link to="/pet-translator-pricing">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Understanding Your Pet Today
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">1. Record Sound</h3>
            <p className="text-muted-foreground">
              Simply press record and let your pet bark, meow, or make any sound naturally
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">2. AI Analysis</h3>
            <p className="text-muted-foreground">
              Our advanced AI analyzes tone, pitch, and patterns to understand the emotion
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Get Translation</h3>
            <p className="text-muted-foreground">
              Receive instant translation and understand your pet's emotional state
            </p>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Pet Owners Love It</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Better Understanding</h3>
                <p className="text-muted-foreground">
                  Know when your pet is happy, anxious, hungry, or needs attention
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Stronger Bond</h3>
                <p className="text-muted-foreground">
                  Improve communication and deepen your relationship with your pet
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Early Warning Signs</h3>
                <p className="text-muted-foreground">
                  Detect stress, discomfort, or health issues before they become serious
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Track Emotions Over Time</h3>
                <p className="text-muted-foreground">
                  Monitor your pet's emotional patterns and behavioral changes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Translator Interface */}
      <div className="container mx-auto px-4 pb-16">
        {!subscription.subscribed ? (
          <Card className="max-w-2xl mx-auto p-12 text-center bg-gradient-to-br from-card to-secondary/20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-semibold mb-4">Ready to Understand Your Pet?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Choose a plan that fits your needs and start discovering what your furry friend is really saying
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 justify-center">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm">Instant Translations</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm">Emotion Tracking</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Secure & Private</span>
              </div>
            </div>
            <Link to="/pet-translator-pricing">
              <Button size="lg" className="text-lg px-8">View Plans & Pricing</Button>
            </Link>
          </Card>
        ) : (
        <>
          <Card className="max-w-3xl mx-auto p-8 md:p-12 mb-6">
            <div className="text-center">
              <h2 className="text-3xl font-semibold mb-4">Start Recording</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Press the microphone button and let your pet bark, meow, or vocalize. Our AI will analyze their emotions in real-time.
              </p>

              <div className="flex justify-center mb-6">
                {!isRecording && !isAnalyzing && (
                  <Button
                    size="lg"
                    onClick={startRecording}
                    className="w-32 h-32 rounded-full"
                  >
                    <Mic className="w-12 h-12" />
                  </Button>
                )}

                {isRecording && (
                  <Button
                    size="lg"
                    onClick={stopRecording}
                    variant="destructive"
                    className="w-32 h-32 rounded-full animate-pulse"
                  >
                    <StopCircle className="w-12 h-12" />
                  </Button>
                )}

                {isAnalyzing && (
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {isRecording && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Recording... Tap to stop
                </p>
              )}

              {isAnalyzing && (
                <p className="text-sm text-muted-foreground">
                  Analyzing your pet's emotions...
                </p>
              )}
            </div>
          </Card>

          {translation && (
            <Card className="max-w-3xl mx-auto p-8 md:p-12 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black mb-3">
                    Emotion Detected: {translation.emotion}
                  </h3>
                  <p className="text-xl mb-6 italic">"{translation.message}"</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Confidence Level</span>
                      <span className="text-muted-foreground">
                        {Math.round(translation.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex-1 bg-background rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-purple-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${translation.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>What this means:</strong> Your pet's vocalization indicates they are feeling {translation.emotion.toLowerCase()}. Pay attention to their body language and environment for more context.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="mt-8 text-center max-w-3xl mx-auto">
            <div className="bg-secondary/30 rounded-lg p-6">
              <p className="text-sm font-medium mb-2">
                Active Plan: <span className="text-primary font-bold">{subscription.tier}</span>
              </p>
              {subscription.pets_tracked !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Pets tracked: {subscription.pets_tracked} / {subscription.max_pets}
                </p>
              )}
              <Link to="/pet-translator-pricing">
                <Button variant="outline" size="sm" className="mt-4">
                  Manage Subscription
                </Button>
              </Link>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
};

export default PetTranslator;
