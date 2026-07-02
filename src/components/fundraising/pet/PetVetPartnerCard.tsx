import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, ShieldCheck, Phone, FileText } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  clinicName?: string | null;
  contact?: string | null;
  licenseNumber?: string | null;
  verified?: boolean;
}

export function PetVetPartnerCard({ clinicName, contact, licenseNumber, verified }: Props) {
  if (!clinicName) return null;

  return (
    <>
      <FloatingHowItWorks title={"Pet Vet Partner Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Pet Vet Partner Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pet Vet Partner Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className={`p-4 border-2 ${verified ? "border-green-500/40 bg-green-500/5" : "border-border"}`}>
      <div className="flex items-start gap-3">
        <Stethoscope className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold text-sm">Veterinary Partner</h4>
            {verified && (
              <Badge variant="default" className="text-xs gap-1 bg-green-600 hover:bg-green-700">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium">{clinicName}</p>
          {contact && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3" /> {contact}
            </p>
          )}
          {licenseNumber && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" /> License #{licenseNumber}
            </p>
          )}
          {!verified && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Clinic credentials pending verification by our team.
            </p>
          )}
        </div>
      </div>
    </Card>
    </>
  );
}
