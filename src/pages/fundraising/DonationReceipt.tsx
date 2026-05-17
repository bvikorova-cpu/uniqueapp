import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

interface ReceiptData {
  receipt_number: string;
  issued_at: string;
  donation_id: string;
  donation_date: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  currency: string;
  donor_name: string | null;
  donor_email: string;
  campaign_title: string;
  campaign_type: string;
  beneficiary: string;
  is_monthly: boolean;
  payment_status: string;
  tax_deductible_note: string;
  issuer: { name: string; legal_entity: string; website: string };
}

export default function DonationReceipt() {
  const { donationId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, [donationId, sessionId]);

  const fetchReceipt = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-donation-receipt', {
        body: { donationId, sessionId },
      });
      if (error) throw error;
      if (!data?.receipt) throw new Error('Receipt not found');
      setReceipt(data.receipt);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Receipt could not be loaded',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">Receipt not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const formatEUR = (n: number) =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 print:bg-white print:py-0">
      <Helmet>
        <title>Donation Receipt {receipt.receipt_number}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" /> Save as PDF
            </Button>
          </div>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8 print:p-4 space-y-6">
            <header className="flex items-start justify-between border-b pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Donation Receipt</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Receipt No. <span className="font-mono">{receipt.receipt_number}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Issued: {formatDate(receipt.issued_at)}
                </p>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Paid
              </Badge>
            </header>

            <section className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-1">Donor</p>
                <p className="font-medium">{receipt.donor_name || 'Anonymous Donor'}</p>
                <p className="text-sm text-muted-foreground">{receipt.donor_email}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-1">Issued by</p>
                <p className="font-medium">{receipt.issuer.legal_entity}</p>
                <p className="text-sm text-muted-foreground">{receipt.issuer.website}</p>
              </div>
            </section>

            <Separator />

            <section>
              <p className="text-xs uppercase text-muted-foreground mb-2">Campaign</p>
              <p className="font-semibold text-lg">{receipt.campaign_title}</p>
              {receipt.beneficiary && (
                <p className="text-sm text-muted-foreground">
                  Beneficiary: {receipt.beneficiary}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                Category: {receipt.campaign_type} fundraising
              </p>
            </section>

            <Separator />

            <section className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Donation amount</span>
                <span className="font-medium">{formatEUR(receipt.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform service fee</span>
                <span className="font-medium">−{formatEUR(receipt.platform_fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net to beneficiary</span>
                <span className="font-medium">{formatEUR(receipt.net_amount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total charged</span>
                <span>{formatEUR(receipt.amount)}</span>
              </div>
              {receipt.is_monthly && (
                <p className="text-xs text-primary mt-2">
                  ↻ Monthly recurring donation
                </p>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                Payment date: {formatDate(receipt.donation_date)} · Donation ID:{' '}
                <span className="font-mono">{receipt.donation_id}</span>
              </p>
            </section>

            <Separator />

            <section className="rounded-md bg-muted/50 p-4">
              <p className="text-xs font-semibold uppercase mb-2">Tax Deductibility</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {receipt.tax_deductible_note}
              </p>
            </section>

            <footer className="text-center text-xs text-muted-foreground pt-4">
              Thank you for your generosity. — {receipt.issuer.name}
            </footer>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          @page { margin: 1cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
