import { useState, useRef } from "react";
import {
  Camera, Upload, Sparkles, History, Settings, Image as ImageIcon,
  GitCompare, DollarSign, HeartPulse, FileText, Layers, Search,
  Eye, Zap, Scan
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
import { motion } from "framer-motion";

const CATEGORIES = [
  { id: 'nature', name: 'Nature & Wildlife', icon: '🌿', description: 'Trees, plants, animals, insects, fungi',
    details: ['Trees & Plants: Species ID, age, health, diseases, care', 'Animals: Species, breed, age estimate, behavior', 'Insects: Classification, danger level, life cycle', 'Fungi: Edible/poisonous, species, safety'] },
  { id: 'objects', name: 'Objects & Products', icon: '📦', description: 'Electronics, furniture, cars, general items',
    details: ['General items: Name, brand, purpose, where to buy', 'Electronics: Model, specs, market price', 'Furniture: Style, period, material, value', 'Cars: Brand, model, year, maintenance'] },
  { id: 'fashion', name: 'Fashion & Style', icon: '👔', description: 'Clothing, shoes, accessories, outfits',
    details: ['Clothing: Brand, material, size, styling tips', 'Footwear: Type, brand, authenticity check', 'Accessories: Watches, jewelry, bags - value', 'Outfit: Match recommendations'] },
  { id: 'text', name: 'Text & Language', icon: '📝', description: 'OCR, translation, handwriting, documents',
    details: ['OCR: Extract text from images', 'Translation: Auto detection + 190+ languages', 'Handwriting: Convert to digital text', 'Documents: Scan invoices, receipts'] },
  { id: 'food', name: 'Food & Nutrition', icon: '🍎', description: 'Meals, ingredients, nutrition info',
    details: ['Food: Dish name, calories, macros', 'Fruits/Vegetables: Ripeness, freshness', 'Packaged: Barcode, allergens, health score', 'Recipes: Based on ingredients'] },
  { id: 'art', name: 'Art & Culture', icon: '🎨', description: 'Paintings, sculptures, architecture',
    details: ['Paintings: Style, period, artist, technique', 'Sculptures: Material, period, context', 'Architecture: Style, historical context', 'Artifacts: Age, origin, value'] },
  { id: 'safety', name: 'Safety & Warnings', icon: '⚠️', description: 'Warning signs, hazards, chemicals',
    details: ['Warning signs: Meaning, safety measures', 'Chemicals: Hazard level, first aid', 'Health: Skin conditions, allergens', 'Damage: Mold, harmful assessment'] },
  { id: 'home', name: 'Home & Interior', icon: '🏠', description: 'Design, colors, materials, issues',
    details: ['Design styles: Identification, suggestions', 'Colors: Matching, palette extraction', 'Materials: Wood, stone, fabrics quality', 'Issues: Cracks, moisture, damage'] },
];

const AI_TOOLS = [
  { id: 'comparison', icon: GitCompare, name: 'AI Comparison', desc: 'Compare two items side-by-side', credits: 4, gradient: 'from-cyan-600 to-teal-600' },
  { id: 'price-estimator', icon: DollarSign, name: 'Price Estimator', desc: 'AI-powered item valuation', credits: 3, gradient: 'from-emerald-600 to-cyan-600' },
  { id: 'health-scanner', icon: HeartPulse, name: 'Health Scanner', desc: 'Analyze health-related items', credits: 3, gradient: 'from-red-600 to-pink-600' },
  { id: 'document-scanner', icon: FileText, name: 'Document Scanner', desc: 'OCR, translate & summarize', credits: 3, gradient: 'from-violet-600 to-indigo-600' },
  { id: 'batch-analyze', icon: Layers, name: 'Batch Analysis', desc: 'Analyze multiple items at once', credits: 5, gradient: 'from-amber-600 to-orange-600' },
  { id: 'smart-search', icon: Search, name: 'Smart Search', desc: 'AI shopping recommendations', credits: 3, gradient: 'from-blue-600 to-purple-600' },
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
  if (activeView === 'comparison') return <ComparisonView onBack={() => setActiveView(null)} />;
  if (activeView === 'price-estimator') return <PriceEstimatorView onBack={() => setActiveView(null)} />;
  if (activeView === 'health-scanner') return <HealthScannerView onBack={() => setActiveView(null)} />;
  if (activeView === 'document-scanner') return <DocumentScannerView onBack={() => setActiveView(null)} />;
  if (activeView === 'batch-analyze') return <BatchAnalyzeView onBack={() => setActiveView(null)} />;
  if (activeView === 'smart-search') return <SmartSearchView onBack={() => setActiveView(null)} />;

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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cinematic Hero */}
        <AnalyzerHero
          credits={credits?.credits_remaining || 0}
          tier={credits?.tier || 'free'}
        />

        {/* AI Tools Grid */}
        <div>
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            AI Power Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AI_TOOLS.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
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

        {/* Category Selection */}
        <div>
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Scan className="w-6 h-6 text-cyan-400" />
            Image Analysis Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Card
                key={category.id}
                className={`p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 border-cyan-500/10 ${
                  selectedCategory === category.id
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                    : 'hover:border-cyan-500/30'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                {category.details && (
                  <ul className="text-[11px] text-muted-foreground space-y-0.5">
                    {category.details.map((detail, index) => (
                      <li key={index} className="leading-tight">• {detail}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Image Upload */}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: History, label: "View History", desc: "See past analyses", path: "/analyzer/history" },
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
