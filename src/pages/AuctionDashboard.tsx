import { AuctionWithdrawalRequest } from "@/components/auction/AuctionWithdrawalRequest";

export default function AuctionDashboard() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Auction Seller Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your earnings and withdrawal requests
        </p>
      </div>

      <AuctionWithdrawalRequest />
    </div>
  );
}
