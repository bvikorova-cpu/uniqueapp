import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Building, Loader2, Camera, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface VirtualRoomStagingProps {
  subscription: any;
  onBack: () => void;
}

export function VirtualRoomStaging({ subscription, onBack }: VirtualRoomStagingProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [roomType, setRoomType] = useState("");
  const [stagingStyle, setStagingStyle] = useState("");
  const [propertyType, setPropertyType] = useState("");
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

      const { data, error } = await supabase.functions.invoke('home-virtual-staging', {
        body: { originalImageUrl: publicUrl, roomType, stagingStyle, propertyType }
      });

      if (error) throw error;
      setResult(data.stagingData);
      toast({ title: "✨ Staging Plan Ready!", description: "Your virtual staging plan is complete" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasSubscription = subscription?.subscribed || false;
  const plan = result?.staging_plan;

  return (
    <>
      <FloatingHowItWorks title="How Virtual Room Staging works" steps={[
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
            Virtual Room Staging
          </h2>
          <p className="text-muted-foreground">Stage empty rooms with AI for real estate listings</p>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Create Staging Plan</CardTitle>
          <CardDescription>12 credits per staging</CardDescription>
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
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="dining">Dining Room</SelectItem>
                  <SelectItem value="office">Home Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Staging Style</Label>
              <Select value={stagingStyle} onValueChange={setStagingStyle}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contemporary">Contemporary</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="farmhouse">Farmhouse</SelectItem>
                  <SelectItem value="coastal">Coastal</SelectItem>
                  <SelectItem value="mid-century">Mid-Century Modern</SelectItem>
                  <SelectItem value="transitional">Transitional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!hasSubscription ? (
            <Card className="bg-muted/50 p-6 text-center">
              <Building className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Pro Designer Required</h3>
              <p className="text-muted-foreground text-sm">Subscribe to access virtual staging</p>
            </Card>
          ) : (
            <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Staging Plan...</> : <><Building className="mr-2 h-5 w-5" /> Generate Staging Plan</>}
            </Button>
          )}
        </CardContent>
      </Card>

      {plan && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {plan.furniture_placement?.length > 0 && (
            <Card className="backdrop-blur-xl bg-card/80">
              <CardHeader><CardTitle>Furniture Placement</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.furniture_placement.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{idx + 1}</div>
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">{item.position}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.purpose}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.lighting_plan && (
              <Card className="backdrop-blur-xl bg-card/80">
                <CardContent className="pt-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-2"><Camera className="h-4 w-4 text-primary" /> Lighting Plan</h4>
                  <p className="text-sm text-muted-foreground">{plan.lighting_plan}</p>
                </CardContent>
              </Card>
            )}
            {plan.roi_estimate && (
              <Card className="backdrop-blur-xl bg-card/80">
                <CardContent className="pt-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-primary" /> ROI Estimate</h4>
                  <p className="text-sm text-muted-foreground">{plan.roi_estimate}</p>
                  {plan.estimated_staging_cost && <p className="text-xs text-muted-foreground mt-1">Est. cost: {plan.estimated_staging_cost}</p>}
                </CardContent>
              </Card>
            )}
          </div>

          {plan.photography_tips && (
            <Card className="backdrop-blur-xl bg-card/80">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Photography Tips</h4>
                <p className="text-sm text-muted-foreground">{plan.photography_tips}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </motion.div>
    </>
    );
}
