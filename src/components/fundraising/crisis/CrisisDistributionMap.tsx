import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Package, Plus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Point {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  items_distributed: number;
  status: string;
}

interface Props {
  campaignId: string;
  ownerUserId: string;
}

export function CrisisDistributionMap({ campaignId, ownerUserId }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "", items_distributed: "0" });

  const load = async () => {
    const { data } = await supabase
      .from("crisis_distribution_points" as any)
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    setPoints((data as unknown as Point[]) || []);
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setIsOwner(data.user?.id === ownerUserId));
  }, [campaignId, ownerUserId]);

  const add = async () => {
    if (!form.name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("crisis_distribution_points" as any).insert({
      campaign_id: campaignId,
      added_by_user_id: user?.id,
      name: form.name.trim(),
      address: form.address.trim() || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      items_distributed: parseInt(form.items_distributed) || 0,
    });
    if (error) {
      toast({ title: "Could not add point", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ name: "", address: "", latitude: "", longitude: "", items_distributed: "0" });
    setShowForm(false);
    load();
  };

  const totalItems = points.reduce((s, p) => s + (p.items_distributed || 0), 0);

  if (points.length === 0 && !isOwner) return null;

  return (
    <>
      <FloatingHowItWorks title={"Crisis Distribution Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Crisis Distribution Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crisis Distribution Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Aid Distribution</h3>
        <Badge variant="outline" className="ml-2 gap-1">
          <Package className="w-3 h-3" /> {totalItems.toLocaleString()} items
        </Badge>
        {isOwner && (
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 mb-4 p-3 rounded-lg border bg-muted/20">
          <Input placeholder="Location name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <Input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
          <Input
            placeholder="Items distributed"
            type="number"
            value={form.items_distributed}
            onChange={(e) => setForm({ ...form, items_distributed: e.target.value })}
          />
          <Button size="sm" onClick={add} className="w-full">Add Distribution Point</Button>
        </div>
      )}

      {points.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No distribution points yet.</p>
      ) : (
        <ul className="space-y-2">
          {points.map((p) => {
            const hasCoords = p.latitude != null && p.longitude != null;
            return (
              <li key={p.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                  {p.address && <p className="text-xs text-muted-foreground truncate">{p.address}</p>}
                  <p className="text-xs text-muted-foreground">
                    {p.items_distributed.toLocaleString()} items distributed
                  </p>
                </div>
                {hasCoords && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${p.latitude}&mlon=${p.longitude}#map=15/${p.latitude}/${p.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    title="View on map"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
    </>
  );
}
