import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileCheck, Plus, Ban, Trash2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface License {
  id: string;
  user_id: string;
  content_item_id: string;
  license_type: "standard" | "extended" | "editorial";
  price_paid: number;
  currency: string;
  purchase_reference: string | null;
  valid_from: string;
  valid_until: string | null;
  status: "active" | "revoked" | "expired";
  notes: string | null;
  created_at: string;
}

const LICENSE_DESCRIPTIONS: Record<string, string> = {
  standard: "Personal & small commercial use, up to 500k impressions",
  extended: "Unlimited commercial, merchandise, resale rights",
  editorial: "News, blogs, non-commercial editorial use only",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/30",
  revoked: "bg-red-500/10 text-red-500 border-red-500/30",
  expired: "bg-gray-500/10 text-gray-500 border-gray-500/30",
};

export function LicenseManagerView({ onBack }: { onBack: () => void }) {
  const { isAdmin } = useIsAdmin();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<License | null>(null);

  // form
  const [contentId, setContentId] = useState("");
  const [licenseType, setLicenseType] = useState<License["license_type"]>("standard");
  const [pricePaid, setPricePaid] = useState("0");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stock_licenses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setLicenses((data || []) as License[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setContentId("");
    setLicenseType("standard");
    setPricePaid("0");
    setValidUntil("");
    setNotes("");
  };

  const handleAdd = async () => {
    if (!contentId.trim()) {
      toast.error("Content item ID is required");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login first");
      return;
    }
    const { error } = await supabase.from("stock_licenses").insert({
      user_id: user.id,
      content_item_id: contentId.trim(),
      license_type: licenseType,
      price_paid: parseFloat(pricePaid) || 0,
      currency: "EUR",
      valid_until: validUntil || null,
      notes: notes || null,
      status: "active",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("License added");
    resetForm();
    setAddOpen(false);
    load();
  };

  const handleStatusChange = async (id: string, status: License["status"]) => {
    const { error } = await supabase
      .from("stock_licenses")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Licencia: ${status}`);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this license?")) return;
    const { error } = await supabase.from("stock_licenses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("License deleted");
    load();
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const { error } = await supabase
      .from("stock_licenses")
      .update({
        license_type: editing.license_type,
        price_paid: editing.price_paid,
        valid_until: editing.valid_until,
        notes: editing.notes,
        status: editing.status,
      })
      .eq("id", editing.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saved");
    setEditing(null);
    load();
  };

  return (
    <>
      <FloatingHowItWorks title={"License Manager View - How it works"} steps={[{ title: 'Open', desc: 'Access the License Manager View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in License Manager View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-orange-500" /> License Manager
          </h2>
          <Badge variant="secondary">{licenses.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RotateCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add license
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["standard", "extended", "editorial"] as const).map((t) => (
          <Card key={t} className="p-4">
            <div className="font-semibold capitalize mb-1">{t}</div>
            <p className="text-xs text-muted-foreground">{LICENSE_DESCRIPTIONS[t]}</p>
            <div className="text-2xl font-bold mt-2">
              {licenses.filter((l) => l.license_type === t && l.status === "active").length}
              <span className="text-sm font-normal text-muted-foreground ml-1">active</span>
            </div>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-muted-foreground">Loading...</Card>
      ) : licenses.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No licenses. Add the first one by clicking "Add license".
        </Card>
      ) : (
        <div className="space-y-2">
          {licenses.map((l) => (
            <Card key={l.id} className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="capitalize">{l.license_type}</Badge>
                    <Badge variant="outline" className={STATUS_COLORS[l.status]}>
                      {l.status}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {l.price_paid.toFixed(2)} {l.currency}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Item: <code className="font-mono">{l.content_item_id.slice(0, 8)}…</code>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Valid from: {new Date(l.valid_from).toLocaleDateString()}
                    {l.valid_until ? ` → ${new Date(l.valid_until).toLocaleDateString()}` : " → no expiration"}
                  </div>
                  {l.notes && (
                    <p className="text-xs italic mt-1 text-muted-foreground">"{l.notes}"</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setEditing(l)}>
                        Edit
                      </Button>
                      {l.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(l.id, "revoked")}
                        >
                          <Ban className="w-3 h-3 mr-1" /> Revoke
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(l.id, "active")}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(l.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add license</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Content Item ID</Label>
              <Input value={contentId} onChange={(e) => setContentId(e.target.value)} placeholder="UUID obsahu" />
            </div>
            <div>
              <Label>Typ licencie</Label>
              <Select value={licenseType} onValueChange={(v) => setLicenseType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="extended">Extended</SelectItem>
                  <SelectItem value="editorial">Editorial</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{LICENSE_DESCRIPTIONS[licenseType]}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Cena (EUR)</Label>
                <Input type="number" step="0.01" value={pricePaid} onChange={(e) => setPricePaid(e.target.value)} />
              </div>
              <div>
                <Label>Valid until (optional)</Label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit license</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Typ</Label>
                <Select
                  value={editing.license_type}
                  onValueChange={(v) => setEditing({ ...editing, license_type: v as any })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="extended">Extended</SelectItem>
                    <SelectItem value="editorial">Editorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v) => setEditing({ ...editing, status: v as any })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cena</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editing.price_paid}
                  onChange={(e) => setEditing({ ...editing, price_paid: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Valid until</Label>
                <Input
                  type="date"
                  value={editing.valid_until ? editing.valid_until.slice(0, 10) : ""}
                  onChange={(e) => setEditing({ ...editing, valid_until: e.target.value || null })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editing.notes || ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
