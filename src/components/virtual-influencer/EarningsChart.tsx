import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Earning {
  id: string;
  amount: string | number;
  net_amount: string | number;
  platform_fee: string | number;
  source: string;
  created_at: string;
}

interface EarningsChartProps {
  earnings: Earning[];
}

const EarningsChart = ({ earnings }: EarningsChartProps) => {
  // Group earnings by date
  const chartData = earnings.reduce((acc: any[], earning) => {
    const date = format(new Date(earning.created_at), "MMM dd");
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.earnings += Number(earning.net_amount);
    } else {
      acc.push({
        date,
        earnings: Number(earning.net_amount),
      });
    }
    
    return acc;
  }, []).reverse();

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.net_amount), 0);
  const totalPlatformFees = earnings.reduce((sum, e) => sum + Number(e.platform_fee), 0);

  // Group by source
  const bySource = earnings.reduce((acc: any, earning) => {
    acc[earning.source] = (acc[earning.source] || 0) + Number(earning.net_amount);
    return acc;
  }, {});

  return (
    <>
      <FloatingHowItWorks title={"Earnings Chart - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Chart section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Chart.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground mb-1">Total Earnings</h3>
          <p className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground mb-1">Platform Fees (20%)</h3>
          <p className="text-2xl font-bold">€{totalPlatformFees.toFixed(2)}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground mb-1">Total Transactions</h3>
          <p className="text-2xl font-bold">{earnings.length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Earnings Over Time</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => `€${Number(value).toFixed(2)}`}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No earnings data yet
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Earnings by Source</h3>
        <div className="space-y-3">
          {Object.entries(bySource).map(([source, amount]: [string, any]) => (
            <div key={source} className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span className="capitalize">{source.replace(/_/g, ' ')}</span>
              <span className="font-semibold">€{amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {earnings.slice(0, 10).map((earning) => (
            <div key={earning.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium capitalize">{earning.source.replace(/_/g, ' ')}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(earning.created_at), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">€{Number(earning.net_amount).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Fee: €{Number(earning.platform_fee).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </>
  );
};

export default EarningsChart;
