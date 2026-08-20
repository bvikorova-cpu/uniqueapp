import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InfoHintProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

/** Small "i" hint that opens on click/tap and stays open until dismissed. */
export const InfoHint = ({ label, children, className }: InfoHintProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={`p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 ${className ?? ""}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
    </PopoverTrigger>
    <PopoverContent side="top" align="center" className="max-w-[240px] text-xs leading-relaxed">
      {children}
    </PopoverContent>
  </Popover>
);

export default InfoHint;
