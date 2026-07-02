import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const SketchToImageView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [sketch, setSketch] = useState("");
  const [target, setTarget] = useState("");
  return (
    <>
      <FloatingHowItWorks title={"Sketch To Image View - How it works"} steps={[{ title: 'Open', desc: 'Access the Sketch To Image View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Sketch To Image View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="Sketch to Image" emoji="✏️" description="Turn rough sketch concepts into polished, fully-rendered art." cost={4} action="sketch_to_image" buttonLabel="Render Sketch" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!sketch.trim() || !target.trim()) { toast.error("Fill both fields"); return null; } return { sketchDescription: sketch, prompt: target }; }}>
      <label className="text-sm font-bold block">Describe your sketch / concept</label>
      <Textarea value={sketch} onChange={(e) => setSketch(e.target.value)} placeholder="e.g., stick figure of a knight holding a sword, side profile" rows={2} className="resize-none" />
      <label className="text-sm font-bold block mt-2">Target style / finish</label>
      <Textarea value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g., dark fantasy oil painting, dramatic backlighting, ornate armor" rows={2} className="resize-none" />
    </SimpleAITool>
    </>
  );
};
