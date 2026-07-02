import { useRef, useState } from "react";
import { Camera, Loader2, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useTutoringCredits } from "@/hooks/useTutoringCredits";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const PhotoMathSolver = () => {
  const { credits, spendCredit, refundCredit, isUsingCredit } = useTutoringCredits();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Max 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
    setSolution(null);
  };

  const solve = async () => {
    if (!imageUrl) {
      toast.error("Upload a photo first");
      return;
    }
    if (credits < 1) {
      toast.error("Out of tutoring credits");
      return;
    }
    setLoading(true);
    setSolution(null);
    let credited = false;
    try {
      await spendCredit();
      credited = true;
      const { data, error } = await supabase.functions.invoke("education-ai", {
        body: { action: "photo_math", imageDataUrl: imageUrl, question },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setSolution((data as any).solution || "");
    } catch (e: any) {
      if (credited) await refundCredit("photo-math-solve failed");
      toast.error(e?.message || "Failed to solve");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Photo Math Solver works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5 text-primary" /> Photo Math Solver
          <span className="ml-auto text-xs text-muted-foreground font-normal">1 credit</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />

        {!imageUrl ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full p-8 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 transition flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-primary" />
            <p className="font-semibold">Take photo or upload image</p>
            <p className="text-xs text-muted-foreground">Math problem, equation, geometry...</p>
          </button>
        ) : (
          <div className="space-y-2">
            <img src={imageUrl} alt="Math problem" className="max-h-64 rounded-lg border mx-auto" />
            <Button variant="ghost" size="sm" onClick={() => { setImageUrl(null); setSolution(null); }}>
              Choose different image
            </Button>
          </div>
        )}

        <Textarea
          placeholder="Optional: clarify the question (e.g. 'solve for x', 'find the area')"
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 300))}
          rows={2}
        />

        <Button onClick={solve} disabled={loading || isUsingCredit || !imageUrl} className="w-full gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Solving..." : "Solve step by step"}
        </Button>

        {solution && (
          <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg bg-muted/40 border">
            <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
              {solution}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default PhotoMathSolver;
