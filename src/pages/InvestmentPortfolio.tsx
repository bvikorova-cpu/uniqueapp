import { PortfolioDashboard } from "@/components/investment/PortfolioDashboard";

export default function InvestmentPortfolio() {
  return (
    <main className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-6">Investment Portfolio</h1>
      <PortfolioDashboard />
    </main>
  );
}
