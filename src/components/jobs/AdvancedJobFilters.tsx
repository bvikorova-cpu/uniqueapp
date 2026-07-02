import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export interface AdvancedFiltersState {
  remote: boolean;
  fourDayWeek: boolean;
  equity: boolean;
  industry: string;
  companySize: string;
  fundingStage: string;
}

export const DEFAULT_ADVANCED: AdvancedFiltersState = {
  remote: false, fourDayWeek: false, equity: false,
  industry: "", companySize: "", fundingStage: "",
};

interface Props {
  value: AdvancedFiltersState;
  onChange: (v: AdvancedFiltersState) => void;
}

export function AdvancedJobFilters({ value, onChange }: Props) {
  const set = <K extends keyof AdvancedFiltersState>(k: K, v: AdvancedFiltersState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <>
      <FloatingHowItWorks title="How Advanced Job Filters works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <SlidersHorizontal className="h-4 w-4" /> Advanced filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center justify-between gap-2 text-sm">Remote-first <Switch checked={value.remote} onCheckedChange={v => set("remote", v)} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">4-day week <Switch checked={value.fourDayWeek} onCheckedChange={v => set("fourDayWeek", v)} /></label>
          <label className="flex items-center justify-between gap-2 text-sm">Equity <Switch checked={value.equity} onCheckedChange={v => set("equity", v)} /></label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={value.industry || "all"} onValueChange={v => set("industry", v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any industry</SelectItem>
              {["Tech","Finance","Healthcare","Education","Retail","Media","Manufacturing","Hospitality"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={value.companySize || "all"} onValueChange={v => set("companySize", v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Company size" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any size</SelectItem>
              {["1-10","11-50","51-200","201-500","501-1000","1000+"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={value.fundingStage || "all"} onValueChange={v => set("fundingStage", v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Funding stage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any stage</SelectItem>
              {["Bootstrapped","Pre-seed","Seed","Series A","Series B","Series C+","Public"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
    </>
    );
}
