import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PhobiaDetectorProps {
  onPhobiaDetected: () => void;
}

const PhobiaDetector = ({ onPhobiaDetected }: PhobiaDetectorProps) => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleDetect = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe your fear or anxiety",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to detect phobias",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('detect-phobia', {
        body: { description }
      });

      if (error) throw error;

      setResult(data.phobia);
      onPhobiaDetected();
      
      toast({
        title: "Phobia Detected",
        description: `Identified: ${data.phobia.phobia_name}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Detection Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <FloatingHowItWorks title={"Phobia Detector - How it works"} steps={[{ title: 'Open', desc: 'Access the Phobia Detector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Phobia Detector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-cyan-400" />
            AI Phobia Detection
          </CardTitle>
          <CardDescription>
            Describe your fears, anxieties, or situations that cause distress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: I get extremely anxious when I see spiders, even pictures of them make my heart race..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <Button 
            onClick={handleDetect} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Analyzing...' : 'Detect Phobia'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-950/10 to-background">
          <CardHeader>
            <CardTitle className="text-xl text-blue-400">{result.phobia_name}</CardTitle>
            <CardDescription>Type: {result.phobia_type}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Severity: {result.severity}/10</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${result.severity * 10}%` }}
                />
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Analysis:</p>
              <p className="text-sm text-muted-foreground">{result.analysis}</p>
            </div>

            {result.triggers && result.triggers.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Common Triggers:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.triggers.map((trigger: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">{trigger}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.coping_strategies && result.coping_strategies.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Coping Strategies:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.coping_strategies.map((strategy: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">{strategy}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};

export default PhobiaDetector;
