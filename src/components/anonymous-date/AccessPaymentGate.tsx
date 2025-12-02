import { Heart, Lock, Shield, Users, MessageCircle, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessPaymentGateProps {
  onPayAccess: () => void;
  loading: boolean;
}

export function AccessPaymentGate({ onPayAccess, loading }: AccessPaymentGateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full">
        <div className="pt-16"></div>
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
            <h3 className="font-semibold text-xl flex items-center gap-2 justify-center">
              <Lock className="h-6 w-6" />
              Monthly Subscription: €1/month
            </h3>
            <p className="text-sm text-gray-700 text-center">
              To maintain a quality, safe environment and prevent spam, we require a monthly subscription of just €1. 
              This gives you full access to all Anonymous Date features.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center">How Anonymous Date Works</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-pink-100">
                <div className="flex items-start gap-3">
                  <div className="bg-pink-100 p-2 rounded-full flex-shrink-0">
                    <Shield className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Step 1: Create Anonymous Profile</h4>
                    <p className="text-xs text-gray-600">
                      Set up your anonymous identity with interests, age range, and personality traits. Your real identity stays hidden.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Step 2: Find Your Match</h4>
                    <p className="text-xs text-gray-600">
                      Our system matches you with someone based on common interests and compatibility (costs 5 credits).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-red-100">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Step 3: Anonymous Chat (7 Days)</h4>
                    <p className="text-xs text-gray-600">
                      Chat for 7 days without knowing each other's identity. Text (1 credit) or voice messages (3 credits).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Step 4: Identity Reveal</h4>
                    <p className="text-xs text-gray-600">
                      After 7 days, reveal identities for free. Or pay 15 credits for early reveal if the connection is strong.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Premium Features Available
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span><strong>Hints:</strong> Get subtle clues about your match's personality or appearance (5 credits)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span><strong>Virtual Gifts:</strong> Send special gifts to show interest and connection (10 credits)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span><strong>Voice Messages:</strong> Add a personal touch with anonymous voice recordings (3 credits)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span><strong>Early Reveal:</strong> Can't wait 7 days? Reveal identities early (15 credits)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Your Monthly Subscription Includes:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Full access to Anonymous Date platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Create and manage your anonymous profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Interest-based matching algorithm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Secure anonymous messaging system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>7-day mystery period with automatic reveal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Match history and conversation archive</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> The €1 monthly subscription gives you platform access. 
              You'll need to purchase credits separately for matching (5 credits) and messaging (1-3 credits per message). 
              Credits are available in packages from €5.
            </p>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
            <h4 className="font-semibold mb-2 text-center">Why Choose Anonymous Date?</h4>
            <div className="grid gap-3 md:grid-cols-3 text-center">
              <div>
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-xs font-semibold">100% Anonymous</p>
                <p className="text-xs text-gray-600">Your identity protected until reveal</p>
              </div>
              <div>
                <Users className="h-6 w-6 text-pink-600 mx-auto mb-1" />
                <p className="text-xs font-semibold">Real Connections</p>
                <p className="text-xs text-gray-600">Focus on personality, not appearance</p>
              </div>
              <div>
                <Heart className="h-6 w-6 text-red-600 mx-auto mb-1" />
                <p className="text-xs font-semibold">Safe Environment</p>
                <p className="text-xs text-gray-600">Verified users only</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onPayAccess}
            disabled={loading}
            className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {loading ? "Processing..." : "Subscribe for €1/month & Start Dating"}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Secure payment processed by Stripe. Cancel anytime. Your payment information is encrypted and protected. 
            By subscribing, you confirm you are 18+ and agree to our terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
