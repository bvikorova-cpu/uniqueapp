import { PawPrint } from "lucide-react";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { Badge } from "@/components/ui/badge";

export default function PetActiveSwitcher() {
  const { pets, active, setActive, loading } = usePetProfiles();

  if (loading) return null;
  if (pets.length === 0) {
    return (
      <Badge variant="outline" className="h-9 px-3 gap-1 text-xs">
        <PawPrint className="w-3.5 h-3.5" /> No pet — add one in My Pets
      </Badge>
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
