import Navbar from '@/components/Navbar';
import { VoiceCloneUpload } from '@/components/voice-memorial/VoiceCloneUpload';
import { VoiceMemoryPlayer } from '@/components/voice-memorial/VoiceMemoryPlayer';
import { VoiceCloneManager } from '@/components/voice-memorial/VoiceCloneManager';
import { ArrowLeft, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVoiceSubscription } from '@/hooks/useVoiceSubscription';
import { Badge } from '@/components/ui/badge';

const VoiceMemorial = () => {
  const subscription = useVoiceSubscription();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
          <Link to="/time-capsule">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Time Capsule
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Voice Clone Memorial
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Preserve the voices of your loved ones forever. Create digital voice clones and play memories as if they were here.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {subscription.hasCloneSetup && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Voice Clone Setup
                </Badge>
              )}
              {subscription.hasVoiceLibrary && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Voice Library
                </Badge>
              )}
              {subscription.hasUnlimitedTTS && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Unlimited TTS
                </Badge>
              )}
              {subscription.hasAIConversation && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  AI Conversation
                </Badge>
              )}
            </div>
            {(subscription.hasVoiceLibrary || subscription.hasUnlimitedTTS || subscription.hasAIConversation) && (
              <Button variant="outline" size="sm" onClick={subscription.openCustomerPortal}>
                Manage Subscription
              </Button>
            )}
          </div>

          {!subscription.loading && !subscription.hasCloneSetup ? (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Voice Clone Setup Required
                </CardTitle>
                <CardDescription>
                  Get started by purchasing the one-time Voice Clone Setup to create your first AI voice clone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">€149 one-time</p>
                    <p className="text-sm text-muted-foreground">Lifetime access to voice cloning</p>
                  </div>
                  <Button asChild>
                    <Link to="/voice-memorial-pricing">
                      View Plans
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This one-time fee includes professional ElevenLabs voice cloning technology and lifetime access to your created voice clone.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-1">
              <VoiceCloneUpload />
              <VoiceCloneManager />
              <VoiceMemoryPlayer />
            </div>
          )}

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">How it works?</h3>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>Upload an audio recording of the person's voice (minimum 30 seconds)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>The system creates a digital voice clone using AI technology</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Write the memory text and select the cloned voice</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>Listen to memories in the original voice whenever you want</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoiceMemorial;
