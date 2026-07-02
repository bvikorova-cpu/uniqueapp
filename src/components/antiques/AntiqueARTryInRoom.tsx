import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export const AntiqueARTryInRoom = () => {
  const [antiqueFile, setAntiqueFile] = useState<File | null>(null);
  const [roomFile, setRoomFile] = useState<File | null>(null);
  const [antiquePreview, setAntiquePreview] = useState("");
  const [roomPreview, setRoomPreview] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { credits } = useAntiqueCredits();

  const handleAntiqueSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAntiqueFile(file); setAntiquePreview(URL.createObjectURL(file)); setResult(null); }
  };

  const handleRoomSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setRoomFile(file); setRoomPreview(URL.createObjectURL(file)); }
  };

  const handleAnalyze = async () => {
    if (!antiqueFile || !roomFile) { toast.error("Please upload both photos"); return; }
    try {
      setIsAnalyzing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const uploadFile = async (file: File) => {
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('antiques').upload(fileName, file);
        if (error) throw error;
        return supabase.storage.from('antiques').getPublicUrl(fileName).data.publicUrl;
      };

      const [antiqueUrl, roomUrl] = await Promise.all([uploadFile(antiqueFile), uploadFile(roomFile)]);

      const { data, error: fnError } = await supabase.functions.invoke('antique-ar-room', {
        body: { antiqueImageUrl: antiqueUrl, roomImageUrl: roomUrl }
      });
      if (fnError) throw fnError;
      setResult(data.analysis);
      toast.success("AR room analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Error analyzing");
    } finally { setIsAnalyzing(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Antique ARTry In Room works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-violet-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-violet-500" /> AR Try-In-Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload your antique and a room photo to get AI placement recommendations, style compatibility analysis, and interior design tips. <strong>Cost: 8 credits</strong>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-2">Antique Photo</p>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {antiquePreview ? (
                    <img src={antiquePreview} alt="Antique" className="w-full h-full object-cover" />
                  ) : (
                    <label htmlFor="ar-antique" className="text-center cursor-pointer p-4">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Select antique</p>
                      <input id="ar-antique" type="file" accept="image/*" className="hidden" onChange={handleAntiqueSelect} />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2">Room Photo</p>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {roomPreview ? (
                    <img src={roomPreview} alt="Room" className="w-full h-full object-cover" />
                  ) : (
                    <label htmlFor="ar-room" className="text-center cursor-pointer p-4">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Select room</p>
                      <input id="ar-room" type="file" accept="image/*" className="hidden" onChange={handleRoomSelect} />
                    </label>
                  )}
                </div>
              </div>
            </div>
            {antiqueFile && roomFile && (
              <Button className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || !credits || credits.credits_remaining < 8}>
                {isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : "Analyze Placement (8 credits)"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl">
            <CardHeader><CardTitle>Room Placement Report</CardTitle></CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
    </>
    );
};
