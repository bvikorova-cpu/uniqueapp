import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export interface OpenToWorkDetails {
  roles?: string[];
  remote?: boolean;
  note?: string;
}

export const OpenToWorkBadge = ({
  details,
  compact,
}: {
  details?: OpenToWorkDetails | null;
  compact?: boolean;
}) => {
  const roles = details?.roles?.filter(Boolean) || [];
  if (compact) {
    return (
    <>
      <FloatingHowItWorks title={"Open To Work - How it works"} steps={[{ title: 'Open', desc: 'Access the Open To Work section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Open To Work.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40 backdrop-blur-md">
        <Briefcase className="h-3 w-3 mr-1" />
        Open to work
      </Badge>
    </>
  );
  }
  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-md p-4 mb-6">
      <div className="flex items-center gap-2 mb-1.5">
        <Briefcase className="h-4 w-4 text-emerald-400" />
        <span className="font-semibold text-emerald-300">Open to new opportunities</span>
        {details?.remote && (
          <Badge variant="outline" className="ml-auto border-emerald-500/40 text-emerald-300 text-[10px]">
            Remote OK
          </Badge>
        )}
      </div>
      {roles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {roles.map((r) => (
            <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
          ))}
        </div>
      )}
      {details?.note && <p className="text-xs text-muted-foreground">{details.note}</p>}
    </div>
  );
};
