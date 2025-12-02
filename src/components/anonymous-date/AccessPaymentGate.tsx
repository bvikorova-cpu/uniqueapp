import { Heart, Lock, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessPaymentGateProps {
  onPayAccess: () => void;
  loading: boolean;
}

export function AccessPaymentGate({ onPayAccess, loading }: AccessPaymentGateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Welcome to Anonymous Date
          </CardTitle>
          <CardDescription className="text-base">
            A unique anonymous dating experience for adults (18+)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              One-Time Access Fee: €1
            </h3>
            <p className="text-sm text-gray-700">
              To maintain a quality, safe environment and prevent spam, we require a one-time access payment of €1.
              This gives you lifetime access to all Anonymous Date features.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-semibold mb-1">Safe & Secure</h4>
              <p className="text-xs text-gray-600">
                Anonymous matching with identity protection
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
              <Users className="h-8 w-8 text-pink-600 mb-2" />
              <h4 className="font-semibold mb-1">Real People</h4>
              <p className="text-xs text-gray-600">
                Payment verification ensures authentic users
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm">
              <Heart className="h-8 w-8 text-red-600 mb-2" />
              <h4 className="font-semibold mb-1">7-Day Mystery</h4>
              <p className="text-xs text-gray-600">
                Chat anonymously before revealing identities
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">What's Included:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Lifetime access to Anonymous Date platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Create your anonymous profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Interest-based matching system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>7-day anonymous chat period</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The €1 access fee is separate from credits used for matching and messaging.
              After gaining access, you'll need to purchase credits to find matches and send messages.
            </p>
          </div>

          <Button
            onClick={onPayAccess}
            disabled={loading}
            className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {loading ? "Processing..." : "Pay €1 & Get Access"}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Secure payment processed by Stripe. Your payment information is encrypted and protected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
