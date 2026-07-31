import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Tag, Euro, Download, Wallet, Info } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const steps = [
  {
    icon: Upload,
    title: "1. Upload your work",
    desc: "Open Upload Content, add your photo, video or illustration and make sure you own full rights to it.",
  },
  {
    icon: Tag,
    title: "2. Describe it",
    desc: "Add a clear title, description and tags. Good keywords are the main reason buyers find your asset.",
  },
  {
    icon: Euro,
    title: "3. Set your price",
    desc: "You choose the asset price in EUR. Buyers pay your price plus a platform license fee on top.",
  },
  {
    icon: Download,
    title: "4. Buyer checks out once",
    desc: "The buyer picks a license (Standard, Extended or Editorial) and pays your price + license in a single checkout.",
  },
  {
    icon: Wallet,
    title: "5. You get paid",
    desc: "From the asset price you set, 70% goes to you and 30% stays with the platform. Payouts run from the Earnings Dashboard.",
  },
];

export function StockContentEngagement() {
  return (
    <>
      <FloatingHowItWorks
        title={"Stock Content - How it works"}
        steps={[
          { title: "Upload", desc: "Add your file and confirm you own the rights." },
          { title: "Describe", desc: "Title, description and tags so buyers can find it." },
          { title: "Price", desc: "You set the asset price in EUR; license fee is added on top." },
          { title: "Earn", desc: "70% of your asset price goes to you, 30% to the platform." },
        ]}
      />

      <Card className="p-4 md:p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow shrink-0">
            <Info className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg">How selling stock content works</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              A full step-by-step guide from upload to payout.
            </p>
          </div>
        </div>

        <ol className="space-y-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 rounded-xl border border-primary/20 bg-background/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-gradient-to-r from-primary to-accent">Revenue split</Badge>
            <span className="text-xs text-muted-foreground">of the asset price you set at upload</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-2xl font-black">70%</p>
              <p className="text-xs text-muted-foreground">Creator (you)</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-2xl font-black">30%</p>
              <p className="text-xs text-muted-foreground">Platform fee</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Example: you set €10.00 at upload — you receive €7.00 and €3.00 (30%) covers the platform. The buyer's
            license fee is charged on top of your price and goes to the platform in full.
          </p>

        </div>
      </Card>
    </>
  );
}
