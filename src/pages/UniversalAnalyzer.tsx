import { useState, useRef } from "react";
import { Camera, Upload, Sparkles, History, Settings, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAnalyzerCredits } from "@/hooks/useAnalyzerCredits";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id: 'nature', name: 'Nature & Wildlife', icon: '🌿', description: 'Trees, plants, animals, insects, fungi' },
  { id: 'objects', name: 'Objects & Products', icon: '📦', description: 'Electronics, furniture, cars, general items' },
  { id: 'fashion', name: 'Fashion & Style', icon: '👔', description: 'Clothing, shoes, accessories, outfits' },
  { id: 'text', name: 'Text & Language', icon: '📝', description: 'OCR, translation, handwriting, documents' },
  { id: 'food', name: 'Food & Nutrition', icon: '🍎', description: 'Meals, ingredients, nutrition info' },
  { id: 'art', name: 'Art & Culture', icon: '🎨', description: 'Paintings, sculptures, architecture' },
  { id: 'safety', name: 'Safety & Warnings', icon: '⚠️', description: 'Warning signs, hazards, chemicals' },
  { id: 'home', name: 'Home & Interior', icon: '🏠', description: 'Design, colors, materials, issues' },
];

export default function UniversalAnalyzer() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { credits, isLoading, analyzeImage, isAnalyzing } = useAnalyzerCredits();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAnalyze = async () => {
    if (!imageFile || !selectedCategory) {
      toast.error("Please select a category and upload an image");
      return;
    }

    if (!credits || credits.credits_remaining < 1) {
      toast.error("Insufficient credits. Please upgrade your tier.");
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(imageFile);
      
      analyzeImage(
        { imageUrl, category: selectedCategory, analysisType: 'basic' },
        {
          onSuccess: (data) => {
            toast.success("Analysis complete!");
            navigate(`/analyzer/result/${data.analysis.id}`);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Universal Vision Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            AI-powered image analysis for everything around you
          </p>
          
          {/* Credits Display */}
          <Card className="inline-flex items-center gap-4 p-4 bg-primary/5 border-primary/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {isLoading ? '...' : credits?.credits_remaining || 0}
              </div>
              <div className="text-sm text-muted-foreground">Credits Remaining</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-lg font-semibold capitalize">
                {isLoading ? '...' : credits?.tier || 'free'}
              </div>
              <div className="text-sm text-muted-foreground">Current Tier</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/analyzer/pricing')}>
              <Settings className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </Card>
        </div>

        {/* Category Selection */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Select Analysis Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Card
                key={category.id}
                className={`p-4 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                  selectedCategory === category.id
                    ? 'border-primary bg-primary/10'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Image Upload Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Upload or Capture Image</h2>
          
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="flex-1"
                >
                  Remove Image
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedCategory || isAnalyzing || isUploading}
                  className="flex-1"
                >
                  {isAnalyzing || isUploading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-32 flex-col"
                >
                  <Camera className="w-8 h-8 mb-2" />
                  <span>Take Photo</span>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 flex-col"
                >
                  <Upload className="w-8 h-8 mb-2" />
                  <span>Upload Image</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP (max 10MB)
              </p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/analyzer/history')}
            className="h-20"
          >
            <History className="w-6 h-6 mr-2" />
            <div className="text-left">
              <div className="font-semibold">View History</div>
              <div className="text-xs text-muted-foreground">See past analyses</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/analyzer/collections')}
            className="h-20"
          >
            <ImageIcon className="w-6 h-6 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Collections</div>
              <div className="text-xs text-muted-foreground">Organize analyses</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/analyzer/pricing')}
            className="h-20"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Upgrade</div>
              <div className="text-xs text-muted-foreground">Get more features</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
