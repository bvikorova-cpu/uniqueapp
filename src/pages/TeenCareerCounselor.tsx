import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, Heart, TrendingUp, Lightbulb, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

export default function TeenCareerCounselor() {
  const [interests, setInterests] = useState("");
  const [strengths, setStrengths] = useState("");
  const [goals, setGoals] = useState("");
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCareerGuidance = async () => {
    if (!interests || !strengths) {
      toast({
        title: "Missing Information",
        description: "Please describe your interests and strengths",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teen-career-counselor', {
        body: { interests, strengths, goals }
      });

      if (error) throw error;
      setGuidance(data.guidance);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-16 pb-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Career Counselor (13-18y)
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover career paths that match your interests, strengths, and goals
          </p>
        </div>

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
      <Footer />
    </div>
  );
}
