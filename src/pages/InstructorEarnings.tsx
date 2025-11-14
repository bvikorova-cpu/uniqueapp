import { EarningsDashboard } from "@/components/instructor/EarningsDashboard";

export default function InstructorEarnings() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Earnings & Payouts</h1>
        <p className="text-muted-foreground mt-2">
          Manage your course earnings and request withdrawals
        </p>
      </div>
      <EarningsDashboard />
    </div>
  );
}
