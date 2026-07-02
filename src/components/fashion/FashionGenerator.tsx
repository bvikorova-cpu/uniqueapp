import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function FashionGenerator() {
  const queryClient = useQueryClient();
  const { credits } = useAICredits();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [styleId, setStyleId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [qualityLevel, setQualityLevel] = useState<'basic' | 'detailed' | 'premium' | 'collection'>('basic');
  const [isPublic, setIsPublic] = useState(true);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [generatedDesign, setGeneratedDesign] = useState<any>(null);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['fashion-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fashion_categories')
        .select('*')
        .is('parent_category_id', null)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch styles
  const { data: styles } = useQuery({
    queryKey: ['fashion-styles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fashion_styles')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch materials
  const { data: materials } = useQuery({
    queryKey: ['fashion-materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fashion_materials')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const creditsMap = {
    basic: 50,
    detailed: 100,
    premium: 200,
    collection: 400
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-fashion-design', {
        body: {
          title,
          description,
          categoryId,
          styleId,
          materialId,
          colors,
          qualityLevel,
          isPublic
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedDesign(data.design);
      queryClient.invalidateQueries({ queryKey: ['fashion-designs'] });
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
      toast.success("Design generated successfully!");
    },
    onError: (error: any) => {
      console.error('Generation error:', error);
      toast.error(error.message || "Error generating design");
    }
  });

  const handleGenerate = () => {
    if (!title || !categoryId || !styleId || !materialId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const creditsNeeded = creditsMap[qualityLevel];
    const hasAICredits = credits && credits.credits_remaining >= creditsNeeded;
    
    if (!hasAICredits) {
      toast.error(`You need ${creditsNeeded} AI credits to generate this design. Please purchase credits.`);
      return;
    }

    generateMutation.mutate();
  };

  const handleAddColor = () => {
    if (colorInput && !colors.includes(colorInput)) {
      setColors([...colors, colorInput]);
      setColorInput("");
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'design'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Design downloaded!");
    } catch (error) {
      toast.error("Error downloading");
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Fashion Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="grid lg:grid-cols-2 gap-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Clothing Generator
              </CardTitle>
              <CardDescription>
                Create unique clothing designs with AI
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              {credits ? `${credits.credits_remaining} AI credits` : 'Loading...'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Design Name *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer wedding dress"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed design description, details, style..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Style *</Label>
              <Select value={styleId} onValueChange={setStyleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles?.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Material *</Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials?.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quality ({creditsMap[qualityLevel]} credits)</Label>
            <Select value={qualityLevel} onValueChange={(v: any) => setQualityLevel(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (50 credits)</SelectItem>
                <SelectItem value="detailed">Detailed (100 credits)</SelectItem>
                <SelectItem value="premium">Premium (200 credits)</SelectItem>
                <SelectItem value="collection">Collection (400 credits)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Colors</Label>
            <div className="flex gap-2">
              <Input
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="e.g. blue, red..."
              />
              <Button type="button" onClick={handleAddColor} variant="outline">
                Add
              </Button>
            </div>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((color, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                    {color}
                    <button
                      onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                      className="ml-2 text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="public">Public design</Label>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={
              generateMutation.isPending || 
              !title || 
              !categoryId || 
              !styleId || 
              !materialId ||
              !credits ||
              credits.credits_remaining < 5
            }
            className="w-full gap-2"
            size="lg"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Design
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Design Preview</CardTitle>
          <CardDescription>
            {generatedDesign ? "Your generated design" : "Your design will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedDesign ? (
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={generatedDesign.image_url}
                  alt={generatedDesign.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{generatedDesign.title}</h3>
                {generatedDesign.description && (
                  <p className="text-sm text-muted-foreground">{generatedDesign.description}</p>
                )}
                <Button 
                  onClick={() => handleDownload(generatedDesign.image_url)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center space-y-2">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Fill out the form and generate a design</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}