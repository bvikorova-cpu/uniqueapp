import { PawPrint } from "lucide-react";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function PetActiveSwitcher() {
  const { pets, active, setActive, loading } = usePetProfiles();

  if (loading) return null;
  if (pets.length === 0) {
    return (
      <>
        <FloatingHowItWorks title="How Pet Active Switcher works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
        <Badge variant="outline" className="h-9 px-3 gap-1 text-xs">
        <PawPrint className="w-3.5 h-3.5" /> No pet — add one in My Pets
      </Badge>
      </>
      );
  }

  return (
    <div className="flex items-center gap-2 h-9 px-2 rounded-md border bg-background/60">
      <PawPrint className="w-4 h-4 text-primary" />
      <select
        value={active?.id || ""}
        onChange={(e) => setActive(e.target.value)}
        className="bg-transparent text-sm font-medium outline-none pr-1 max-w-[140px] truncate"
        aria-label="Active pet"
      >
        {pets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.species}
          </option>
        ))}
      </select>
    </div>
  );
}
