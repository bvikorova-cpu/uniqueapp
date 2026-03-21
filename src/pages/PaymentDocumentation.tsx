import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, CreditCard, Database, Webhook, FileText, TestTube } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentDocumentation = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Payment System Documentation</h1>
          <p className="text-muted-foreground">
            Complete guide to the platform's payment infrastructure
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="credits">Credit Systems</TabsTrigger>
            <TabsTrigger value="flows">Payment Flows</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="testing">Testing Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    System Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The payment system consists of 15 independent credit systems, 30 subscription types,
                    and a unified verification system powered by Stripe and Supabase.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-black mb-2">15</div>
                        <p className="text-sm text-muted-foreground">Credit Systems</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-black mb-2">30</div>
                        <p className="text-sm text-muted-foreground">Subscription Types</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-black mb-2">1</div>
                        <p className="text-sm text-muted-foreground">Unified Verification</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      All payment systems use Stripe Checkout with mode: "payment" for one-time purchases.
                      Verification is handled centrally through the verify-credits-payment edge function.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Database className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Database Layer</h4>
                        <p className="text-sm text-muted-foreground">
                          15 credit tables, 30 subscription tables, RLS policies for security
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Webhook className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Edge Functions</h4>
                        <p className="text-sm text-muted-foreground">
                          40+ payment functions, 15+ verification functions, 100+ generation functions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <CreditCard className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold">Stripe Integration</h4>
                        <p className="text-sm text-muted-foreground">
                          Checkout sessions, customer management, payment verification
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="credits">
            <Card>
              <CardHeader>
                <CardTitle>Credit Systems Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { name: "AI Credits", table: "ai_credits", func: "create-credits-payment", prices: ["10, 50, 100"] },
                    { name: "Analyzer Credits", table: "analyzer_credits", func: "create-analyzer-credits-payment", prices: ["10, 30, 60"] },
                    { name: "Antique Credits", table: "antique_credits", func: "create-checkout", prices: ["5, 15, 30"] },
                    { name: "Astrology Credits", table: "astrology_credits", func: "create-astrology-credits-payment", prices: ["10, 25, 50"] },
                    { name: "Brain Duel Credits", table: "brain_duel_credits", func: "create-brain-duel-payment", prices: ["50, 100, 200"] },
                    { name: "Character Credits", table: "character_credits", func: "create-character-credits-payment", prices: ["10, 25, 50"] },
                    { name: "Coloring Credits", table: "coloring_credits", func: "create-coloring-payment", prices: ["5, 15, 30"] },
                    { name: "Cooking Credits", table: "cooking_credits", func: "create-cooking-credits-payment", prices: ["10, 25, 50"] },
                    { name: "IQ Credits", table: "iq_credits", func: "create-iq-payment", prices: ["10, 25, 50"] },
                    { name: "Photo Credits", table: "photo_credits", func: "create-photo-credits-payment", prices: ["10, 25, 50"] },
                    { name: "Shadow Credits", table: "shadow_credits", func: "create-shadow-battle", prices: ["Custom"] },
                    { name: "Video Ad Credits", table: "video_ad_credits", func: "create-video-ad-credits-payment", prices: ["10, 25, 50"] },
                  ].map((credit) => (
                    <div key={credit.table} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{credit.name}</h4>
                          <p className="text-sm text-muted-foreground">Table: {credit.table}</p>
                        </div>
                        <Badge>{credit.prices[0]}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><strong>Edge Function:</strong> {credit.func}</p>
                        <p><strong>Available Packs:</strong> {credit.prices.join(", ")} credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flows">
            <Card>
              <CardHeader>
                <CardTitle>Payment Flow Diagrams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Standard Credit Purchase Flow</h3>
                  <div className="bg-muted p-6 rounded-lg space-y-3 font-mono text-sm">
                    <div>1. User clicks "Purchase Credits" button</div>
                    <div className="ml-4">↓ Invoke edge function (e.g., create-cooking-credits-payment)</div>
                    <div>2. Edge function authenticates user</div>
                    <div className="ml-4">↓ Check/create Stripe customer</div>
                    <div>3. Create Stripe Checkout session</div>
                    <div className="ml-4">↓ Return checkout URL</div>
                    <div>4. Redirect to Stripe Checkout</div>
                    <div className="ml-4">↓ User completes payment</div>
                    <div>5. Stripe redirects to success_url with session_id</div>
                    <div className="ml-4">↓ usePaymentVerification hook triggers</div>
                    <div>6. Call verify-credits-payment</div>
                    <div className="ml-4">↓ Verify payment status</div>
                    <div className="ml-4">↓ Add credits to user account</div>
                    <div className="ml-4">↓ Log to credit_payments table</div>
                    <div>7. Show success message, clean URL</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Verification Process</h3>
                  <div className="bg-muted p-6 rounded-lg space-y-3 font-mono text-sm">
                    <div>verify-credits-payment receives session_id</div>
                    <div className="ml-4">↓</div>
                    <div>Retrieve session from Stripe</div>
                    <div className="ml-4">↓</div>
                    <div>Check payment_status === "paid"</div>
                    <div className="ml-4">↓</div>
                    <div>Check if already processed (prevent duplicates)</div>
                    <div className="ml-4">↓</div>
                    <div>Get current credits from {"{credit_type}"} table</div>
                    <div className="ml-4">↓</div>
                    <div>Update credits_remaining and total_credits_purchased</div>
                    <div className="ml-4">↓</div>
                    <div>Insert record to credit_payments</div>
                    <div className="ml-4">↓</div>
                    <div>Return success response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Create Payment Session</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`// Example: Create cooking credits payment
const { data, error } = await supabase.functions.invoke(
  'create-cooking-credits-payment',
  { body: { credits: 25 } }
);

if (data?.url) {
  window.location.href = data.url;
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Verify Payment</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`// Automatically handled by usePaymentVerification hook
const { isVerifying, isVerified } = usePaymentVerification();

// Manual verification
const { data, error } = await supabase.functions.invoke(
  'verify-credits-payment',
  { body: { session_id: 'cs_test_...' } }
);`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Check Credits</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`// Using React Query hook
const { credits, isLoading } = useCookingCredits();

console.log(credits.credits_remaining);
console.log(credits.total_credits_purchased);`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Manual Testing Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertDescription>
                    Test payments in Stripe test mode using test card: 4242 4242 4242 4242
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Pre-Purchase Testing</h3>
                    <div className="space-y-2">
                      {[
                        "Verify credit balance displays correctly",
                        "Check purchase buttons are visible",
                        "Test authentication requirement (logged out state)",
                        "Verify price display matches Stripe prices",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Purchase Flow Testing</h3>
                    <div className="space-y-2">
                      {[
                        "Click purchase button - should redirect to Stripe",
                        "Complete payment with test card",
                        "Verify redirect back to success URL",
                        "Check credits are added to account",
                        "Verify payment appears in credit_payments table",
                        "Test canceling payment (cancel_url)",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Edge Cases</h3>
                    <div className="space-y-2">
                      {[
                        "Double-click purchase button (prevent duplicate sessions)",
                        "Browser back button during payment",
                        "Session timeout during payment",
                        "Multiple payments in quick succession",
                        "Admin unlimited credits override",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">All Credit Systems</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Test each credit system individually:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "AI Credits",
                        "Analyzer Credits",
                        "Cooking Credits",
                        "Video Ad Credits",
                        "IQ Credits",
                        "Photo Credits",
                        "Character Credits",
                        "Astrology Credits",
                        "Antique Credits",
                        "Coloring Credits",
                        "Brain Duel Credits",
                        "Shadow Credits",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="checkbox" className="h-4 w-4" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentDocumentation;
