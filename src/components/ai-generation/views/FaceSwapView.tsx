import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const FaceSwapView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [scene, setScene] = useState("");
  const [face, setFace] = useState("");
  return (
    <>
      <FloatingHowItWorks title={"Face Swap View - How it works"} steps={[{ title: 'Open', desc: 'Access the Face Swap View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Face Swap View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="Face Swap" emoji="🎭" description="Generate portraits with a target face described in words." cost={4} action="face_swap" buttonLabel="Swap Face" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!scene.trim()) { toast.error("Scene required"); return null; } return { prompt: scene, referencePrompt: face }; }}>
      <label className="text-sm font-bold block">Scene / portrait composition</label>
      <Textarea value={scene} onChange={(e) => setScene(e.target.value)} placeholder="e.g., business headshot in a modern office" rows={2} className="resize-none" />
      <label className="text-sm font-bold block mt-2">Face description</label>
      <Textarea value={face} onChange={(e) => setFace(e.target.value)} placeholder="e.g., 35yo Latina woman, curly dark hair, warm smile, brown eyes" rows={2} className="resize-none" />
    </SimpleAITool>
    </>
  );
};
