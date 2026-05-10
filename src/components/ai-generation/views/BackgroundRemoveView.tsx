import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SimpleAITool } from "./SimpleAITool";

export const BackgroundRemoveView = ({ onCreditsUsed }: { onCreditsUsed: () => void }) => {
  const [subject, setSubject] = useState("");
  return (
    <SimpleAITool title="Background Remove" emoji="✂️" description="Isolate any subject onto a clean background — perfect for product shots & avatars." cost={2} action="bg_remove" buttonLabel="Remove Background" onCreditsUsed={onCreditsUsed}
      buildBody={() => { if (!subject.trim()) { toast.error("Describe your subject"); return null; } return { prompt: subject }; }}>
      <label className="text-sm font-bold block">Describe the subject to isolate</label>
      <Textarea value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., a red leather handbag with gold buckle" rows={3} className="resize-none" />
    </SimpleAITool>
  );
};
