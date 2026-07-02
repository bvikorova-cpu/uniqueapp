import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope, Upload, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const PlantDiagnosis = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const { credits, refresh } = useAICredits();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedImage) return;

    if ((credits?.credits_remaining || 0) < 5) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 5 credits to diagnose a plant.",
        variant: "destructive"
      });
      return;
    }

    setIsDiagnosing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload image
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('beauty-photos')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('beauty-photos')
        .getPublicUrl(fileName);

      // Call AI function
      const { data, error } = await supabase.functions.invoke('diagnose-plant', {
        body: { 
          imageUrl: publicUrl,
          symptoms: symptoms
        }
      });

      if (error) throw error;

      setResult(data.diagnosis);
      await refresh();
      
      toast({
        title: "Diagnosis Complete!",
        description: "Review the health assessment and recommendations",
      });
    } catch (error: any) {
      console.error('Error diagnosing plant:', error);
      toast({
        title: "Diagnosis Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Plant Diagnosis - How it works"} steps={[{ title: 'Open', desc: 'Access the Plant Diagnosis section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Plant Diagnosis.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-green-500" />
          Diagnose Plant Health
        </h2>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload a photo showing the problem
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full"
          />

          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe symptoms (optional)
            </label>
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="E.g., yellow leaves, brown spots, wilting..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleDiagnose}
            disabled={!selectedImage || isDiagnosing || (credits?.credits_remaining || 0) < 5}
            className="w-full"
          >
            {isDiagnosing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Diagnosing...
              </>
            ) : (
              <>
                <Stethoscope className="mr-2 h-4 w-4" />
                Diagnose Plant (5 credits)
              </>
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Credits remaining: {credits?.credits_remaining || 0}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Diagnosis Results</h2>

        {result ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg bg-muted`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold">Severity Level</h3>
              </div>
              <p className={`font-bold text-lg capitalize ${getSeverityColor(result.severityLevel)}`}>
                {result.severity_level || result.severityLevel}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Health Assessment</h4>
              <p className="text-sm">{result.diagnosis || result.healthAssessment}</p>
            </div>

            {result.possible_diseases?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Possible Issues</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.possible_diseases.map((disease: string, i: number) => (
                    <li key={i} className="text-sm">{disease}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.treatment_recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Treatment Recommendations</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {result.treatment_recommendations.map((step: string, i: number) => (
                    <li key={i} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {result.preventionTips?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Prevention Tips</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.preventionTips.map((tip: string, i: number) => (
                    <li key={i} className="text-sm">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Upload a photo to get diagnosis</p>
          </div>
        )}
      </Card>
    </div>
    </>
  );
};