import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Save } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import jsPDF from "jspdf";

const CVOptimizer = () => {
  const { toast } = useToast();
  const { credits, useCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [cvContent, setCvContent] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [optimizedContent, setOptimizedContent] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const optimizeCV = async () => {
    if (!cvContent) {
      toast({ title: "Error", description: "Please enter your CV content", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await useCredit("effect");

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke("career-cv-optimizer", {
        body: { cvContent, targetRole },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.error) throw response.error;
      
      setSuggestions(response.data.suggestions);
      setOptimizedContent(response.data.optimizedContent);
      setScore(response.data.score);
      
      toast({ title: "CV Optimized", description: `Score: ${response.data.score}/100` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveCV = async () => {
    if (!optimizedContent) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("cv_documents")
        .insert({
          user_id: user.id,
          title: title || "Optimized CV",
          original_content: cvContent,
          optimized_content: optimizedContent,
          ai_suggestions: suggestions,
          target_role: targetRole,
        });

      toast({ title: "Saved", description: "CV saved to history" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const content = optimizedContent || cvContent;
    
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 15, 15);
    doc.save("cv-optimized.pdf");
    
    toast({ title: "Downloaded", description: "CV downloaded as PDF" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Builder & Optimizer</CardTitle>
        <CardDescription>Get powered suggestions to improve your CV</CardDescription>
        <p className="text-sm text-muted-foreground">Credits: {credits?.credits_remaining || 0}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">CV Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Software Engineer CV 2025"
          />
        </div>

        <div>
          <Label htmlFor="cvContent">Your CV Content</Label>
          <Textarea
            id="cvContent"
            value={cvContent}
            onChange={(e) => setCvContent(e.target.value)}
            placeholder="Paste your CV content here..."
            rows={10}
          />
        </div>

        <div>
          <Label htmlFor="targetRole">Target Role (Optional)</Label>
          <Input
            id="targetRole"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Senior Product Manager"
          />
        </div>

        <Button onClick={optimizeCV} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Optimize CV
        </Button>

        {score !== null && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="font-semibold mb-2">Score: {score}/100</h3>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Suggestions:</h3>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {optimizedContent && (
          <>
            <div>
              <Label>Optimized CV</Label>
              <Textarea
                value={optimizedContent}
                onChange={(e) => setOptimizedContent(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadPDF} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={saveCV} variant="outline" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CVOptimizer;