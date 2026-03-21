import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertTriangle, Scale, CreditCard, Users, FileText, Lock, Gavel, Database, Brain, Percent, Eye, Fingerprint, Clock } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 mt-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <Badge className="text-lg px-4 py-1">UNITY V2.0 – PROTECTIVE EDITION</Badge>
          </div>
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            🛡️ UNIQUE PLATFORM TERMS & CONDITIONS
          </h1>
          <p className="text-muted-foreground">
            Effective Date: January 20, 2026
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

        {/* Section III - Financial Terms */}
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

        {/* NEW Section - Commission Fees */}
        <Card className="mb-6 border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-500" />
              IV. Platform Commission Fees and Creator Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">7. Marketplace and Auction Fees</h4>
              <p className="mb-2">
                <strong>7.1. Bazaar Marketplace:</strong> The Platform retains a <strong className="text-green-600">10% commission</strong> on 
                all Bazaar transactions. Sellers receive 90% of the final sale price after successful delivery confirmation.
              </p>
              <p className="mb-2">
                <strong>7.2. Auction Platform:</strong> The Platform retains a <strong className="text-green-600">10% commission</strong> on 
                all completed auction sales. The 7-day escrow protection period applies before funds are released to sellers.
              </p>
              <p className="mb-2">
                <strong>7.3. Service Marketplace:</strong> The Platform retains a <strong className="text-green-600">15% commission</strong> on 
                all service-based transactions (translations, design work, professional services). Service providers receive 85% of the transaction value.
              </p>
              <p>
                <strong>7.4. Stock Content Library:</strong> The Platform retains a <strong className="text-green-600">30% commission</strong> on 
                all digital content sales (images, graphics, templates). Content creators receive 70% of each sale.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">8. Creator and Influencer Revenue Shares</h4>
              <p className="mb-2">
                <strong>8.1. Membership Community:</strong> Creators receive <strong className="text-green-600">90%</strong> of 
                all subscription, pay-per-view, gift, tip, and merchandise revenue. The Platform retains 10%.
              </p>
              <p className="mb-2">
                <strong>8.2. Tutorial Platform:</strong> Instructors receive <strong className="text-green-600">70%</strong> of 
                course and workshop sales. The Platform retains 30% for hosting, marketing, and payment processing.
              </p>
              <p className="mb-2">
                <strong>8.3. Virtual Influencer Agency:</strong> Influencers receive <strong className="text-green-600">70%</strong> of 
                brand collaboration and sponsorship revenue. The Platform retains 30% for matchmaking and administration.
              </p>
              <p className="mb-2">
                <strong>8.4. Comedy Club & Live Concerts:</strong> Performers receive <strong className="text-green-600">80%</strong> of 
                ticket sales and virtual gifts. The Platform retains 20% for streaming infrastructure and moderation.
              </p>
              <p>
                <strong>8.5. Stripe Connect Payouts:</strong> All creator payouts are processed via Stripe Connect. Creators must 
                complete KYC verification before receiving any payouts. Payout processing time is typically 2-7 business days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section - AI and Prediction Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              V. AI Services, Predictions, and Entertainment Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">9. AI-Generated Content Disclaimer</h4>
              <p className="mb-2 font-semibold text-destructive">
                <strong>9.1. Entertainment Purpose Only:</strong> ALL AI-generated content, predictions, analyses, and 
                recommendations provided by UNIQUE Platform are for <strong>ENTERTAINMENT AND EDUCATIONAL PURPOSES ONLY</strong>. 
                They do not constitute professional, medical, legal, financial, or psychological advice.
              </p>
              <p className="mb-2">
                <strong>9.2. No Medical Advice:</strong> AI features including Psychology Chat, Wellness recommendations, 
                and health-related analyses are NOT substitutes for professional medical diagnosis or treatment. Always 
                consult qualified healthcare professionals for medical concerns.
              </p>
              <p className="mb-2">
                <strong>9.3. No Legal Advice:</strong> Any legal information provided is general in nature and does not 
                constitute legal advice. Consult a licensed attorney for legal matters.
              </p>
              <p>
                <strong>9.4. No Financial Advice:</strong> Lottery AI, Sports Predictions, and any investment-related 
                analyses are simulations for entertainment. They do not guarantee outcomes and should not be used as 
                the basis for financial decisions.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">10. Contests of Skill (MegaTalent, GP Racing, Horse Racing)</h4>
              <p className="mb-2">
                <strong>10.1. Strict Classification:</strong> All functions including GP Racing, Horse Racing, and MegaTalent 
                are strictly defined and operated as Contests of Skill (Súťaže Zručnosti). They are not Games of Chance 
                (hazardné hry) and do not require a gambling license.
              </p>
              <p className="mb-2">
                <strong>10.2. Reliance on Skill:</strong> Success is determined by the User's strategic planning, investment 
                management, and optimization of assets, not by random outcomes or simple wagering.
              </p>
              <p>
                <strong>10.3. Prohibition:</strong> These modules strictly prohibit traditional betting (wagering) on the 
                outcomes of competitions where the User has no control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* NEW Section - Data Processing & Privacy */}
        <Card className="mb-6 border-blue-500/50" id="privacy">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              VI. Privacy Policy & Data Protection (GDPR Compliant)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">11. Data Collection and Processing</h4>
              <p className="mb-2">
                <strong>11.1. Personal Data:</strong> We collect and process personal data including name, email, phone number, 
                profile information, and payment details in accordance with GDPR (EU Regulation 2016/679).
              </p>
              <p className="mb-2">
                <strong>11.2. Legal Basis:</strong> Data processing is based on: (a) Contractual necessity for service provision; 
                (b) Legitimate interests for platform security and fraud prevention; (c) Consent for marketing communications; 
                (d) Legal obligations for financial records and tax compliance.
              </p>
              <p>
                <strong>11.3. Data Controller:</strong> UNIQUE Tech (Slovak Republic) is the data controller responsible for 
                your personal data.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                12. Biometric and Sensitive Data Processing
              </h4>
              <p className="mb-2 font-semibold text-blue-600">
                <strong>12.1. Future Face (Age Simulation):</strong> Facial images uploaded for AI age progression are processed 
                using OpenAI DALL-E. Images are encrypted during transmission (TLS 1.3) and temporarily stored for processing only. 
                Original uploads are automatically deleted within 24 hours of processing completion.
              </p>
              <p className="mb-2">
                <strong>12.2. Pet Translator (Voice Data):</strong> Audio recordings of pet sounds are processed using AI analysis. 
                Voice data is encrypted and stored temporarily (maximum 7 days) for analysis purposes only. Users may request 
                immediate deletion of voice recordings via Settings.
              </p>
              <p className="mb-2">
                <strong>12.3. Handwriting Analysis:</strong> Handwriting samples are processed using AI pattern recognition. 
                Images are encrypted and stored for analysis history. Users may delete their analysis history at any time.
              </p>
              <p>
                <strong>12.4. Photo Restoration & AI Studio:</strong> All images uploaded for AI transformation are encrypted 
                and processed securely. Processed images are stored in user galleries until manually deleted.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                13. Data Retention Policy
              </h4>
              <p className="mb-2">
                <strong>13.1. Account Data:</strong> Personal profile data is retained for the duration of your account and 
                for 3 years after account deletion for legal compliance purposes.
              </p>
              <p className="mb-2">
                <strong>13.2. AI-Generated Content:</strong> AI-generated images, analyses, and transformations are stored 
                temporarily and encrypted. Specific retention periods: (a) Image generations: 90 days unless saved to gallery; 
                (b) Chat conversations: 30 days; (c) Analysis results: Until manually deleted by user.
              </p>
              <p className="mb-2">
                <strong>13.3. Transaction Records:</strong> Payment and transaction data is retained for 7 years to comply 
                with financial regulations and tax requirements.
              </p>
              <p className="mb-2">
                <strong>13.4. Biometric Data:</strong> Facial images for Future Face are deleted within 24 hours. Voice 
                recordings for Pet Translator are deleted within 7 days. Users may request immediate deletion.
              </p>
              <p>
                <strong>13.5. Encryption Standards:</strong> All personal data is encrypted at rest (AES-256) and in transit 
                (TLS 1.3). Biometric data receives additional encryption layers.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                14. User Data Rights (GDPR)
              </h4>
              <p className="mb-2">
                <strong>14.1. Right of Access:</strong> You may request a copy of all personal data we hold about you.
              </p>
              <p className="mb-2">
                <strong>14.2. Right to Rectification:</strong> You may correct inaccurate or incomplete personal data.
              </p>
              <p className="mb-2">
                <strong>14.3. Right to Erasure:</strong> You may request deletion of your personal data ("Right to be Forgotten").
              </p>
              <p className="mb-2">
                <strong>14.4. Right to Data Portability:</strong> You may request your data in a machine-readable format.
              </p>
              <p className="mb-2">
                <strong>14.5. Right to Object:</strong> You may object to processing based on legitimate interests.
              </p>
              <p>
                <strong>14.6. Exercise Your Rights:</strong> Contact privacy@unique-platform.com or use the Settings → Privacy 
                section in your account to exercise these rights. We respond within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section - Payment Processing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              VII. Payment Processing and Stripe Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">15. Payment Security</h4>
              <p className="mb-2">
                <strong>15.1. Payment Processor:</strong> All payments are processed by Stripe, Inc., a PCI-DSS Level 1 
                certified payment processor. UNIQUE Platform does not store credit card numbers or CVV codes.
              </p>
              <p className="mb-2">
                <strong>15.2. Escrow Protection:</strong> Marketplace and Auction transactions use 7-day escrow protection. 
                Funds are held securely until buyer confirmation or automatic release after the escrow period.
              </p>
              <p className="mb-2">
                <strong>15.3. Currency:</strong> All transactions are processed in EUR (Euros). Currency conversion fees 
                may apply for non-EUR payment methods.
              </p>
              <p>
                <strong>15.4. Dispute Resolution:</strong> Payment disputes are handled through Stripe's dispute resolution 
                process. Buyers may open disputes within 7 days of delivery for marketplace transactions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section - Content and IP */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              VIII. Content, Intellectual Property, and Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">16. Content and Intellectual Property</h4>
              <p className="mb-2">
                <strong>16.1. User Content License:</strong> You retain all ownership rights to content you upload. By posting, 
                you grant the Operator a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and 
                distribute your content on the Platform.
              </p>
              <p className="mb-2">
                <strong>16.2. AI-Generated Content:</strong> Users retain rights to AI-generated content created using their 
                inputs and credits. The Platform retains no ownership claims to user-generated AI content.
              </p>
              <p>
                <strong>16.3. Copyright Infringement:</strong> The Operator respects IP rights. Users must contact the Operator 
                with detailed information regarding any alleged copyright infringement.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">17. Account Termination</h4>
              <p className="mb-2">
                <strong>17.1. User-Initiated Termination:</strong> Users may delete their account at any time. Upon deletion, 
                unused AI credits will be forfeited, and active subscriptions will be cancelled (no refunds).
              </p>
              <p>
                <strong>17.2. Platform-Initiated Termination:</strong> The Operator reserves the right to suspend or terminate 
                accounts that violate these terms, engage in illegal activities, or attempt to exploit the platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section - Liability */}
        <Card className="mb-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-destructive" />
              IX. Liability and Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-3">18. Technical Failure and Exclusive Remedy</h4>
              <p className="mb-2">
                <strong>18.1. No Financial Compensation:</strong> In the event of technical failure, service interruption, 
                or data loss, the User shall not be entitled to any monetary compensation or refund.
              </p>
              <p>
                <strong>18.2. Exclusive Remedy:</strong> The sole remedy is the crediting of an equivalent replacement in 
                the form of additional subscription time or AI Credits/In-App Currencies, at the sole discretion of the Operator.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">19. Limitation of Liability and Indemnification</h4>
              <p className="mb-2">
                <strong>19.1. No Warranties:</strong> The Platform provides services "as is" without warranties of any kind.
              </p>
              <p className="mb-2">
                <strong>19.2. Indemnification:</strong> The User agrees to defend, indemnify, and hold harmless the Operator 
                against any and all claims, demands, losses, damages, and legal fees arising from the User's breach of these 
                T&C, failure to meet tax obligations, or reliance on any prediction/tip.
              </p>
              <p className="font-semibold text-amber-600">
                <strong>19.3. Maximum Liability:</strong> The Operator's total liability for any claim shall not exceed the 
                total amount paid by the User/Creator to the Operator for services during the immediately preceding three (3) 
                month period.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-foreground mb-3">20. Dispute Resolution</h4>
              <p className="mb-2">
                <strong>20.1. Informal Resolution:</strong> Users agree to first contact support@unique-platform.com to attempt 
                informal resolution.
              </p>
              <p>
                <strong>20.2. Governing Law and Jurisdiction:</strong> These T&C shall be governed by the laws of the Slovak 
                Republic, with exclusive jurisdiction in Bratislava.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm mt-8 p-4 border rounded-lg bg-muted/20">
          <p className="font-semibold">
            By using this platform, you acknowledge that you have read, understood, and agree to be bound by these 
            Terms and Conditions and Privacy Policy.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} UNIQUE Platform. All rights reserved.
          </p>
          <p className="mt-2 text-xs">
            Last Updated: January 20, 2026 | Version 2.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
