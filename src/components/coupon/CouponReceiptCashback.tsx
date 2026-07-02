import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Receipt, Upload } from "lucide-react";
import { useCouponCashback } from "@/hooks/useCouponCashback";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CouponReceiptCashback() {
  const ref = useRef<HTMLInputElement>(null);
  const { uploading, result, uploadAndScan } = useCouponCashback();
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <FloatingHowItWorks title={"Coupon Receipt Cashback - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Receipt Cashback section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Receipt Cashback.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 space-y-3 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
      <div className="flex items-center gap-2">
        <Receipt className="w-5 h-5 text-emerald-500" />
        <h3 className="font-bold">Receipt Cashback</h3>
        <span className="text-xs text-muted-foreground ml-auto">5 AI credits · 2% back</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload your receipt. AI extracts items + total, you earn cashback after admin approval.
      </p>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => ref.current?.click()} className="gap-1.5 flex-1">
          <Upload className="w-3.5 h-3.5" />
          {file ? file.name.slice(0, 20) : "Choose receipt"}
        </Button>
        <Button size="sm" disabled={!file || uploading} onClick={() => file && uploadAndScan(file)}>
          {uploading ? "Scanning…" : "Scan"}
        </Button>
      </div>
      {result?.row && (
        <div className="text-xs p-3 rounded-lg bg-background/60 border space-y-0.5">
          <div className="font-bold text-emerald-500">€{result.cashback} pending</div>
          <div className="text-muted-foreground">
            {result.extracted?.store_name} · €{result.extracted?.total_amount}
          </div>
        </div>
      )}
    </Card>
    </>
  );
}
