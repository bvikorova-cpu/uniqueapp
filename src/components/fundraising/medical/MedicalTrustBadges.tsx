import { motion } from "framer-motion";
import { ShieldCheck, Building2, RefreshCcw, FileCheck2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  verified?: boolean | null;
  directToHospital?: boolean | null;
  refundGuarantee?: boolean | null;
  medicalDocumentsCount?: number;
}

/**
 * Trust badge cluster shown on Medical campaign detail page.
 * Communicates GoFundMe-style guarantees + Waggle-style direct-to-provider payout.
 */
export function MedicalTrustBadges({
  verified,
  directToHospital,
  refundGuarantee,
  medicalDocumentsCount = 0,
}: Props) {
  const badges = [
    {
      show: !!verified,
      icon: ShieldCheck,
      label: "Verified beneficiary",
      detail: "Patient identity & diagnosis verified by our medical team within 24h",
      color: "emerald",
    },
    {
      show: !!directToHospital,
      icon: Building2,
      label: "Direct-to-hospital",
      detail: "Funds go straight to the treating hospital, not to the patient",
      color: "blue",
    },
    {
      show: !!refundGuarantee,
      icon: RefreshCcw,
      label: "Refund guarantee",
      detail: "100% refund if the campaign is later proven fraudulent",
      color: "primary",
    },
    {
      show: medicalDocumentsCount > 0,
      icon: FileCheck2,
      label: `${medicalDocumentsCount} medical document${medicalDocumentsCount > 1 ? "s" : ""}`,
      detail: "Medical records, prescriptions and invoices were uploaded and reviewed",
      color: "amber",
    },
  ].filter((b) => b.show);

  if (badges.length === 0) return null;

  const colorClass = (c: string) =>
    ({
      emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
      primary: "bg-primary/10 text-primary border-primary/30",
      amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    }[c] || "bg-muted text-foreground border-border");

  return (
    <>
      <FloatingHowItWorks title={"Medical Trust Badges - How it works"} steps={[{ title: 'Open', desc: 'Access the Medical Trust Badges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Medical Trust Badges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <TooltipProvider delayDuration={150}>
      <div className="flex flex-wrap gap-2">
        {badges.map((b, i) => (
          <Tooltip key={b.label}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold cursor-help ${colorClass(b.color)}`}
              >
                <b.icon className="w-3.5 h-3.5" />
                {b.label}
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">
              {b.detail}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
    </>
  );
}
