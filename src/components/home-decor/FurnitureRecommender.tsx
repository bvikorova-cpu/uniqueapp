import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Armchair, Loader2, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface FurnitureRecommenderProps {
  subscription: any;
  onBack: () => void;
}

export function FurnitureRecommender({ subscription, onBack }: FurnitureRecommenderProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast({ title: "Missing Photo", description: "Please upload a room photo", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in");

      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('home-designs').upload(fileName, selectedImage);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('home-designs').getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke('home-furniture-recommender', {
        body: { roomImageUrl: publicUrl, roomType, style, budget }
      });

      if (error) throw error;
      setResult(data.recommendations);
      toast({ title: "✨ Recommendations Ready!", description: "Your furniture picks are here" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasSubscription = subscription?.subscribed || false;
  const priorityColors: Record<string, string> = {
    essential: "bg-red-500/10 text-red-500",
    recommended: "bg-yellow-500/10 text-yellow-500",
    optional: "bg-green-500/10 text-green-500",
  };

  return (
    <>
      <FloatingHowItWorks title="How Furniture Recommender works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Furniture Recommender
          </h2>
          <p className="text-muted-foreground">Get personalized furniture suggestions for your room</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Armchair className="h-5 w-5 text-primary" /> Get Recommendations</CardTitle>
          <CardDescription>10 credits per analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Room Photo *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-3">
                  <img src={imagePreview} alt="Room" className="max-w-full h-48 object-contain mx-auto rounded-lg" />
                  <Button variant="outline" size="sm" onClick={() => { setSelectedImage(null); setImagePreview(""); }}>Change</Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <Input type="file" accept="image/*" onChange={handleImageSelect} className="max-w-xs mx-auto" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="living-room">Living Room</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="dining">Dining Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="scandinavian">Scandinavian</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="bohemian">Bohemian</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Budget-Friendly</SelectItem>
                  <SelectItem value="medium">Mid-Range</SelectItem>
                  <SelectItem value="high">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!hasSubscription ? (
            <Card className="bg-muted/50 p-6 text-center">
              <Armchair className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Pro Designer Required</h3>
              <p className="text-muted-foreground text-sm">Subscribe to get AI furniture recommendations</p>
            </Card>
          ) : (
            <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Room...</> : <><Armchair className="mr-2 h-5 w-5" /> Get Recommendations</>}
            </Button>
          )}
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="backdrop-blur-xl bg-card/80">
            <CardHeader><CardTitle>Furniture Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {result.recommendations?.map((item: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <Badge variant="secondary" className="mt-1">{item.category}</Badge>
                        </div>
                        {item.priority && (
                          <Badge className={priorityColors[item.priority] || ""}>{item.priority}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        {item.estimated_price && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{item.estimated_price}</span>}
                        {item.where_to_buy && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.where_to_buy}</span>}
                        {item.dimensions && <span>{item.dimensions}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {result.layout_tips && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Layout Tips</h4>
                  <p className="text-sm text-muted-foreground">{result.layout_tips}</p>
                </div>
              )}

              {result.space_optimization && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Space Optimization</h4>
                  <p className="text-sm text-muted-foreground">{result.space_optimization}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
    );
}
