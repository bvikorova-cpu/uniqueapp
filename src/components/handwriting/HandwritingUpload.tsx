import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useHandwritingCredits } from "@/hooks/useHandwritingCredits";
import { Upload, Link as LinkIcon, Loader2, PenTool, Image, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface HandwritingUploadProps {
  onAnalysisComplete: (result: any) => void;
  isAnalyzing: boolean;
  preselectedType?: string;
}

export const HandwritingUpload = ({
  onAnalysisComplete,
  isAnalyzing,
  preselectedType = "personal",
}: HandwritingUploadProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [analysisType, setAnalysisType] = useState(preselectedType);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const { analyzeHandwriting } = useHandwritingCredits();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!imageUrl) {
      toast.error("Please provide a handwriting sample");
      return;
    }
    analyzeHandwriting(
      { imageUrl, analysisType },
      { onSuccess: (data) => onAnalysisComplete(data) }
    );
  };

  const analysisTypes = [
    { value: "personal", label: "Personal", cost: 5, color: "from-purple-500 to-violet-500", description: "Personal growth insights" },
    { value: "professional", label: "Professional", cost: 10, color: "from-blue-500 to-cyan-500", description: "Career & work style" },
    { value: "relationship", label: "Relationship", cost: 15, color: "from-pink-500 to-rose-500", description: "Communication patterns" },
    { value: "business", label: "Business", cost: 20, color: "from-emerald-500 to-teal-500", description: "Strategic thinking" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Handwriting Upload - How it works"} steps={[{ title: 'Open', desc: 'Access the Handwriting Upload section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Handwriting Upload.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${analysisTypes.find(t => t.value === analysisType)?.color || 'from-primary to-accent'}`} />
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base sm:text-lg">
              <Upload className="h-5 w-5 text-primary" />
              Upload Handwriting Sample
            </div>
            <Badge variant="secondary" className="text-xs">
              {analysisTypes.find(t => t.value === analysisType)?.cost || 5} credits
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Upload Method */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Upload Method</Label>
            <div className="flex gap-2">
              <Button
                variant={uploadMethod === "url" ? "default" : "outline"}
                onClick={() => setUploadMethod("url")}
                size="sm"
                className="flex-1 gap-2"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Image URL
              </Button>
              <Button
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
                size="sm"
                className="flex-1 gap-2"
              >
                <Image className="h-3.5 w-3.5" />
                Upload File
              </Button>
            </div>
          </div>

          {uploadMethod === "url" ? (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Image URL</Label>
              <Input
                type="url"
                placeholder="https://example.com/handwriting.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="bg-background/50"
              />
            </div>
          ) : (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Upload Image</Label>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/30 transition-all">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-2">Click to upload or drag & drop</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="bg-background/50"
                />
              </div>
            </div>
          )}

          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-border/30">
              <img
                src={imageUrl}
                alt="Handwriting preview"
                className="w-full max-h-48 object-contain bg-muted/10"
              />
            </div>
          )}

          {/* Analysis Type */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Analysis Type</Label>
            <RadioGroup value={analysisType} onValueChange={setAnalysisType}>
              <div className="grid grid-cols-2 gap-3">
                {analysisTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`p-3 cursor-pointer transition-all bg-card/60 backdrop-blur-sm ${
                      analysisType === type.value
                        ? "border-primary/50 ring-1 ring-primary/20"
                        : "border-border/30 hover:border-primary/20"
                    }`}
                    onClick={() => setAnalysisType(type.value)}
                  >
                    <div className="flex items-start gap-2.5">
                      <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor={type.value} className="cursor-pointer">
                          <div className="font-semibold text-sm">{type.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{type.description}</div>
                          <Badge variant="secondary" className="text-[9px] mt-1.5">{type.cost} credits</Badge>
                        </Label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!imageUrl || isAnalyzing}
            className={`w-full bg-gradient-to-r ${analysisTypes.find(t => t.value === analysisType)?.color || 'from-primary to-accent'} hover:opacity-90 text-white`}
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Handwriting...
              </>
            ) : (
              <>
                <PenTool className="mr-2 h-4 w-4" />
                Analyze Handwriting
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
