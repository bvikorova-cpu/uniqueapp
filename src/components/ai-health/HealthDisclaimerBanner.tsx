import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const HealthDisclaimerBanner = () => (
  <Alert className="border-primary/30 bg-primary/5">
    <ShieldAlert className="h-5 w-5 text-primary" />
    <AlertDescription className="text-sm leading-relaxed">
      Informational tool only: AI outputs are for educational and preventive purposes and do not
      replace professional medical diagnosis.
    </AlertDescription>
  </Alert>
);

export default HealthDisclaimerBanner;
