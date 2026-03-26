import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, Heart, TrendingUp, Lightbulb, Download, CreditCard, Sparkles, Award, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { useHasShadowArenaAchievementsForCareer } from "@/hooks/useShadowArenaAchievements";
import { Badge } from "@/components/ui/badge";

interface ShadowArenaAchievement {
  id: string;
  placement: number;
  awarded_at: string;
}

export default function TeenCareerCounselor() {
  const [interests, setInterests] = useState("");
  const [strengths, setStrengths] = useState("");
  const [goals, setGoals] = useState("");
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const [shadowArenaAchievements, setShadowArenaAchievements] = useState<ShadowArenaAchievement[]>([]);
  const [usageData, setUsageData] = useState<{
    canGenerate: boolean;
    hasFreeTrial: boolean;
    freeGenerationsUsed: number;
    paidGenerations: number;
  } | null>(null);
  const [checkingUsage, setCheckingUsage] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: shadowArenaData } = useHasShadowArenaAchievementsForCareer();

  useEffect(() => {
    checkUsage();
    
    // Check for payment success in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      handlePaymentSuccess(params.get('session_id'));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkUsage = async () => {
    setCheckingUsage(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use Career Counselor",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-teen-career-usage');
      if (error) throw error;
      setUsageData(data);
    } catch (error) {
      console.error('Error checking usage:', error);
      toast({
        title: "Error",
        description: "Failed to check usage status",
        variant: "destructive",
      });
    } finally {
      setCheckingUsage(false);
    }
  };

  const handlePaymentSuccess = async (sessionId: string | null) => {
    if (!sessionId) return;
    
    try {
      const { error } = await supabase.functions.invoke('add-teen-career-generation', {
        body: { session_id: sessionId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Payment Successful!",
        description: "Your career guidance session has been added",
      });
      
      await checkUsage();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePurchase = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-teen-career-payment');
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  const getCareerGuidance = async () => {
    if (!interests || !strengths) {
      toast({
        title: "Missing Information",
        description: "Please describe your interests and strengths",
        variant: "destructive",
      });
      return;
    }

    if (usageData && !usageData.canGenerate) {
      toast({
        title: "No Sessions Available",
        description: "Please purchase additional career guidance sessions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-career-counselor', {
        body: { interests, strengths, goals }
      });

      if (error) {
        if (error.message?.includes('requiresPayment')) {
          toast({
            title: "Payment Required",
            description: "You've used your free session. Purchase more to continue.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }
      
      setGuidance(data.guidance);
      
      // Store shadow arena achievements from response
      if (data.shadowArenaAchievements) {
        setShadowArenaAchievements(data.shadowArenaAchievements);
      }
      
      await checkUsage();
      
      // Show notification if Shadow Arena badge was recognized
      if (data.hasShadowArenaBadge) {
        toast({
          title: "🏆 Achievement Recognized!",
          description: "Your Shadow Arena Talent Badge has been included in your career analysis!",
        });
      }
      
      toast({
        title: "Career Guidance Ready!",
        description: "Check out your personalized career path recommendations",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate career guidance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!guidance) {
      toast({
        title: "No Guidance Available",
        description: "Please generate career guidance first",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Header with gradient effect (simulated with colors)
      doc.setFillColor(99, 102, 241); // Primary color
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Career Counseling Report", pageWidth / 2, 25, { align: 'center' });
      
      yPos = 50;
      doc.setTextColor(0, 0, 0);

      // Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Generated on: ${date}`, margin, yPos);
      yPos += 15;

      // Section: Your Profile
      doc.setFillColor(240, 240, 240);
      doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 8, 'F');
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("Your Profile", margin, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      
      // Interests
      doc.text("Interests & Hobbies:", margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      const interestsLines = doc.splitTextToSize(interests, pageWidth - 2 * margin);
      doc.text(interestsLines, margin + 5, yPos);
      yPos += interestsLines.length * 5 + 8;

      // Strengths
      doc.setFont("helvetica", "bold");
      doc.text("Strengths:", margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      const strengthsLines = doc.splitTextToSize(strengths, pageWidth - 2 * margin);
      doc.text(strengthsLines, margin + 5, yPos);
      yPos += strengthsLines.length * 5 + 8;

      // Goals (if provided)
      if (goals) {
        doc.setFont("helvetica", "bold");
        doc.text("Career Goals:", margin, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        const goalsLines = doc.splitTextToSize(goals, pageWidth - 2 * margin);
        doc.text(goalsLines, margin + 5, yPos);
        yPos += goalsLines.length * 5 + 8;
      }

      // Section: Verified Community Achievements (if user has Shadow Arena badges)
      if (shadowArenaAchievements.length > 0 || shadowArenaData?.hasBadge) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFillColor(255, 215, 0); // Gold color
        doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 8, 'F');
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("🏆 Verified Community Achievements", margin, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(99, 102, 241);
        doc.text("Shadow Arena Talent Badge", margin, yPos);
        yPos += 6;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const badgeDesc = "Top 3 winner in Shadow Arena Monthly Horror Storytelling Battle - Demonstrates verified creative writing, public performance, and competitive excellence skills.";
        const badgeLines = doc.splitTextToSize(badgeDesc, pageWidth - 2 * margin);
        doc.text(badgeLines, margin + 5, yPos);
        yPos += badgeLines.length * 5 + 10;
      }

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Section: Career Recommendations
      doc.setFillColor(240, 240, 240);
      doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 8, 'F');
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("Personalized Career Recommendations", margin, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      // Split guidance into sections and format
      const guidanceLines = doc.splitTextToSize(guidance, pageWidth - 2 * margin);
      
      guidanceLines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }

        // Check if line is a heading (contains numbers followed by period or is all caps with colons)
        if (line.match(/^\d+\.|^[A-Z\s]+:/) || line.match(/^#{1,3}\s/)) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(99, 102, 241);
          yPos += 3;
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          line = "  " + line; // Indent bullet points
        } else {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
        }

        doc.text(line, margin, yPos);
        yPos += 5;
      });

      // Footer on last page
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} | Teen Career Counselor`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const filename = `Career_Guidance_${date.replace(/\s/g, '_')}.pdf`;
      doc.save(filename);

      toast({
        title: "PDF Downloaded!",
        description: "Your career guidance report has been saved",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-16 pb-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Career Counselor (13-18y)
          </h1>
          <p className="text-lg text-muted-foreground mb-3">
            Discover career paths that match your interests, strengths, and goals
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>1st Career Guidance FREE • Additional sessions €5 each</span>
          </div>
        </div>

        {/* How It Works Description */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
              How AI Career Counselor Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            <p className="text-muted-foreground text-sm sm:text-base">
              AI Career Counselor is a personalized guidance tool designed specifically for teenagers aged 13-18. 
              Get professional-grade career advice tailored to your unique interests, strengths, and aspirations!
            </p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-sm">Share Your Interests</h4>
                  <p className="text-xs text-muted-foreground">Tell us about your hobbies, passions, and what excites you</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-sm">Describe Your Strengths</h4>
                  <p className="text-xs text-muted-foreground">What are you naturally good at? Skills, talents, abilities</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-sm">Set Your Goals (Optional)</h4>
                  <p className="text-xs text-muted-foreground">Share your dreams and what you want from your future career</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">4</div>
                <div>
                  <h4 className="font-medium text-sm">Get AI Recommendations</h4>
                  <p className="text-xs text-muted-foreground">Receive 3-5 personalized career paths with action steps</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">What You'll Receive:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Career Path Recommendations:</strong> 3-5 specific careers matching your profile</li>
                <li>• <strong>Educational Pathways:</strong> What to study and where to go for each career</li>
                <li>• <strong>Skills Development:</strong> Key skills you should focus on building now</li>
                <li>• <strong>Industry Insights:</strong> Growth opportunities and realistic outlook</li>
                <li>• <strong>Action Steps:</strong> What you can do right now to start preparing</li>
                <li>• <strong>PDF Export:</strong> Download your complete guidance report</li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground italic">
              Your first career guidance session is completely FREE! Additional sessions cost just €5 each. 
              Perfect for exploring different directions as you grow and your interests evolve.
            </p>
          </CardContent>
        </Card>

        {/* Usage Status Card */}
        {!checkingUsage && usageData && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Your Sessions</p>
                    <p className="text-sm text-muted-foreground">
                      {usageData.hasFreeTrial ? (
                        "1 free session available"
                      ) : (
                        `${usageData.paidGenerations} paid session${usageData.paidGenerations !== 1 ? 's' : ''} remaining`
                      )}
                    </p>
                  </div>
                </div>
                {!usageData.canGenerate && (
                  <Button onClick={handlePurchase} className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Buy Session (€5)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Prompt for No Sessions */}
        {!checkingUsage && usageData && !usageData.canGenerate && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/30">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    Need More Career Guidance?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You've used your free session. Get personalized career advice for just €5 per session.
                  </p>
                </div>
                <Button 
                  onClick={handlePurchase} 
                  size="lg"
                  className="gap-2 shrink-0 w-full sm:w-auto"
                >
                  <CreditCard className="h-4 w-4" />
                  Purchase Session (€5)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Tell Us About Yourself
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="interests" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  What are your interests and hobbies?
                </Label>
                <Textarea
                  id="interests"
                  placeholder="e.g., I love coding, playing music, helping people, science experiments..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="strengths" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  What are you good at?
                </Label>
                <Textarea
                  id="strengths"
                  placeholder="e.g., problem-solving, creativity, communication, mathematics, leadership..."
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="goals" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  What are your career goals or dreams? (Optional)
                </Label>
                <Textarea
                  id="goals"
                  placeholder="e.g., I want to make a positive impact, earn well, work with technology..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={2}
                />
              </div>

              <Button 
                onClick={getCareerGuidance} 
                disabled={loading}
                className="w-full"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                {loading ? "Analyzing..." : "Get Career Guidance"}
              </Button>
            </CardContent>
          </Card>

          {guidance && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Career Path Recommendations</CardTitle>
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export to PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {guidance}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Career Exploration Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Try job shadowing or internships to experience different careers</li>
                <li>• Talk to professionals in fields that interest you</li>
                <li>• Take online courses to explore new subjects</li>
                <li>• Join clubs and activities related to your interests</li>
                <li>• Remember: it's okay to change your mind as you learn more</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
