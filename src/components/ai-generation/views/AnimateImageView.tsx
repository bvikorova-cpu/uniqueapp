import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";

export const AnimateImageView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [prompt, setPrompt] = useState("");
  return (
    <SimpleAITool title="Animate Image" emoji="🎬" description="Generate a dynamic motion-keyframe (full video animation coming soon)." cost={6} action="animate_image" buttonLabel="Create Motion Frame" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!prompt.trim()) { toast.error("Animation prompt required"); return null; } return { prompt, aspectRatio: "16:9" }; }}>
      <label className="text-sm font-bold block">Describe the animation</label>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., a horse galloping across a beach at sunrise, waves crashing" rows={3} className="resize-none" />
      <p className="text-xs text-muted-foreground">Currently renders a high-energy keyframe. Full mp4 motion synthesis is on the roadmap.</p>
    </SimpleAITool>
  );
};
