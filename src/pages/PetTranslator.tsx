import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import PetTranslatorHero from '@/components/pet-translator/PetTranslatorHero';
import PetToolsGrid from '@/components/pet-translator/PetToolsGrid';
import PetMoodStreaks from '@/components/pet-translator/PetMoodStreaks';
import PetAchievements from '@/components/pet-translator/PetAchievements';
import PetPhotoAnalysis from '@/components/pet-translator/PetPhotoAnalysis';
import PetHealthDashboard from '@/components/pet-translator/PetHealthDashboard';
import PetAudioRecorder from '@/components/pet-translator/PetAudioRecorder';
import PetHealthCertificate from '@/components/pet-translator/PetHealthCertificate';
import PetSocialNetwork from '@/components/pet-translator/PetSocialNetwork';
import PetSmartReminders from '@/components/pet-translator/PetSmartReminders';
import PetProfileManager from '@/components/pet-translator/PetProfileManager';
import PetReverseTranslator from '@/components/pet-translator/PetReverseTranslator';
import PetOnboardingQuiz from '@/components/pet-translator/PetOnboardingQuiz';
import PetTranslationHistory from '@/components/pet-translator/PetTranslationHistory';
import PetLiveListenMode from '@/components/pet-translator/PetLiveListenMode';
import PetVideoAnalysis from '@/components/pet-translator/PetVideoAnalysis';
import PetVetReferral from '@/components/pet-translator/PetVetReferral';
import PetBreedIdentifier from '@/components/pet-translator/PetBreedIdentifier';
import PetDailyTip from '@/components/pet-translator/PetDailyTip';
import PetSoundWall from '@/components/pet-translator/PetSoundWall';
import PetTrainingCourses from '@/components/pet-translator/PetTrainingCourses';
import PetSymptomChecker from '@/components/pet-translator/PetSymptomChecker';
import PetWearableTeaser from '@/components/pet-translator/PetWearableTeaser';
import PetActiveSwitcher from '@/components/pet-translator/PetActiveSwitcher';
import PetCrossPromo from '@/components/pet-translator/PetCrossPromo';
import { trackPetActivity } from '@/lib/petLover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const PetTranslator = () => {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [stats, setStats] = useState({ total_translations: 0, total_users: 0 });

  useEffect(() => {
    supabase.functions.invoke('pet-translator-stats').then(({ data }) => {
      if (data?.total_translations !== undefined) setStats(data);
    });
    trackPetActivity('translator');
  }, []);

  useEffect(() => {
    if (activeView) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeView]);

  if (false) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <FloatingHowItWorks
          title="Pet Translator"
          intro="Understand what your pet is trying to say."
          steps={[
            { title: "Record your pet", desc: "Bark, meow or gesture \u2014 video or audio." },
          { title: "Pick species", desc: "Dog, cat, bird, exotic." },
          { title: "Get the translation", desc: "AI interprets sound + body language." },
          { title: "Save moments", desc: "Share cute translations with friends." },
          { title: "Track over time", desc: "Emotion journal for your pet." }
          ]}
        />
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
      case "reverse": return <PetReverseTranslator onBack={() => setActiveView(null)} />;
      case "history": return <PetTranslationHistory onBack={() => setActiveView(null)} />;
      case "live": return <PetLiveListenMode onBack={() => setActiveView(null)} />;
      case "video": return <PetVideoAnalysis onBack={() => setActiveView(null)} />;
      case "vet": return <PetVetReferral onBack={() => setActiveView(null)} />;
      case "breed": return <PetBreedIdentifier onBack={() => setActiveView(null)} />;
      case "soundwall": return <PetSoundWall onBack={() => setActiveView(null)} />;
      case "courses": return <PetTrainingCourses onBack={() => setActiveView(null)} />;
      case "symptoms": return <PetSymptomChecker onBack={() => setActiveView(null)} />;
      case "wearable": return <PetWearableTeaser onBack={() => setActiveView(null)} />;
      case "quiz": return <PetOnboardingQuiz onDone={() => setActiveView(null)} />;
      default: return null;
    }
  };

  const specialView = renderSpecialView();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <PetTranslatorHero
          totalTranslations={stats.total_translations}
          totalUsers={stats.total_users}
          streak={0}
          isSubscribed={false}
        />

        {specialView ? (
          specialView
        ) : (

          <Tabs defaultValue="tools" className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <PetDailyTip />
              <div className="flex items-center gap-2">
                <PetActiveSwitcher />
              </div>
            </div>
            <div className="mb-4"><PetCrossPromo side="translator" /></div>
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-card/50 p-1 mb-6">
              {[
                { key: "tools", label: "🧬 AI Tools" },
                { key: "pets", label: "🐾 My Pets" },
                
                { key: "dashboard", label: "📊 Dashboard" },
                { key: "social", label: "🌍 Social" },
                { key: "streaks", label: "🔥 Streaks" },
                
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
            <TabsContent value="pets">
              <PetProfileManager />
            </TabsContent>
            <TabsContent value="dashboard">
              <PetHealthDashboard />
            </TabsContent>
            <TabsContent value="social">
              <PetSocialNetwork />
            </TabsContent>
            <TabsContent value="streaks">
              <PetMoodStreaks />
            </TabsContent>
            <TabsContent value="achievements">
              <PetAchievements />
            </TabsContent>

          </Tabs>
        )}

      </div>
    </div>
  );
};

export default PetTranslator;
