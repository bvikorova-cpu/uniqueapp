import { useState, useRef } from "react";
import {
  Camera, Upload, Sparkles, History, Settings, Image as ImageIcon,
  GitCompare, DollarSign, HeartPulse, FileText, Layers, Search,
  Eye, Zap, Scan, ScanBarcode, Calculator, Music, Link2, Apple, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalyzerCredits } from "@/hooks/useAnalyzerCredits";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CameraCapture } from "@/components/analyzer/CameraCapture";
import { AnalyzerHero } from "@/components/analyzer/AnalyzerHero";
import { ComparisonView } from "@/components/analyzer/views/ComparisonView";
import { PriceEstimatorView } from "@/components/analyzer/views/PriceEstimatorView";
import { HealthScannerView } from "@/components/analyzer/views/HealthScannerView";
import { DocumentScannerView } from "@/components/analyzer/views/DocumentScannerView";
import { BatchAnalyzeView } from "@/components/analyzer/views/BatchAnalyzeView";
import { SmartSearchView } from "@/components/analyzer/views/SmartSearchView";
import { ReverseImageView } from "@/components/analyzer/views/ReverseImageView";
import { BarcodeScannerView } from "@/components/analyzer/views/BarcodeScannerView";
import { MathSolverView } from "@/components/analyzer/views/MathSolverView";
import { AudioIdView } from "@/components/analyzer/views/AudioIdView";
import { URLAnalyzerView } from "@/components/analyzer/views/URLAnalyzerView";
import { NutritionScanView } from "@/components/analyzer/views/NutritionScanView";
import { HomeworkHelperView } from "@/components/analyzer/views/HomeworkHelperView";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CATEGORIES = [
  { id: 'nature', name: 'Nature & Plants', icon: '🌿', description: 'Trees, plants, flowers, fungi' },
  { id: 'insects', name: 'Insects & Bugs', icon: '🦋', description: 'Bug ID, danger level, life cycle' },
  { id: 'animals', name: 'Animals & Breeds', icon: '🐕', description: 'Pets, wildlife, breed identification' },
  { id: 'mushrooms', name: 'Mushrooms', icon: '🍄', description: 'Edibility, toxicity, look-alikes' },
  { id: 'rocks', name: 'Rocks & Crystals', icon: '💎', description: 'Geology, hardness, value' },
  { id: 'coins', name: 'Coins & Currency', icon: '🪙', description: 'Country, year, collector value' },
  { id: 'cars', name: 'Cars & Vehicles', icon: '🚗', description: 'Make, model, market value' },
  { id: 'logos', name: 'Logos & Brands', icon: '🏷️', description: 'Brand identification' },
  { id: 'landmarks', name: 'Landmarks', icon: '🗺️', description: 'Places, monuments, history' },
  { id: 'wine', name: 'Wine Labels', icon: '🍷', description: 'Producer, region, tasting notes' },
  { id: 'objects', name: 'Objects & Antiques', icon: '📦', description: 'Items, electronics, collectibles' },
  { id: 'fashion', name: 'Fashion & Style', icon: '👔', description: 'Clothing, accessories, virtual try-on' },
  { id: 'text', name: 'Text & Language', icon: '📝', description: 'OCR, translation, handwriting' },
  { id: 'food', name: 'Food', icon: '🍎', description: 'Dish ID + nutrition' },
  { id: 'nutrition', name: 'Calorie Counter', icon: '🥗', description: 'Per-meal calorie & macro scan' },
  { id: 'art', name: 'Art & Culture', icon: '🎨', description: 'Paintings, sculptures, period' },
  { id: 'safety', name: 'Safety & Warnings', icon: '⚠️', description: 'Hazards, signs, chemicals' },
  { id: 'home', name: 'Home & Interior', icon: '🏠', description: 'Design, materials, staging' },
  { id: 'drawing', name: 'Drawings & Sketches', icon: '✏️', description: 'Style, meaning, skill level' },
  { id: 'math', name: 'Math from Photo', icon: '🧮', description: 'Solve math problems from image' },
  { id: 'homework', name: 'Homework Help', icon: '📚', description: 'Step-by-step explanations' },
];

const AI_TOOLS = [
  { id: 'comparison', icon: GitCompare, name: 'AI Comparison', desc: 'Compare two items', credits: 4, gradient: 'from-cyan-600 to-teal-600' },
  { id: 'price-estimator', icon: DollarSign, name: 'Price Estimator', desc: 'AI valuation', credits: 3, gradient: 'from-emerald-600 to-cyan-600' },
  { id: 'health-scanner', icon: HeartPulse, name: 'Health Scanner', desc: 'Health insights', credits: 3, gradient: 'from-red-600 to-pink-600' },
  { id: 'document-scanner', icon: FileText, name: 'Document Scanner', desc: 'OCR & translate', credits: 3, gradient: 'from-violet-600 to-indigo-600' },
  { id: 'batch-analyze', icon: Layers, name: 'Batch Analysis', desc: 'Multiple items', credits: 5, gradient: 'from-amber-600 to-orange-600' },
  { id: 'smart-search', icon: Search, name: 'Smart Search', desc: 'Shopping AI', credits: 3, gradient: 'from-blue-600 to-purple-600' },
  { id: 'reverse-image', icon: Search, name: 'Reverse Image', desc: 'Find image online', credits: 2, gradient: 'from-indigo-600 to-purple-600' },
  { id: 'barcode-scanner', icon: ScanBarcode, name: 'Barcode / QR', desc: 'Product lookup', credits: 2, gradient: 'from-green-600 to-emerald-600' },
  { id: 'math-solver', icon: Calculator, name: 'Math Solver', desc: 'Step-by-step', credits: 3, gradient: 'from-fuchsia-600 to-purple-600' },
  { id: 'audio-id', icon: Music, name: 'Sound / Music ID', desc: 'Identify sounds', credits: 3, gradient: 'from-rose-600 to-orange-600' },
  { id: 'url-analyzer', icon: Link2, name: 'URL Analyzer', desc: 'Web page insights', credits: 3, gradient: 'from-sky-600 to-cyan-600' },
  { id: 'nutrition-scan', icon: Apple, name: 'Nutrition Scan', desc: 'Calories & macros', credits: 3, gradient: 'from-lime-600 to-emerald-600' },
  { id: 'homework-helper', icon: GraduationCap, name: 'Homework Helper', desc: 'Subjects & answers', credits: 3, gradient: 'from-yellow-600 to-amber-600' },
];

export default function UniversalAnalyzer() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [activeView, setActiveView] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { credits, isLoading, analyzeImage, isAnalyzing } = useAnalyzerCredits();

  // Sub-view routing
  const back = () => setActiveView(null);
  if (activeView === 'comparison') return <ComparisonView onBack={back} />;
  if (activeView === 'price-estimator') return <PriceEstimatorView onBack={back} />;
  if (activeView === 'health-scanner') return <HealthScannerView onBack={back} />;
  if (activeView === 'document-scanner') return <DocumentScannerView onBack={back} />;
  if (activeView === 'batch-analyze') return <BatchAnalyzeView onBack={back} />;
  if (activeView === 'smart-search') return <SmartSearchView onBack={back} />;
  if (activeView === 'reverse-image') return <ReverseImageView onBack={back} />;
  if (activeView === 'barcode-scanner') return <BarcodeScannerView onBack={back} />;
  if (activeView === 'math-solver') return <MathSolverView onBack={back} />;
  if (activeView === 'audio-id') return <AudioIdView onBack={back} />;
  if (activeView === 'url-analyzer') return <URLAnalyzerView onBack={back} />;
  if (activeView === 'nutrition-scan') return <NutritionScanView onBack={back} />;
  if (activeView === 'homework-helper') return <HomeworkHelperView onBack={back} />;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("File size must be less than 10MB"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleAnalyze = async () => {
    if (!imageFile || !selectedCategory) { toast.error("Please select a category and upload an image"); return; }
    if (!credits || credits.credits_remaining < 1) { toast.error("Insufficient credits. Please upgrade your tier."); return; }
    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(imageFile);
      analyzeImage({ imageUrl, category: selectedCategory, analysisType: 'basic' }, {
        onSuccess: (data) => { toast.success("Analysis complete!"); navigate(`/analyzer/result/${data.analysis.id}`); }
      });
    } catch (error) { console.error('Error:', error); toast.error("Failed to upload image"); }
    finally { setIsUploading(false); }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <FloatingHowItWorks
        title="Universal Analyzer"
        intro="Analyze any image, product or document with AI."
        steps={[
          { title: "Upload a file", desc: "Photo, screenshot, receipt, product, doc." },
          { title: "Pick analysis type", desc: "Product, health, ingredients, translation, etc." },
          { title: "Spend credits", desc: "3\u20135 credits per analysis." },
          { title: "Read the report", desc: "Structured breakdown with recommendations." },
          { title: "Save to collection", desc: "Reopen in History or Collections later." }
        ]}
      />
      <div className="max-w-6xl mx-auto space-y-6">
        <AnalyzerHero credits={credits?.credits_remaining || 0} tier={credits?.tier || 'free'} />

        <div>
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            AI Power Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {AI_TOOLS.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  className="p-4 cursor-pointer border-cyan-500/20 hover:border-cyan-400/40 hover:-translate-y-1 transition-all group bg-card/80 backdrop-blur-sm"
                  onClick={() => setActiveView(tool.id)}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm">{tool.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">{tool.desc}</p>
                  <Badge variant="outline" className="mt-2 text-[10px] border-cyan-500/30 text-cyan-400">
                    {tool.credits} CR
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Scan className="w-6 h-6 text-cyan-400" />
            Image Analysis Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CATEGORIES.map((category) => (
              <Card
                key={category.id}
                className={`p-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 border-cyan-500/10 ${
                  selectedCategory === category.id
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                    : 'hover:border-cyan-500/30'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-bold text-sm mb-1 leading-tight">{category.name}</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">{category.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 border-cyan-500/20 bg-card/80 backdrop-blur-sm">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Upload or Capture Image
          </h2>

          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-cyan-500/20">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => { setImageFile(null); setImagePreview(''); }} className="flex-1 border-cyan-500/20">
                  Remove Image
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedCategory || isAnalyzing || isUploading}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  {isAnalyzing || isUploading ? (
                    <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Analyze Image</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" size="lg" onClick={() => setShowCamera(true)} className="h-32 flex-col border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/5">
                  <Camera className="w-8 h-8 mb-2 text-cyan-400" />
                  <span>Take Photo</span>
                  <span className="text-xs text-muted-foreground mt-1">Open camera</span>
                </Button>
                <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()} className="h-32 flex-col border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/5">
                  <Upload className="w-8 h-8 mb-2 text-cyan-400" />
                  <span>Upload Image</span>
                  <span className="text-xs text-muted-foreground mt-1">From gallery/files</span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">Supports JPG, PNG, WEBP (max 10MB)</p>
            </div>
          )}
        </Card>

        {showCamera && <CameraCapture onCapture={(f) => processFile(f)} onClose={() => setShowCamera(false)} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: History, label: "View History", desc: "Search past analyses", path: "/analyzer/history" },
            { icon: ImageIcon, label: "Collections", desc: "Organize analyses", path: "/analyzer/collections" },
            { icon: Settings, label: "Upgrade Plan", desc: "Get more features", path: "/analyzer/pricing" },
          ].map((item) => (
            <Button key={item.label} variant="outline" size="lg" onClick={() => navigate(item.path)}
              className="h-20 justify-start border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-500/5">
              <item.icon className="w-6 h-6 mr-3 text-cyan-400" />
              <div className="text-left">
                <div className="font-bold">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
