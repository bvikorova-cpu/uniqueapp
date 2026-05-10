import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";

export const FaceSwapView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [scene, setScene] = useState("");
  const [face, setFace] = useState("");
  return (
    <SimpleAITool title="Face Swap" emoji="🎭" description="Generate portraits with a target face described in words." cost={4} action="face_swap" buttonLabel="Swap Face" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!scene.trim()) { toast.error("Scene required"); return null; } return { prompt: scene, referencePrompt: face }; }}>
      <label className="text-sm font-bold block">Scene / portrait composition</label>
      <Textarea value={scene} onChange={(e) => setScene(e.target.value)} placeholder="e.g., business headshot in a modern office" rows={2} className="resize-none" />
      <label className="text-sm font-bold block mt-2">Face description</label>
      <Textarea value={face} onChange={(e) => setFace(e.target.value)} placeholder="e.g., 35yo Latina woman, curly dark hair, warm smile, brown eyes" rows={2} className="resize-none" />
    </SimpleAITool>
  );
};
