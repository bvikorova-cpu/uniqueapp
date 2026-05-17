import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, ShieldCheck, Plus, Handshake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Partner {
  id: string;
  name: string;
  role: string | null;
  logo_url: string | null;
  website_url: string | null;
  verified: boolean;
}

interface Props {
  campaignId: string;
  ownerUserId: string;
}

export function CrisisPartnersList({ campaignId, ownerUserId }: Props) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", logo_url: "", website_url: "" });

  const load = async () => {
    const { data } = await supabase
      .from("crisis_partner_orgs" as any)
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    setPartners((data as unknown as Partner[]) || []);
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setIsOwner(data.user?.id === ownerUserId));
  }, [campaignId, ownerUserId]);

  const add = async () => {
    if (!form.name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("crisis_partner_orgs" as any).insert({
      campaign_id: campaignId,
      added_by_user_id: user?.id,
      name: form.name.trim(),
      role: form.role.trim() || null,
      logo_url: form.logo_url.trim() || null,
      website_url: form.website_url.trim() || null,
    });
    if (error) {
      toast({ title: "Could not add partner", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ name: "", role: "", logo_url: "", website_url: "" });
    setShowForm(false);
    load();
  };

  if (partners.length === 0 && !isOwner) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Handshake className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Partner Organizations</h3>
        {isOwner && (
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 mb-4 p-3 rounded-lg border bg-muted/20">
          <Input placeholder="Organization name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Role (e.g. Logistics partner)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input placeholder="Logo URL" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
          <Input placeholder="Website" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
          <Button size="sm" onClick={add} className="w-full">Add Partner</Button>
        </div>
      )}

      {partners.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No partners listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.name} className="w-10 h-10 rounded object-cover shrink-0" loading="lazy" />
              ) : (
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold">
                  {p.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  {p.verified && <ShieldCheck className="w-3 h-3 text-green-600 shrink-0" />}
                </div>
                {p.role && <p className="text-xs text-muted-foreground truncate">{p.role}</p>}
              </div>
              {p.website_url && (
                <a href={p.website_url} target="_blank" rel="noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
