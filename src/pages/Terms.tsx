import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertTriangle, Scale, CreditCard, Users, FileText, Lock, Gavel } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 mt-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <Badge className="text-lg px-4 py-1">UNITY V2.0 – PROTECTIVE EDITION</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            🛡️ UNIQUE PLATFORM TERMS & CONDITIONS
          </h1>
          <p className="text-muted-foreground">
            Effective Date: November 27, 2025
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              IMPORTANT NOTICE
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="font-semibold">
              These T&C constitute a legally binding agreement between the Operator and the User/Creator. 
              By accessing or using the UNIQUE Platform in any manner, you unconditionally, irrevocably, 
              and immediately agree to be bound by these T&C. If you disagree with any part of these T&C, 
              you MUST immediately cease all use of the Platform.
            </p>
          </CardContent>
        </Card>

        {/* Section I */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              I. General Provisions and Governing Law
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">1. Scope and Acceptance</h4>
              <p className="mb-2">
                <strong>1.1.</strong> These terms and conditions govern the relationship between the Operator 
                (as defined below) and all Users/Creators of the services provided on this website ("Platform").
              </p>
              <p className="mb-2">
                <strong>1.2.</strong> By using these services, you agree to be bound by these terms. If you do not 
                agree with any part of these terms, you must not use our services.
              </p>
              <p>
                <strong>1.3.</strong> The Operator reserves the right to modify these terms at any time. Continued 
                use of the Platform after changes constitutes irrevocable acceptance of the new terms.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">2. Parties, Governing Law, and Jurisdiction</h4>
              <p className="mb-2">
                <strong>2.1. Operator:</strong> The term "Operator" refers to UNIQUE Tech, established under the laws of the Slovak Republic.
              </p>
              <p className="mb-2">
                <strong>2.2. Governing Law:</strong> These T&C shall be governed by and construed exclusively in 
                accordance with the laws of the Slovak Republic, without regard to its conflict of law principles.
              </p>
              <p>
                <strong>2.3. Exclusive Jurisdiction:</strong> All disputes arising out of or in connection with these 
                T&C shall be subject to the exclusive jurisdiction of the competent courts in Bratislava, Slovak Republic. 
                The User/Creator explicitly waives any right to claim jurisdiction in any other territory.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section II */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              II. User Accounts, Obligations, and Platform Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">3. User Registration and Account Obligations</h4>
              <p className="mb-2">
                <strong>3.1. Age Requirement:</strong> Users must be at least 13 years old (or the minimum age required 
                in their jurisdiction) to use the services.
              </p>
              <p className="mb-2">
                <strong>3.2. User Obligations:</strong> Users agree to:
              </p>
              <ul className="list-disc list-inside ml-4 mb-2 space-y-1">
                <li>(a) Provide accurate, current, and complete information;</li>
                <li>(b) Maintain login credentials confidential and secure;</li>
                <li>(c) Notify us immediately of any unauthorized access.</li>
              </ul>
              <p className="mb-2">
                <strong>3.3. Sole Responsibility:</strong> You are solely responsible for all activities conducted through 
                your account. Any actions performed using your account credentials are considered your full responsibility.
              </p>
              <p>
                <strong>3.4. User Rights:</strong> Users have the right to access and use all available features, and to 
                request account data and deletion in accordance with GDPR.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">4. Administrator Rights and Code of Conduct</h4>
              <p className="mb-2">
                <strong>4.1. Administrator Rights:</strong> The Operator reserves the right to monitor platform activity, 
                remove/modify content, suspend or terminate accounts that breach these terms, and modify platform 
                features/pricing at any time.
              </p>
              <p className="mb-2">
                <strong>4.2. Code of Conduct:</strong> Users agree to:
              </p>
              <ul className="list-disc list-inside ml-4 mb-2 space-y-1">
                <li>(a) Not use the platform for illegal, offensive, or fraudulent purposes;</li>
                <li>(b) Respect the rights and privacy of other users;</li>
                <li>(c) Not engage in harassment, hacking, or intellectual property infringement.</li>
              </ul>
              <p className="font-semibold text-destructive">
                Violation of these rules may result in immediate and permanent termination.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section III */}
        <Card className="mb-6 border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              III. Financial Terms and Maximum Liability Shift (Crucial)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">5. AI Credits, In-App Currencies, and Non-Refund Policy</h4>
              <p className="mb-2">
                <strong>5.1. Nature of Credits:</strong> AI Credits and In-App Currencies (e.g., Horse Coins) are sold as 
                non-refundable, non-transferable, and non-redeemable digital licenses. They do not constitute electronic 
                money, property, or cash equivalents.
              </p>
              <p className="mb-2">
                <strong>5.2. Zero Monetary Value:</strong> The User accepts that Credits have zero intrinsic monetary value 
                and SHALL NEVER be repurchased or exchanged for real currency (€) by the Operator.
              </p>
              <p className="mb-2">
                <strong>5.3. Expiration and Forfeiture:</strong> AI Credits automatically and without compensation expire 
                twelve (12) months from the date of purchase. Unused credits are forfeited upon account termination.
              </p>
              <p className="font-semibold text-amber-600">
                <strong>5.4. Absolute Non-Refundability:</strong> All purchases of digital services, subscriptions, and 
                Credits are FINAL AND NON-REFUNDABLE once provided or accessed. The User expressly waives any statutory 
                right to withdrawal for immediately provided services.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">6. Creator/Seller/Tipster Tax and AML/KYC Liability</h4>
              <p className="mb-2">
                <strong>6.1. Independent Contractor Status:</strong> Every Creator/Seller/Tipster acts strictly as an 
                independent contractor and is not an employee or agent of the Operator.
              </p>
              <p className="mb-2">
                <strong>6.2. Absolute Tax Responsibility:</strong> The Creator/Seller/Tipster is EXCLUSIVELY, UNCONDITIONALLY, 
                AND FULLY RESPONSIBLE for declaring, calculating, and remitting ALL global tax liabilities arising from their 
                income on the Platform, including income tax and VAT/GST/Sales Tax.
              </p>
              <p>
                <strong>6.3. AML/KYC and Payouts:</strong> Failure by the Creator/Seller/Tipster to pass the Operator's KYC 
                and AML verification procedures shall result in the immediate and indefinite suspension of all Payouts and 
                account access. The Operator reserves the right to withhold any funds necessary for legal compliance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section IV */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              IV. Specific Services, Disclaimers, and High-Risk Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">7. Contests of Skill (MegaTalent, F1 Racing, Horse Racing)</h4>
              <p className="mb-2">
                <strong>7.1. Strict Classification:</strong> All functions including F1 Racing, Horse Racing, and MegaTalent 
                are strictly defined and operated as Contests of Skill (Súťaže Zručnosti). They are not Games of Chance 
                (hazardné hry) and do not require a gambling license.
              </p>
              <p className="mb-2">
                <strong>7.2. Reliance on Skill (Racing Modules):</strong> Success in F1 Racing and Horse Racing is determined 
                by the User's strategic planning, investment management, and optimization of assets (car/horse), not by random 
                outcomes or simple wagering.
              </p>
              <p className="mb-2">
                <strong>7.3. Reliance on Skill (MegaTalent):</strong> The outcome of MegaTalent is determined by Peer-Review 
                (evaluation by other qualified participants) or an objective internal committee, which constitutes a collective 
                assessment of skill, not a lottery or random draw.
              </p>
              <p>
                <strong>7.4. Prohibition:</strong> These modules strictly prohibit traditional betting (wagering) on the 
                outcomes of competitions where the User has no control.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">8. Prediction and Advice Services (AI, Tipsters, Psychology, etc.)</h4>
              <p className="mb-2 font-semibold text-destructive">
                <strong>8.1. Absolute Denial of Financial/Investment Advice:</strong> Services including Lottery AI Predictions, 
                Sports Match Predictions, and any financial/business analysis are provided SOLELY FOR ENTERTAINMENT AND 
                SIMULATION PURPOSES. The Operator provides no financial, investment, or gambling advice.
              </p>
              <p className="mb-2">
                <strong>8.2. No Guarantee of Success:</strong> The User accepts that relying on AI predictions, Expert Tips, 
                or any advice carries inherent risk. The Operator is not liable for any financial losses, damages, or injuries 
                resulting from reliance on such information.
              </p>
              <p className="mb-2">
                <strong>8.3. Tipsters are Independent:</strong> The Operator does not guarantee, endorse, or take responsibility 
                for the quality, accuracy, or integrity of advice provided by Expert Tipsters. Users transact with Tipsters at 
                their own risk.
              </p>
              <p>
                <strong>8.4. No Medical/Legal Substitute:</strong> Services like Psychology & Tutoring Services, Professional 
                Services (Doctor, Lawyer), etc., ARE NOT substitutes for professional licensed advice.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section V */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              V. Content, Privacy, and Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">9. Content and Intellectual Property</h4>
              <p className="mb-2">
                <strong>9.1. User Content License:</strong> You retain all ownership rights to content you upload. By posting, 
                you grant the Operator a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and 
                distribute your content on the Platform.
              </p>
              <p>
                <strong>9.2. Copyright Infringement:</strong> The Operator respects IP rights. Users must contact the Operator 
                with detailed information regarding any alleged copyright infringement.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">10. Privacy and Data Protection</h4>
              <p className="mb-2">
                <strong>10.1. GDPR Compliance:</strong> Personal data processing complies with GDPR and applicable data 
                protection laws.
              </p>
              <p>
                <strong>10.2. User Rights:</strong> Users retain the right to access, correction, deletion, and portability 
                of their data. For detailed information, review the Privacy Policy.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">11. Account Termination</h4>
              <p className="mb-2">
                <strong>11.1. User-Initiated Termination:</strong> Users may delete their account at any time. Upon deletion, 
                unused AI credits will be forfeited, and active subscriptions will be cancelled (no refunds).
              </p>
              <p>
                <strong>11.2. Platform-Initiated Termination:</strong> The Operator reserves the right to suspend or terminate 
                accounts that violate these terms, engage in illegal activities, or attempt to exploit the platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section VI */}
        <Card className="mb-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-destructive" />
              VI. Liability and Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">12. Technical Failure and Exclusive Remedy</h4>
              <p className="mb-2">
                <strong>12.1. No Financial Compensation:</strong> In the event of technical failure, service interruption, 
                or data loss, the User shall not be entitled to any monetary compensation or refund.
              </p>
              <p>
                <strong>12.2. Exclusive Remedy:</strong> The sole remedy is the crediting of an equivalent replacement in 
                the form of additional subscription time or AI Credits/In-App Currencies, at the sole discretion of the Operator.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">13. Limitation of Liability and Indemnification</h4>
              <p className="mb-2">
                <strong>13.1. No Warranties:</strong> The Platform provides services "as is" without warranties of any kind.
              </p>
              <p className="mb-2">
                <strong>13.2. Indemnification:</strong> The User agrees to defend, indemnify, and hold harmless the Operator 
                against any and all claims, demands, losses, damages, and legal fees arising from the User's breach of these 
                T&C, failure to meet tax obligations, or reliance on any prediction/tip.
              </p>
              <p className="font-semibold text-amber-600">
                <strong>13.3. Maximum Liability:</strong> The Operator's total liability for any claim shall not exceed the 
                total amount paid by the User/Creator to the Operator for services during the immediately preceding three (3) 
                month period. (This replaces the original 12-month limit with a stricter, more protective 3-month limit).
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">14. Dispute Resolution</h4>
              <p className="mb-2">
                <strong>14.1. Informal Resolution:</strong> Users agree to first contact support to attempt informal resolution.
              </p>
              <p>
                <strong>14.2. Governing Law and Jurisdiction:</strong> As per Section 2.2 and 2.3, legal proceedings will be 
                governed by the laws of the Slovak Republic, with exclusive jurisdiction in Bratislava.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm mt-8 p-4 border rounded-lg bg-muted/20">
          <p className="font-semibold">
            By using this platform, you acknowledge that you have read, understood, and agree to be bound by these 
            Terms and Conditions.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} UNIQUE Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
