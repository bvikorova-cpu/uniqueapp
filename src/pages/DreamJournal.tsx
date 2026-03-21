import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, BookOpen, TrendingUp, Sparkles, Info, Star, Zap, CheckCircle, CreditCard, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAICredits } from "@/hooks/useAICredits";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DreamEntryForm from "@/components/dream-journal/DreamEntryForm";
import DreamList from "@/components/dream-journal/DreamList";
import JournalEntryForm from "@/components/dream-journal/JournalEntryForm";
import JournalList from "@/components/dream-journal/JournalList";
import MoodTracker from "@/components/dream-journal/MoodTracker";
import TrendsAnalysis from "@/components/dream-journal/TrendsAnalysis";

const DreamJournal = () => {
  const [activeTab, setActiveTab] = useState("dreams");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const { credits } = useAICredits();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 pt-24 pb-12 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-3">
              <Moon className="w-3 h-3" />
              <span className="font-medium">AI-Powered</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Dream Analyzer & Journal 💭
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Unlock your subconscious and discover patterns in your mental journey
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-2 rounded-lg">
              <Coins className="h-4 w-4 text-purple-500" />
              <span className="font-semibold">{credits.credits_remaining} Credits</span>
            </div>
            <Button 
              onClick={() => navigate("/ai-credits-store")}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </div>
        </div>

        <Card className="p-4 sm:p-6 mb-6 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border-purple-500/20">
          <div className="flex items-start gap-3 mb-4">
            <Info className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">What is Dream Analyzer & Journal?</h3>
              <p className="text-sm text-muted-foreground">
                Dream Analyzer & Journal is your personal mental wellness companion. Record and analyze your dreams with AI-powered interpretations, keep a daily journal to express your thoughts, track your mood patterns over time, and discover insights about your emotional well-being.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                How to Use
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• <strong>Dreams:</strong> Record dreams and get AI analysis</li>
                <li>• <strong>Journal:</strong> Write daily thoughts and reflections</li>
                <li>• <strong>Mood:</strong> Track daily mood, energy & stress</li>
                <li>• <strong>Trends:</strong> View patterns and insights over time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Key Features
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> AI-powered dream interpretation</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Private and secure journaling</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Mood and energy tracking</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Pattern analysis and trends</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3">
            <strong>Tip:</strong> For best results, record your dreams immediately after waking up while details are fresh. Regular journaling helps AI provide more accurate mood trend analysis.
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="dreams" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Dreams</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Mood</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Trends</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dreams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dream Analysis</CardTitle>
                <CardDescription>
                  Record your dreams and get powered insights into your subconscious mind
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DreamEntryForm onSuccess={handleRefresh} />
              </CardContent>
            </Card>
            
            <DreamList key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Journal</CardTitle>
                <CardDescription>
                  Express your thoughts and emotions, get insights about your mental state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JournalEntryForm onSuccess={handleRefresh} />
              </CardContent>
            </Card>
            
            <JournalList key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="mood" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mood Tracker</CardTitle>
                <CardDescription>
                  Track your daily mood, energy, and stress levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MoodTracker onSuccess={handleRefresh} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendsAnalysis />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default DreamJournal;