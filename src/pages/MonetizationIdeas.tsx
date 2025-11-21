import { MonetizationIdeaGenerator } from "@/components/monetization/MonetizationIdeaGenerator";

export default function MonetizationIdeas() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">💡 Monetization Ideas</h1>
        <p className="text-muted-foreground text-lg">
          AI-powered revenue strategies for your entertainment platform
        </p>
      </div>

      <MonetizationIdeaGenerator />
    </div>
  );
}