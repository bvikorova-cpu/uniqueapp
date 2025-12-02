import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useHandwritingCredits } from "@/hooks/useHandwritingCredits";
import { Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface HandwritingUploadProps {
  onAnalysisComplete: (result: any) => void;
  isAnalyzing: boolean;
}

export const HandwritingUpload = ({
  onAnalysisComplete,
  isAnalyzing,
}: HandwritingUploadProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [analysisType, setAnalysisType] = useState("personal");
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
      {
        onSuccess: (data) => {
          onAnalysisComplete(data);
        },
      }
    );
  };

  const analysisTypes = [
    {
      value: "personal",
      label: "Personal Analysis",
      cost: 5,
      description: "Personal growth and self-awareness insights",
    },
    {
      value: "professional",
      label: "Professional Analysis",
      cost: 10,
      description: "Career strengths and work style assessment",
    },
    {
      value: "relationship",
      label: "Relationship Analysis",
      cost: 15,
      description: "Communication patterns and compatibility",
    },
    {
      value: "business",
      label: "Business Analysis",
      cost: 20,
      description: "Decision-making and strategic thinking",
    },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Upload Handwriting Sample</h2>

      <div className="space-y-6">
        <div>
          <Label className="mb-3 block">Upload Method</Label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant={uploadMethod === "url" ? "default" : "outline"}
              onClick={() => setUploadMethod("url")}
              className="flex-1"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Image URL</span>
            </Button>
            <Button
              variant={uploadMethod === "file" ? "default" : "outline"}
              onClick={() => setUploadMethod("file")}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Upload File</span>
            </Button>
          </div>
        </div>

        {uploadMethod === "url" ? (
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/handwriting.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="fileUpload">Upload Image</Label>
            <Input
              id="fileUpload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {imageUrl && (
          <div>
            <Label>Preview</Label>
            <img
              src={imageUrl}
              alt="Handwriting preview"
              className="mt-2 max-h-64 rounded-lg border"
            />
          </div>
        )}

        <div>
          <Label className="mb-3 block">Analysis Type</Label>
          <RadioGroup value={analysisType} onValueChange={setAnalysisType}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysisTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`p-4 cursor-pointer transition-all ${
                    analysisType === type.value
                      ? "border-purple-500 border-2"
                      : ""
                  }`}
                  onClick={() => setAnalysisType(type.value)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <div className="flex-1">
                      <Label htmlFor={type.value} className="cursor-pointer">
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </div>
                        <div className="text-sm font-bold text-purple-500 mt-2">
                          {type.cost} Credits
                        </div>
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
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Handwriting"
          )}
        </Button>

        <div className="text-xs sm:text-sm text-muted-foreground text-center">
          <p className="font-medium">Tips for best results:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-left">
            <li>Use clear, high-resolution images</li>
            <li>Ensure good lighting without shadows</li>
            <li>Include at least 3-4 lines of handwriting</li>
            <li>Natural, unforced writing works best</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
