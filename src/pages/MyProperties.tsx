import { PropertyDashboard } from "@/components/property/PropertyDashboard";

export default function MyProperties() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Properties</h1>
        <p className="text-muted-foreground">
          Manage your property listings and add virtual tours
        </p>
      </div>

      <PropertyDashboard />
    </div>
  );
}
