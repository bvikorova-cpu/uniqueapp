import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-4">Legal</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Terms and Conditions of Use
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. General Provisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              These terms and conditions govern the relationship between the platform operator and users 
              of the services provided on this website.
            </p>
            <p>
              By using these services, you agree to be bound by these terms. If you do not agree with 
              any part of these terms, you must not use our services.
            </p>
            <p>
              The platform reserves the right to modify these terms at any time. Continued use of the 
              platform after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. User Registration and Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <h4 className="font-semibold text-foreground">User Obligations:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update account information</li>
              <li>Keep login credentials confidential and secure</li>
              <li>Be at least 13 years old (or the minimum age required in your jurisdiction)</li>
              <li>Notify us immediately of any unauthorized account access</li>
            </ul>
            <h4 className="font-semibold text-foreground mt-4">User Rights:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access and use all features available to your account type</li>
              <li>Request account data and deletion in accordance with GDPR</li>
              <li>Cancel your account at any time</li>
              <li>Report violations and inappropriate content</li>
            </ul>
            <p className="text-sm italic mt-4">
              You are solely responsible for all activities conducted through your account. 
              Any actions performed using your account credentials are considered your responsibility.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Administrator Rights and Obligations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <h4 className="font-semibold text-foreground">Administrator Rights:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Monitor platform activity for compliance with these terms</li>
              <li>Remove, modify, or restrict access to any content that violates these terms</li>
              <li>Suspend or terminate user accounts that breach these terms</li>
              <li>Modify platform features and services at any time</li>
              <li>Set pricing for premium features and services</li>
              <li>Collect and process user data as outlined in the Privacy Policy</li>
            </ul>
            <h4 className="font-semibold text-foreground mt-4">Administrator Obligations:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide services with reasonable availability and performance</li>
              <li>Protect user data in accordance with GDPR and applicable laws</li>
              <li>Notify users of significant changes to terms or services</li>
              <li>Process user complaints and support requests in a timely manner</li>
              <li>Maintain secure payment processing systems</li>
              <li>Respect user rights regarding data access and deletion</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Code of Conduct</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Users agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Not use the platform for illegal purposes or activities</li>
              <li>Not post offensive, defamatory, hateful, or inappropriate content</li>
              <li>Respect the rights and privacy of other users</li>
              <li>Not engage in spam, phishing, or fraudulent activities</li>
              <li>Not infringe on copyrights or intellectual property rights</li>
              <li>Not harass, threaten, or abuse other users</li>
              <li>Not attempt to hack, disrupt, or damage the platform</li>
              <li>Not create multiple accounts to circumvent restrictions</li>
              <li>Not impersonate others or misrepresent your identity</li>
            </ul>
            <p className="font-semibold text-foreground mt-4">
              Violation of these rules may result in content removal, account suspension, or permanent ban.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Platform Services - Specific Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="feed">
                <AccordionTrigger>Social Feed & Stories</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• Content posted must comply with community guidelines</p>
                  <p>• You retain ownership of your content but grant us a license to display it</p>
                  <p>• Stories automatically delete after 24 hours</p>
                  <p>• Inappropriate content will be removed without notice</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="messenger">
                <AccordionTrigger>Messenger & Video Calls</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• Messages are encrypted and private</p>
                  <p>• Video calls require camera and microphone permissions</p>
                  <p>• Recording conversations without consent is prohibited</p>
                  <p>• Spam and unsolicited messages are prohibited</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="marketplace">
                <AccordionTrigger>Marketplace & Bazaar</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• Sellers are responsible for accurate product descriptions</p>
                  <p>• Platform fee applies to all transactions</p>
                  <p>• Buyers have 14-day right of withdrawal (EU law)</p>
                  <p>• Disputes are resolved through platform mediation</p>
                  <p>• Prohibited items: illegal goods, weapons, drugs, counterfeit items</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="jobs">
                <AccordionTrigger>Job Listings</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• Job postings must be legitimate employment opportunities</p>
                  <p>• Employers are responsible for job description accuracy</p>
                  <p>• Premium listings have priority placement for 30 days</p>
                  <p>• Scam job postings will result in immediate account termination</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="education">
                <AccordionTrigger>Education & Courses</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• Course content is for personal educational use only</p>
                  <p>• Certificates are issued upon successful course completion</p>
                  <p>• Sharing or redistributing course materials is prohibited</p>
                  <p>• Course access is valid for 12 months from purchase</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai">
                <AccordionTrigger>AI Generation Services</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• AI credits are non-refundable and non-transferable</p>
                  <p>• Generated content is subject to AI model limitations</p>
                  <p>• Users are responsible for AI-generated content compliance</p>
                  <p>• Prohibited: generating illegal, harmful, or infringing content</p>
                  <p>• Credits expire 12 months after purchase</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="influencer">
                <AccordionTrigger>Influencer & Live Streaming</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• Streamers must comply with content guidelines</p>
                  <p>• Platform takes 20% commission on tips and gifts</p>
                  <p>• Minimum withdrawal amount: €50</p>
                  <p>• Inappropriate stream content results in immediate termination</p>
                  <p>• Age-restricted content must be properly marked</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dating">
                <AccordionTrigger>Dating Services</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• Users must be 18+ to use dating features</p>
                  <p>• Profile information must be truthful</p>
                  <p>• Harassment and inappropriate behavior will result in ban</p>
                  <p>• Platform is not responsible for offline meetings</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="psychology">
                <AccordionTrigger>Psychology & Tutoring Services</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>• Services are for informational purposes, not professional therapy</p>
                  <p>• AI counseling does not replace licensed professionals</p>
                  <p>• In crisis situations, contact emergency services</p>
                  <p>• Conversations are confidential but may be stored</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Content and Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <h4 className="font-semibold text-foreground">User Content:</h4>
            <p>
              You retain all ownership rights to content you upload to the platform. However, by posting 
              content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
              modify, and distribute your content on the platform.
            </p>
            <h4 className="font-semibold text-foreground mt-4">Platform Content:</h4>
            <p>
              All platform design, text, graphics, interfaces, code, and trademarks are owned by or 
              licensed to us. You may not copy, modify, or reverse-engineer any platform content 
              without explicit permission.
            </p>
            <h4 className="font-semibold text-foreground mt-4">Copyright Infringement:</h4>
            <p>
              We respect intellectual property rights. If you believe your copyright has been infringed, 
              please contact us with detailed information. We will investigate and take appropriate action, 
              which may include content removal and account termination.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Payments and Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <h4 className="font-semibold text-foreground">Payment Methods:</h4>
            <p>We accept the following payment methods:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Credit/Debit Cards:</strong> Visa, Mastercard, American Express</li>
              <li><strong>Digital Wallets:</strong> PayPal, Apple Pay, Google Pay</li>
              <li><strong>Bank Transfer:</strong> SEPA transfer (EU only)</li>
              <li><strong>Cryptocurrency:</strong> Bitcoin, Ethereum (selected services)</li>
            </ul>
            
            <Separator className="my-4" />
            
            <h4 className="font-semibold text-foreground">Pricing and Billing:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Prices are listed in EUR and include applicable VAT</li>
              <li>Subscription fees are charged monthly or annually based on your selection</li>
              <li>Auto-renewal occurs unless cancelled 24 hours before renewal date</li>
              <li>Price changes will be notified 30 days in advance</li>
              <li>One-time purchases are final and non-refundable unless required by law</li>
            </ul>

            <Separator className="my-4" />

            <h4 className="font-semibold text-foreground">Refund Policy:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Subscriptions:</strong> Pro-rated refund within 14 days of initial purchase</li>
              <li><strong>AI Credits:</strong> No refunds (credits expire after 12 months)</li>
              <li><strong>Course Purchases:</strong> Full refund if requested within 7 days and less than 20% completed</li>
              <li><strong>Premium Features:</strong> No refunds for one-time purchases</li>
              <li><strong>Marketplace Items:</strong> Refunds handled between buyer and seller</li>
            </ul>

            <Separator className="my-4" />

            <h4 className="font-semibold text-foreground">Payment Security:</h4>
            <p>
              All payments are processed through secure, PCI-DSS compliant payment gateways. 
              We do not store your complete credit card information. Payment data is encrypted 
              using industry-standard SSL/TLS protocols.
            </p>

            <Separator className="my-4" />

            <h4 className="font-semibold text-foreground">Cancellation:</h4>
            <p>
              You can cancel subscriptions at any time from your account settings. Cancellation 
              takes effect at the end of the current billing period. No partial refunds are provided 
              for unused subscription time.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Personal data processing complies with GDPR and applicable data protection laws.
            </p>
            <h4 className="font-semibold text-foreground">Data We Collect:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (name, email, profile data)</li>
              <li>Usage data and analytics</li>
              <li>Payment information (processed by third-party providers)</li>
              <li>Content you create and upload</li>
              <li>Communication data (messages, support tickets)</li>
            </ul>
            <h4 className="font-semibold text-foreground mt-4">Your Rights:</h4>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Request data correction or deletion</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              For detailed information, please review our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              The platform provides services "as is" without warranties of any kind. We are not liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>User-generated content and interactions between users</li>
              <li>Technical issues, service interruptions, or data loss</li>
              <li>Direct, indirect, or consequential damages from platform use</li>
              <li>Third-party services or external links</li>
              <li>Accuracy or reliability of AI-generated content</li>
              <li>Financial losses from marketplace transactions</li>
              <li>Outcomes from dating or social interactions</li>
            </ul>
            <p className="font-semibold text-foreground mt-4">
              Maximum Liability: Our total liability for any claim is limited to the amount you 
              paid to us in the 12 months preceding the claim.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <h4 className="font-semibold text-foreground">User-Initiated Termination:</h4>
            <p>
              You may delete your account at any time from account settings. Upon deletion:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your profile and personal data will be permanently deleted</li>
              <li>Active subscriptions will be cancelled (no refunds)</li>
              <li>Unused AI credits will be forfeited</li>
              <li>Some content may remain if required for legal compliance</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">Platform-Initiated Termination:</h4>
            <p>
              We reserve the right to suspend or terminate accounts that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate these terms and conditions</li>
              <li>Engage in illegal activities</li>
              <li>Harass or harm other users</li>
              <li>Attempt to exploit or damage the platform</li>
              <li>Remain inactive for more than 24 months</li>
            </ul>
            <p className="text-sm italic mt-4">
              Terminated accounts may be subject to permanent ban, preventing creation of new accounts.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              For any disputes arising from these terms or platform use:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Contact our support team to attempt informal resolution</li>
              <li>If unresolved, disputes may be submitted to mediation</li>
              <li>Legal proceedings will be governed by the laws of [Your Jurisdiction]</li>
              <li>Exclusive jurisdiction lies with courts of [Your City/Country]</li>
            </ol>
            <p className="mt-4">
              EU residents may also use the European Commission's Online Dispute Resolution platform.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>12. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Immediately for new users upon registration</li>
              <li>30 days after notification for existing users</li>
              <li>Immediately for legal compliance or security reasons</li>
            </ul>
            <p className="mt-4">
              Continued use of the platform after changes constitutes acceptance of new terms. 
              If you disagree with changes, you must stop using the platform and delete your account.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              For questions regarding these terms and conditions, please contact us:
            </p>
            <ul className="list-none space-y-2 ml-4">
              <li><strong>Email:</strong> legal@megatalent.platform</li>
              <li><strong>Support:</strong> Contact form on our website</li>
              <li><strong>Mail:</strong> [Your Company Address]</li>
            </ul>
            <Separator className="my-6" />
            <p className="text-sm text-center">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-center text-muted-foreground">
              By using this platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
