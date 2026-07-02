import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const POSES = [
  "standing arms crossed, confident",
  "sitting cross-legged, relaxed",
  "running mid-stride, dynamic action",
  "jumping in mid-air, arms raised",
  "leaning against a wall, casual",
  "kneeling on one knee, hero pose",
  "dancing twirl, flowing movement",
  "meditating in lotus position",
];

export const PoseControlView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [prompt, setPrompt] = useState("");
  const [pose, setPose] = useState(POSES[0]);
  return (
    <>
      <FloatingHowItWorks title={"Pose Control View - How it works"} steps={[{ title: 'Open', desc: 'Access the Pose Control View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pose Control View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <SimpleAITool title="Pose Control" emoji="🤸" description="Generate a character in a specific, controlled pose." cost={4} action="pose_control" buttonLabel="Generate with Pose" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!prompt.trim()) { toast.error("Subject required"); return null; } return { prompt, pose }; }}>
      <label className="text-sm font-bold block">Subject</label>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., a samurai warrior in red armor on a misty mountain" rows={2} className="resize-none" />
      <label className="text-sm font-bold block mt-2">Pose</label>
      <Select value={pose} onValueChange={setPose}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{POSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
      </Select>
    </SimpleAITool>
    </>
  );
};
