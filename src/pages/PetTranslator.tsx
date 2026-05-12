import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePetSubscription } from '@/hooks/usePetSubscription';
import { Link } from 'react-router-dom';
import PetTranslatorHero from '@/components/pet-translator/PetTranslatorHero';
import PetToolsGrid from '@/components/pet-translator/PetToolsGrid';
import PetMoodStreaks from '@/components/pet-translator/PetMoodStreaks';
import PetLeaderboard from '@/components/pet-translator/PetLeaderboard';
import PetAchievements from '@/components/pet-translator/PetAchievements';
import PetWeeklyChallenges from '@/components/pet-translator/PetWeeklyChallenges';
import PetPhotoAnalysis from '@/components/pet-translator/PetPhotoAnalysis';
import PetHealthDashboard from '@/components/pet-translator/PetHealthDashboard';
import PetAudioRecorder from '@/components/pet-translator/PetAudioRecorder';
import PetHealthCertificate from '@/components/pet-translator/PetHealthCertificate';
import PetSocialNetwork from '@/components/pet-translator/PetSocialNetwork';
import PetSmartReminders from '@/components/pet-translator/PetSmartReminders';
import { Card } from '@/components/ui/card';
import { Crown, Sparkles, PawPrint, Heart, Stethoscope, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PetTranslator = () => {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [stats, setStats] = useState({ total_translations: 0, total_users: 0 });
  const { subscription, loading: subLoading } = usePetSubscription();

  useEffect(() => {
    supabase.functions.invoke('pet-translator-stats').then(({ data }) => {
      if (data?.total_translations !== undefined) setStats(data);
    });
  }, []);

  if (subLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Handle special views that take over the full content area
  const renderSpecialView = () => {
    switch (activeView) {
      case "photo_analysis": return <PetPhotoAnalysis onBack={() => setActiveView(null)} />;
      case "audio_recorder": return <PetAudioRecorder onBack={() => setActiveView(null)} />;
      case "health_certificate": return <PetHealthCertificate onBack={() => setActiveView(null)} />;
      case "smart_reminders": return <PetSmartReminders onBack={() => setActiveView(null)} />;
      default: return null;
    }
  };

  const specialView = renderSpecialView();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <PetTranslatorHero
          totalTranslations={1247}
          totalUsers={3892}
          streak={0}
          isSubscribed={subscription.subscribed}
        />

        {!subscription.subscribed ? (
          <div className="space-y-8">
            <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-4">Unlock AI Pet Translation</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Subscribe to access 12 powerful AI tools, gamification, and weekly challenges
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                {[
                  { icon: PawPrint, label: "AI Translator" },
                  { icon: Heart, label: "Emotion Detector" },
                  { icon: Stethoscope, label: "Health Scanner" },
                  { icon: GraduationCap, label: "Training Coach" },
                  { icon: Sparkles, label: "Diet Planner" },
                  { icon: Crown, label: "12+ AI Tools" },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2 p-3 rounded-lg bg-card/50 border border-border/30">
                    <f.icon className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <span className="text-xs font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <Link to="/pet-translator-pricing">
                <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700">
                  View Plans & Pricing
                </Button>
              </Link>
            </Card>
          </div>
        ) : specialView ? (
          specialView
        ) : (
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-card/50 p-1 mb-6">
              {[
                { key: "tools", label: "🧬 AI Tools" },
                { key: "dashboard", label: "📊 Dashboard" },
                { key: "social", label: "🌍 Social" },
                { key: "streaks", label: "🔥 Streaks" },
                { key: "challenges", label: "🎯 Challenges" },
                { key: "leaderboard", label: "🏆 Leaderboard" },
                { key: "achievements", label: "🏅 Achievements" },
              ].map(tab => (
                <TabsTrigger key={tab.key} value={tab.key} className="flex-1 min-w-[70px] text-[10px] sm:text-xs capitalize">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="tools">
              <PetToolsGrid activeView={activeView} setActiveView={setActiveView} />
            </TabsContent>
            <TabsContent value="dashboard">
              <PetHealthDashboard />
            </TabsContent>
            <TabsContent value="social">
              <PetSocialNetwork />
            </TabsContent>
            <TabsContent value="streaks">
              <PetMoodStreaks currentStreak={0} />
            </TabsContent>
            <TabsContent value="challenges">
              <PetWeeklyChallenges />
            </TabsContent>
            <TabsContent value="leaderboard">
              <PetLeaderboard />
            </TabsContent>
            <TabsContent value="achievements">
              <PetAchievements totalPoints={0} />
            </TabsContent>
          </Tabs>
        )}

        {subscription.subscribed && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2">
              <Badge className="bg-purple-500 text-white">{subscription.tier}</Badge>
              <span className="text-sm text-muted-foreground">
                Pets: {subscription.pets_tracked}/{subscription.max_pets}
              </span>
              <Link to="/pet-translator-pricing">
                <Button variant="ghost" size="sm" className="text-xs">Manage</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetTranslator;
