import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const HealthDisclaimerBanner = () => (
  <Alert className="border-primary/30 bg-primary/5">
    <ShieldAlert className="h-5 w-5 text-primary" />
    <AlertDescription className="text-sm leading-relaxed">
      Informačný nástroj: AI výstupy slúžia výhradne na edukačné a preventívne účely a nenahrádzajú
      odbornú lekársku diagnostiku.
    </AlertDescription>
  </Alert>
);

export default HealthDisclaimerBanner;
