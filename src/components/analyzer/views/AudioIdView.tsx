import { Music } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";

export const AudioIdView = ({ onBack }: { onBack: () => void }) => (
  <AnalyzerToolLayout
    title="Sound & Music ID"
    description="Identify sounds, bird calls, music — from your description"
    icon={<Music className="w-7 h-7" />}
    action="audio-id"
    creditCost={3}
    placeholder="Describe the sound — e.g. high-pitched chirping every few seconds in trees, late spring evening"
    gradient="from-rose-600 to-orange-600"
    onBack={onBack}
    buildBody={(input) => ({ description: input })}
  />
);
