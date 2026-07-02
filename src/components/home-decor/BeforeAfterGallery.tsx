import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, Heart, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface BeforeAfterGalleryProps {
  onBack: () => void;
}

export function BeforeAfterGallery({ onBack }: BeforeAfterGalleryProps) {
  const { toast } = useToast();
  const [transformations, setTransformations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");

  useEffect(() => {
    loadTransformations();
  }, []);

  const loadTransformations = async () => {
    const { data, error } = await supabase
      .from("home_transformations")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) setTransformations(data || []);
    setLoading(false);
  };

  const handleFileSelect = (setter: (f: File | null) => void, previewSetter: (s: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!beforeFile || !afterFile || !title) {
      toast({ title: "Missing Info", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in");

      const uploadFile = async (file: File, prefix: string) => {
        const ext = file.name.split('.').pop();
        const name = `${user.id}/${prefix}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('home-designs').upload(name, file);
        if (error) throw error;
        return supabase.storage.from('home-designs').getPublicUrl(name).data.publicUrl;
      };

      const beforeUrl = await uploadFile(beforeFile, "before");
      const afterUrl = await uploadFile(afterFile, "after");

      const { error } = await supabase.from("home_transformations").insert({
        user_id: user.id,
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        title,
        description,
        room_type: roomType,
        style,
      });

      if (error) throw error;

      toast({ title: "✨ Published!", description: "Your transformation is now in the gallery" });
      setShowForm(false);
      setBeforeFile(null); setAfterFile(null); setBeforePreview(""); setAfterPreview("");
      setTitle(""); setDescription(""); setRoomType(""); setStyle("");
      loadTransformations();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Before After Gallery works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>← Back</Button>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Before & After Gallery
            </h2>
            <p className="text-muted-foreground">Community room transformations</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Share Yours
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
            <CardHeader>
              <CardTitle>Share Your Transformation</CardTitle>
              <CardDescription>Show the community your room makeover</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Before Photo *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {beforePreview ? (
                      <img src={beforePreview} alt="Before" className="h-32 object-contain mx-auto rounded" />
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Input type="file" accept="image/*" onChange={handleFileSelect(setBeforeFile, setBeforePreview)} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>After Photo *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {afterPreview ? (
                      <img src={afterPreview} alt="After" className="h-32 object-contain mx-auto rounded" />
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Input type="file" accept="image/*" onChange={handleFileSelect(setAfterFile, setAfterPreview)} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Modern Living Room Makeover" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your transformation..." rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living-room">Living Room</SelectItem>
                      <SelectItem value="bedroom">Bedroom</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="bathroom">Bathroom</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Publish Transformation"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
      ) : transformations.length === 0 ? (
        <Card className="backdrop-blur-xl bg-card/80">
          <CardContent className="pt-6 text-center">
            <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No transformations yet. Be the first to share!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transformations.map((t, idx) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="overflow-hidden backdrop-blur-xl bg-card/80 hover:shadow-xl transition-shadow">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={t.before_image_url} alt="Before" className="w-full h-full object-cover" />
                    <Badge className="absolute top-2 left-2 bg-black/60 text-white">Before</Badge>
                  </div>
                  <div className="relative aspect-video overflow-hidden">
                    <img src={t.after_image_url} alt="After" className="w-full h-full object-cover" />
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">After</Badge>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold">{t.title}</h3>
                  {t.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    {t.room_type && <Badge variant="secondary">{t.room_type}</Badge>}
                    {t.style && <Badge variant="outline">{t.style}</Badge>}
                    <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" /> {t.likes_count || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
    </>
    );
}
