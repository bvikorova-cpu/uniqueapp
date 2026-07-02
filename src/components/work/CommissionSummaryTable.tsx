import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Percent, ShoppingBag, Briefcase, Users, RefreshCw, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CommissionSetting {
  id: string;
  service_type: string;
  commission_rate: number;
  description: string;
  is_active: boolean;
}

const serviceIcons: Record<string, typeof ShoppingBag> = {
  bazaar: ShoppingBag,
  marketplace: Users,
  skill_swap: RefreshCw,
  job_portal: Briefcase,
};

const serviceLabels: Record<string, string> = {
  bazaar: "Online Bazaar",
  marketplace: "Skills Marketplace",
  skill_swap: "Skill Swap",
  job_portal: "Job Portal",
};

export function CommissionSummaryTable() {
  const { data: commissions, isLoading, error } = useQuery({
    queryKey: ["platform-commission-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_commission_settings")
        .select("*")
        .eq("is_active", true)
        .order("service_type");

      if (error) throw error;
      return data as CommissionSetting[];
    },
  });

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Commission Summary Table - How it works"} steps={[{ title: 'Open', desc: 'Access the Commission Summary Table section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Commission Summary Table.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Commission Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Commission Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load commission rates</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              Platform Commission Rates
            </CardTitle>
            <CardDescription className="mt-1">
              Real-time commission rates for each Work service
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Escrow Protected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Seller Receives</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions?.map((commission) => {
              const Icon = serviceIcons[commission.service_type] || Briefcase;
              const sellerReceives = 100 - commission.commission_rate;
              
              return (
                <TableRow key={commission.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">
                        {serviceLabels[commission.service_type] || commission.service_type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[200px]">
                    {commission.description}
                  </TableCell>
                  <TableCell className="text-right">
                    {commission.commission_rate === 0 ? (
                      <Badge variant="secondary">No Commission</Badge>
                    ) : (
                      <Badge variant="outline" className="font-mono">
                        {commission.commission_rate}%
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {commission.commission_rate === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className="font-semibold text-green-600">
                        {sellerReceives}%
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 text-blue-500" />
            <div>
              <p className="font-medium text-foreground">Escrow Protection</p>
              <p>
                All payments are held in escrow until the buyer confirms delivery/completion. 
                This protects both buyers and sellers from fraud.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
