import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeartHandshake, CheckCircle2, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useCharityBeneficiary, type CharityModule } from "@/hooks/useCharityBeneficiary";

interface Props {
  module: CharityModule;
  /** Optional accent for the title badge. */
  label?: string;
}

const TYPE_LABEL: Record<string, string> = {
  animal_shelter: "Animal shelter",
  childrens_home: "Children's home",
};

export default function CharityBeneficiaryCard({ module, label }: Props) {
  const { beneficiary, loading, save } = useCharityBeneficiary(module);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orgType, setOrgType] = useState<"animal_shelter" | "childrens_home">("animal_shelter");
  const [orgName, setOrgName] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgIban, setOrgIban] = useState("");

  useEffect(() => {
    if (beneficiary) {
      setOrgType(beneficiary.org_type);
      setOrgName(beneficiary.org_name);
      setOrgCity(beneficiary.org_city || "");
      setOrgWebsite(beneficiary.org_website || "");
      setOrgIban(beneficiary.org_iban || "");
    }
  }, [beneficiary]);

  const submit = async () => {
    if (orgName.trim().length < 3) {
      toast.error("Enter the full name of the shelter or children's home");
      return;
    }
    setSaving(true);
    try {
      await save({ org_type: orgType, org_name: orgName, org_city: orgCity, org_website: orgWebsite, org_iban: orgIban });
      toast.success("Charity beneficiary saved");
      setEditing(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const showForm = editing || (!loading && !beneficiary);

  return (
    <Card className="border-pink-300/50 dark:border-pink-900/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <HeartHandshake className="h-5 w-5 text-pink-500" />
          Your charity beneficiary
          {beneficiary ? (
            <Badge className="bg-emerald-600">Required · done</Badge>
          ) : (
            <Badge variant="destructive">Required</Badge>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {label || "Every winner shares the prize"}: <b>50% you</b> · <b>20% your chosen animal shelter or children's home</b> · 30% platform.
          Choose the organisation before your first entry — it cannot be skipped.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : showForm ? (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Type of organisation</Label>
              <Select value={orgType} onValueChange={(v) => setOrgType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="animal_shelter">Animal shelter</SelectItem>
                  <SelectItem value="childrens_home">Children's home</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Official name *</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Happy Paws Shelter" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">City / region</Label>
                <Input value={orgCity} onChange={(e) => setOrgCity(e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Website or social page</Label>
                <Input value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">IBAN for the donation</Label>
                <Input value={orgIban} onChange={(e) => setOrgIban(e.target.value)} placeholder="IBAN" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={submit} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save beneficiary"}
              </Button>
              {beneficiary && (
                <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-start justify-between gap-3 rounded-lg bg-muted/60 p-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="truncate">{beneficiary!.org_name}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {TYPE_LABEL[beneficiary!.org_type]}
                {beneficiary!.org_city ? ` · ${beneficiary!.org_city}` : ""}
                {beneficiary!.org_iban ? " · IBAN saved" : " · IBAN missing"}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Change
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
