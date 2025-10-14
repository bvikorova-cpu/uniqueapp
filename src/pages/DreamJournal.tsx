import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, BookOpen, TrendingUp, Sparkles } from "lucide-react";
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

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-purple-500/5">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Dream Analyzer & Journal 💭
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock your subconscious, track your emotions, and discover patterns in your mental journey
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dreams" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline">Dreams</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Mood</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Trends</span>
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