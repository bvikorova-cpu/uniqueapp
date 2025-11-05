import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mic, StopCircle, Loader2, PawPrint, Heart, AlertCircle } from 'lucide-react';
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <PawPrint className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">AI Pet Translator</h1>
        <p className="text-lg text-muted-foreground">
          Discover what your pet is really saying
        </p>
      </div>

      {!subscription.subscribed ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-4">Subscription Required</h2>
          <p className="text-muted-foreground mb-6">
            Subscribe to unlock unlimited pet translations and emotion tracking
          </p>
          <Link to="/pet-translator-pricing">
            <Button size="lg">View Plans</Button>
          </Link>
        </Card>
      ) : (
        <>
          <Card className="p-8 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Record Your Pet</h2>
              <p className="text-muted-foreground mb-6">
                Press the button and let your pet make their sound
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
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-start gap-4 mb-4">
                <Heart className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Emotion: {translation.emotion}
                  </h3>
                  <p className="text-lg mb-4">{translation.message}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500"
                        style={{ width: `${translation.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(translation.confidence * 100)}% confident
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Active Plan: <span className="font-semibold">{subscription.tier}</span>
            </p>
            {subscription.pets_tracked && (
              <p className="text-sm text-muted-foreground">
                Pets tracked: {subscription.pets_tracked} / {subscription.max_pets}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PetTranslator;
