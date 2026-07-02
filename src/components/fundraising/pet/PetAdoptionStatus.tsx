import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Home, Stethoscope, Clock, Sparkles, PawPrint } from "lucide-react";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  status: string;
  petName: string;
  adopterName?: string | null;
  adoptedAt?: string | null;
  intakeDate?: string | null;
}

const statusMeta: Record<string, { label: string; icon: any; tone: string; description: string }> = {
  in_treatment: { label: "In Treatment", icon: Stethoscope, tone: "bg-orange-500/10 text-orange-600 border-orange-500/30", description: "Currently receiving medical care." },
  available: { label: "Ready for Adoption", icon: PawPrint, tone: "bg-blue-500/10 text-blue-600 border-blue-500/30", description: "Healthy and waiting for a loving home." },
  pending_adoption: { label: "Pending Adoption", icon: Sparkles, tone: "bg-primary/10 text-primary border-primary/30", description: "Adoption in progress — final paperwork underway." },
  adopted: { label: "Adopted! 🎉", icon: Home, tone: "bg-green-500/10 text-green-600 border-green-500/30", description: "Found a forever home." },
  sanctuary: { label: "Sanctuary Care", icon: Heart, tone: "bg-purple-500/10 text-purple-600 border-purple-500/30", description: "Long-term care at a partner sanctuary." },
};

export function PetAdoptionStatus({ status, petName, adopterName, adoptedAt, intakeDate }: Props) {
  const meta = statusMeta[status] ?? statusMeta.in_treatment;
  const Icon = meta.icon;

  return (
    <>
      <FloatingHowItWorks title={"Pet Adoption Status - How it works"} steps={[{ title: 'Open', desc: 'Access the Pet Adoption Status section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pet Adoption Status.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className={`p-4 border-2 ${meta.tone}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-6 h-6 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold text-sm">Adoption Status</h4>
            <Badge variant="outline" className="text-xs">{meta.label}</Badge>
          </div>
          <p className="text-xs opacity-90 mb-2">{meta.description}</p>
          {status === "adopted" && adopterName && (
            <p className="text-xs">
              {petName} now lives with <strong>{adopterName}</strong>
              {adoptedAt && ` since ${format(new Date(adoptedAt), "MMM yyyy")}`}.
            </p>
          )}
          {intakeDate && status !== "adopted" && (
            <p className="text-xs opacity-75 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              In our care since {format(new Date(intakeDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
      </div>
    </Card>
    </>
  );
}
