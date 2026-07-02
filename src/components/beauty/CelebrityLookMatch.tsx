import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crown, ArrowLeft, Upload, Image as ImageIcon, Star } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface CelebrityLookMatchProps {
  onBack: () => void;
}

export const CelebrityLookMatch = ({ onBack }: CelebrityLookMatchProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [gender, setGender] = useState("female");
  const [style, setStyle] = useState("glamorous");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { credits, refresh } = useAICredits();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { toast.error("Please select an image"); return; }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setImageUrl("");
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return null; }
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('beauty-photos').upload(fileName, imageFile);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('beauty-photos').getPublicUrl(fileName);
      return publicUrl;
    } catch { toast.error("Upload failed"); return null; }
    finally { setUploading(false); }
  };

  const handleMatch = async () => {
    let finalUrl = imageUrl;
    if (imageFile) { const url = await uploadImage(); if (!url) return; finalUrl = url; }
    if (!finalUrl) { toast.error("Please upload a photo or enter URL"); return; }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke('beauty-celebrity-match', {
        body: { imageUrl: finalUrl, gender, style }
      });
      if (error) throw error;
      setResult(data.matchResult);
      refresh();
      toast.success("Celebrity match found!");
    } catch (error: any) {
      toast.error(error.message || "Match failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Celebrity Look Match works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-pink-500/20">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Celebrity Look Match
          </h2>
          <p className="text-muted-foreground mb-6">Find your celebrity twin & recreate their signature look • 10 Credits</p>

          <div className="space-y-4">
            <div>
              <Label>Upload Your Photo</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full max-w-xs rounded-lg" />}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input placeholder="Enter image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} disabled={!!imageFile} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="non-binary">Non-Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Style Preference</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glamorous">Glamorous</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="edgy">Edgy</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="bohemian">Bohemian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleMatch} disabled={loading || uploading || (credits?.credits_remaining ?? 0) < 10} className="w-full">
              {uploading ? "Uploading..." : loading ? "Finding match..." : "Find My Celebrity Twin (10 Credits)"}
            </Button>
            {credits && <p className="text-sm text-muted-foreground">Credits: {credits.credits_remaining}</p>}
          </div>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {result.topMatch && (
            <Card className="p-6 bg-gradient-to-r from-yellow-500/10 via-pink-500/10 to-purple-500/10 border-yellow-500/20">
              <div className="flex items-center gap-4">
                <Crown className="h-10 w-10 text-yellow-500" />
                <div>
                  <h3 className="text-2xl font-black">{result.topMatch.celebrity}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-bold text-primary">{result.topMatch.similarityScore}% Match</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mt-3">{result.topMatch.signatureLook}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {result.topMatch.matchReasons?.map((r: string, i: number) => (
                  <span key={i} className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full">{r}</span>
                ))}
              </div>
            </Card>
          )}

          {result.alternativeMatches?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3">🌟 Alternative Matches</h3>
              <div className="space-y-2">
                {result.alternativeMatches.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <span className="font-semibold">{m.celebrity}</span>
                    <span className="text-sm text-primary">{m.similarityScore}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {result.lookRecreation?.steps?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3">💄 Recreate The Look</h3>
              <p className="text-sm text-muted-foreground mb-4">{result.lookRecreation.overview}</p>
              <ol className="space-y-3">
                {result.lookRecreation.steps.map((s: any) => (
                  <li key={s.step} className="flex gap-3">
                    <span className="font-bold text-pink-500">{s.step}</span>
                    <div>
                      <p className="font-semibold">{s.area}</p>
                      <p className="text-sm text-muted-foreground">{s.technique}</p>
                      {s.products?.length > 0 && (
                        <p className="text-xs text-primary mt-1">Products: {s.products.join(", ")}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {result.productList?.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-3">🛍️ Shopping List</h3>
              <div className="space-y-2 text-sm">
                {result.productList.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-background/50">
                    <div>
                      <span className="font-semibold">{p.product}</span> <span className="text-muted-foreground">by {p.brand}</span>
                    </div>
                    <span className="text-muted-foreground">{p.priceRange}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
    </>
    );
};
