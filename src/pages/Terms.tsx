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

              <AccordionItem value="videos">
                <AccordionTrigger>Video Streaming & Content</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Video Upload & Streaming:</strong></p>
                  <p>• Users can upload videos up to 4GB in size and 2 hours duration</p>
                  <p>• Supported formats: MP4, MOV, AVI, MKV, WebM</p>
                  <p>• Videos are automatically transcoded for optimal streaming</p>
                  <p>• Content must comply with copyright laws and community guidelines</p>
                  <p>• Monetization available for verified creators with 1000+ followers</p>
                  <p><strong>Content Restrictions:</strong></p>
                  <p>• Prohibited: violence, explicit content, hate speech, copyrighted material</p>
                  <p>• Age-restricted content must be properly marked (18+)</p>
                  <p>• Platform reserves right to remove content violating guidelines</p>
                  <p><strong>Creator Rights:</strong></p>
                  <p>• Creators retain full ownership of uploaded content</p>
                  <p>• Revenue sharing: 70% creator, 30% platform</p>
                  <p>• Minimum payout threshold: €25</p>
                  <p>• Analytics and performance metrics available</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="megatalent">
                <AccordionTrigger>Megatalent - Talent Competition Platform</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Competition Structure:</strong></p>
                  <p>• Open to all users aged 16+ (parental consent required for minors)</p>
                  <p>• Multiple categories: singing, dancing, comedy, magic, other talents</p>
                  <p>• Monthly competitions with cash prizes and opportunities</p>
                  <p>• Judging based on community votes (70%) and expert panel (30%)</p>
                  <p><strong>Participation Rules:</strong></p>
                  <p>• Submit original performances or properly licensed content</p>
                  <p>• Video quality: minimum 720p HD resolution</p>
                  <p>• Maximum 5 submissions per user per competition</p>
                  <p>• Submissions deadline: last day of each month</p>
                  <p><strong>Prizes & Recognition:</strong></p>
                  <p>• 1st Place: €5,000 + featured profile</p>
                  <p>• 2nd Place: €2,500 + verification badge</p>
                  <p>• 3rd Place: €1,000 + featured content</p>
                  <p>• Top 10 finalists receive exposure opportunities</p>
                  <p>• Winners may be invited to exclusive platform events</p>
                  <p><strong>Intellectual Property:</strong></p>
                  <p>• Participants retain all rights to their performances</p>
                  <p>• Platform receives license to promote and showcase winning entries</p>
                  <p>• All submissions must be original or properly attributed</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="megaforum">
                <AccordionTrigger>Megaforum - Community Discussion Platform</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Forum Features:</strong></p>
                  <p>• Create and join discussion topics across unlimited categories</p>
                  <p>• Threaded conversations with nested replies</p>
                  <p>• Rich media support: images, videos, links, polls</p>
                  <p>• Reputation system based on helpful contributions</p>
                  <p>• Advanced search and filtering capabilities</p>
                  <p><strong>Moderation & Community Guidelines:</strong></p>
                  <p>• Community moderators appointed for each category</p>
                  <p>• Zero tolerance for spam, harassment, or misinformation</p>
                  <p>• Automated content filtering for inappropriate material</p>
                  <p>• Users can report violations with detailed explanations</p>
                  <p>• Appeals process available for removed content</p>
                  <p><strong>User Privileges:</strong></p>
                  <p>• Create topics: all registered users</p>
                  <p>• Create polls: users with 50+ reputation</p>
                  <p>• Pin topics: moderators and admins only</p>
                  <p>• Award badges: given for quality contributions</p>
                  <p><strong>Content Ownership:</strong></p>
                  <p>• Users retain ownership of their forum posts</p>
                  <p>• Platform may use excerpts for promotional purposes</p>
                  <p>• Deleted content may remain cached for moderation purposes</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="games">
                <AccordionTrigger>Gaming Platform & Tournaments</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Gaming Services:</strong></p>
                  <p>• Browser-based casual games playable without downloads</p>
                  <p>• Multiplayer tournaments and competitive rankings</p>
                  <p>• Weekly challenges with reward prizes</p>
                  <p>• Game library includes puzzle, strategy, arcade, and social games</p>
                  <p>• Cross-platform play on desktop and mobile devices</p>
                  <p><strong>Tournament Structure:</strong></p>
                  <p>• Free and paid tournament entries available</p>
                  <p>• Prize pools distributed to top performers</p>
                  <p>• Fair play monitoring and anti-cheat systems</p>
                  <p>• Tournament schedules published weekly</p>
                  <p>• Age-appropriate game categories and restrictions</p>
                  <p><strong>Virtual Currency & Rewards:</strong></p>
                  <p>• Earn in-game credits through gameplay</p>
                  <p>• Credits can be used for tournament entries and cosmetics</p>
                  <p>• No real-money gambling - entertainment purposes only</p>
                  <p>• Rewards program includes exclusive items and badges</p>
                  <p><strong>Account Security:</strong></p>
                  <p>• Accounts found cheating will be permanently banned</p>
                  <p>• Sharing accounts violates terms and may result in suspension</p>
                  <p>• Purchased items are non-transferable and non-refundable</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="vacation">
                <AccordionTrigger>Vacation & Travel Services</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Vacation Planning Tools:</strong></p>
                  <p>• Browse destinations, accommodations, and activities</p>
                  <p>• Compare prices from multiple travel providers</p>
                  <p>• Read reviews and ratings from verified travelers</p>
                  <p>• Create and share travel itineraries</p>
                  <p>• Book flights, hotels, and experiences through partner services</p>
                  <p><strong>Booking Terms:</strong></p>
                  <p>• Platform acts as intermediary between users and travel providers</p>
                  <p>• Bookings subject to provider's terms and conditions</p>
                  <p>• Cancellation policies vary by provider and booking type</p>
                  <p>• Travel insurance highly recommended for all bookings</p>
                  <p>• Commission fee: 5-10% depending on service type</p>
                  <p><strong>User Responsibilities:</strong></p>
                  <p>• Verify travel document requirements (passport, visa, etc.)</p>
                  <p>• Check health and safety advisories for destinations</p>
                  <p>• Ensure adequate travel insurance coverage</p>
                  <p>• Report booking issues within 24 hours of discovery</p>
                  <p><strong>Liability Limitations:</strong></p>
                  <p>• Platform not liable for travel provider failures or cancellations</p>
                  <p>• Force majeure events (natural disasters, pandemics) exempt from liability</p>
                  <p>• Disputes to be resolved directly with travel providers</p>
                  <p>• Reviews must be truthful and based on actual experiences</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="business">
                <AccordionTrigger>Business & Company Services</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Business Profile Features:</strong></p>
                  <p>• Create company pages with full branding customization</p>
                  <p>• Post updates, products, services, and job openings</p>
                  <p>• Analytics dashboard for engagement tracking</p>
                  <p>• Customer review and rating system</p>
                  <p>• Direct messaging with potential clients</p>
                  <p><strong>Advertising Services:</strong></p>
                  <p>• Sponsored posts and banner advertisements</p>
                  <p>• Targeted advertising based on demographics and interests</p>
                  <p>• Pay-per-click and pay-per-impression models</p>
                  <p>• Ad approval required before publication</p>
                  <p>• Minimum ad spend: €50/campaign</p>
                  <p><strong>B2B Marketplace:</strong></p>
                  <p>• Connect with suppliers, distributors, and partners</p>
                  <p>• Request quotes and negotiate deals</p>
                  <p>• Verified business badges for trusted companies</p>
                  <p>• Secure contract and invoice management</p>
                  <p><strong>Premium Business Features:</strong></p>
                  <p>• Priority customer support</p>
                  <p>• Extended analytics and reporting</p>
                  <p>• API access for integration</p>
                  <p>• White-label options available (enterprise plans)</p>
                  <p>• Monthly subscription: €99-€999 depending on tier</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="professional">
                <AccordionTrigger>Professional Services (Lawyer, Doctor, Specialist)</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Service Provider Requirements:</strong></p>
                  <p>• Must provide valid professional licenses and credentials</p>
                  <p>• Background verification required before approval</p>
                  <p>• Maintain professional liability insurance</p>
                  <p>• Comply with industry-specific regulations and ethics codes</p>
                  <p>• Annual license renewal and verification</p>
                  <p><strong>Client Consultation Process:</strong></p>
                  <p>• Book appointments through secure scheduling system</p>
                  <p>• Video consultations with end-to-end encryption</p>
                  <p>• Digital document sharing with confidentiality protection</p>
                  <p>• Payment processed securely after consultation</p>
                  <p>• Consultation notes stored securely (GDPR compliant)</p>
                  <p><strong>Medical Disclaimer:</strong></p>
                  <p>• Online consultations do not replace in-person medical care</p>
                  <p>• Emergency situations require immediate medical attention</p>
                  <p>• Prescriptions subject to local regulations and telemedicine laws</p>
                  <p>• Platform not liable for professional advice or treatment outcomes</p>
                  <p><strong>Legal Services Notice:</strong></p>
                  <p>• Consultations for informational purposes only</p>
                  <p>• Does not create attorney-client relationship unless explicitly agreed</p>
                  <p>• Jurisdiction-specific advice limitations apply</p>
                  <p>• Complex matters may require in-person consultation</p>
                  <p><strong>Pricing & Fees:</strong></p>
                  <p>• Providers set their own consultation rates</p>
                  <p>• Platform commission: 15% of consultation fee</p>
                  <p>• Cancellation policy: 24 hours notice required</p>
                  <p>• No-show fees may apply</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pets">
                <AccordionTrigger>Pet Services & Community</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Pet Profile Features:</strong></p>
                  <p>• Create profiles for your pets with photos and information</p>
                  <p>• Track medical records, vaccinations, and vet appointments</p>
                  <p>• Share cute moments in pet-dedicated feed</p>
                  <p>• Connect with other pet owners in your area</p>
                  <p>• Access pet care tips and expert advice</p>
                  <p><strong>Pet Marketplace:</strong></p>
                  <p>• Buy and sell pet supplies, accessories, and food</p>
                  <p>• Adopt pets from verified shelters and rescues</p>
                  <p>• Find pet-friendly accommodations and services</p>
                  <p>• Book grooming, training, and sitting services</p>
                  <p>• All transactions protected by buyer guarantee</p>
                  <p><strong>Adoption Guidelines:</strong></p>
                  <p>• Only registered animal shelters and rescues can post adoptions</p>
                  <p>• Adoption fees clearly disclosed</p>
                  <p>• Adopters must pass screening process</p>
                  <p>• Follow-up checks may be required</p>
                  <p>• Report any suspicious or unethical practices</p>
                  <p><strong>Community Standards:</strong></p>
                  <p>• Zero tolerance for animal abuse or neglect</p>
                  <p>• Breeding operations must comply with local laws</p>
                  <p>• Exotic pets subject to legal ownership verification</p>
                  <p>• Immediate removal of content depicting animal cruelty</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="store">
                <AccordionTrigger>Online Store & E-commerce Platform</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Merchant Features:</strong></p>
                  <p>• Create fully customizable online storefront</p>
                  <p>• List unlimited products with variants (size, color, etc.)</p>
                  <p>• Inventory management and order tracking</p>
                  <p>• Integrated payment processing and shipping calculator</p>
                  <p>• Marketing tools: discount codes, promotions, email campaigns</p>
                  <p><strong>Transaction Fees:</strong></p>
                  <p>• Basic plan: 5% + €0.30 per transaction</p>
                  <p>• Premium plan: 3% + €0.30 per transaction (€49/month)</p>
                  <p>• Enterprise plan: Custom rates (contact sales)</p>
                  <p>• No hidden fees or setup charges</p>
                  <p><strong>Seller Responsibilities:</strong></p>
                  <p>• Accurate product descriptions and authentic photos</p>
                  <p>• Competitive pricing with no price manipulation</p>
                  <p>• Process orders within 2 business days</p>
                  <p>• Provide tracking information for shipped items</p>
                  <p>• Handle returns according to stated policy</p>
                  <p>• Maintain minimum 4.0-star rating to avoid suspension</p>
                  <p><strong>Buyer Protection:</strong></p>
                  <p>• Money-back guarantee if item not as described</p>
                  <p>• 30-day return policy (unless custom/personalized items)</p>
                  <p>• Secure checkout with SSL encryption</p>
                  <p>• Dispute resolution service available</p>
                  <p>• Fraudulent sellers permanently banned</p>
                  <p><strong>Prohibited Items:</strong></p>
                  <p>• Illegal substances, weapons, counterfeit goods</p>
                  <p>• Stolen property, hazardous materials</p>
                  <p>• Adult content or services</p>
                  <p>• Items violating intellectual property rights</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gifts">
                <AccordionTrigger>Gift Shop & Digital Gifting</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Gift Services:</strong></p>
                  <p>• Send virtual gifts to friends and family</p>
                  <p>• Purchase physical gift cards for platform services</p>
                  <p>• Create personalized gift messages and cards</p>
                  <p>• Schedule gift delivery for special occasions</p>
                  <p>• Gift wrapping and greeting card options available</p>
                  <p><strong>Digital Gifts:</strong></p>
                  <p>• Platform credits, AI tokens, premium subscriptions</p>
                  <p>• Animated stickers and exclusive emojis</p>
                  <p>• Virtual flowers, trophies, and awards</p>
                  <p>• Instant delivery via notification</p>
                  <p>• Prices range from €0.99 to €99.99</p>
                  <p><strong>Gift Cards:</strong></p>
                  <p>• Available in denominations: €10, €25, €50, €100</p>
                  <p>• Valid for 12 months from purchase date</p>
                  <p>• Can be used for any platform service or purchase</p>
                  <p>• Non-refundable and non-exchangeable for cash</p>
                  <p>• Lost or stolen cards cannot be replaced</p>
                  <p><strong>Terms & Conditions:</strong></p>
                  <p>• Gifts are non-refundable once delivered</p>
                  <p>• Recipients must have active platform account</p>
                  <p>• Inappropriate gift messages will be filtered</p>
                  <p>• Bulk gift purchases may require verification</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bookstore">
                <AccordionTrigger>Digital Bookstore & Library</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Digital Book Collection:</strong></p>
                  <p>• Extensive library of e-books across all genres</p>
                  <p>• Audiobooks with professional narration</p>
                  <p>• Comics, manga, and graphic novels</p>
                  <p>• Academic textbooks and professional literature</p>
                  <p>• Self-published works from independent authors</p>
                  <p><strong>Reading Features:</strong></p>
                  <p>• Cross-device synchronization (read anywhere)</p>
                  <p>• Customizable reading interface (fonts, colors, spacing)</p>
                  <p>• Highlight and note-taking capabilities</p>
                  <p>• Built-in dictionary and translation tools</p>
                  <p>• Offline reading mode available</p>
                  <p><strong>Pricing Models:</strong></p>
                  <p>• Individual book purchases: €2.99 - €29.99</p>
                  <p>• Monthly subscription: €9.99 (unlimited reading)</p>
                  <p>• Rental options: €1.99 for 14-day access</p>
                  <p>• Free classics and public domain works</p>
                  <p><strong>Author & Publisher Terms:</strong></p>
                  <p>• Authors receive 70% royalty on direct sales</p>
                  <p>• Subscription reads compensated per page read</p>
                  <p>• DRM protection available but optional</p>
                  <p>• Monthly sales reports and analytics</p>
                  <p>• Minimum payout: €10</p>
                  <p><strong>User License:</strong></p>
                  <p>• Personal use only - sharing accounts prohibited</p>
                  <p>• No copying, distributing, or printing commercial books</p>
                  <p>• Access revoked if account terminated</p>
                  <p>• Purchased books remain in library indefinitely</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="music">
                <AccordionTrigger>Music Streaming & Creation</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Music Library:</strong></p>
                  <p>• Millions of songs across all genres</p>
                  <p>• Curated playlists and personalized recommendations</p>
                  <p>• Podcasts and audio shows</p>
                  <p>• Live concert recordings and exclusives</p>
                  <p>• High-quality audio streaming (up to 320kbps)</p>
                  <p><strong>Subscription Tiers:</strong></p>
                  <p>• Free: Ad-supported with limited skips</p>
                  <p>• Premium (€9.99/month): Ad-free, offline downloads, unlimited skips</p>
                  <p>• Family (€14.99/month): Up to 6 accounts</p>
                  <p>• Student (€4.99/month): Requires verification</p>
                  <p><strong>Artist Features:</strong></p>
                  <p>• Upload and distribute original music</p>
                  <p>• Verified artist profiles with analytics</p>
                  <p>• Revenue sharing: €0.003-€0.005 per stream</p>
                  <p>• Promote music through featured placements</p>
                  <p>• Connect directly with fans</p>
                  <p><strong>Music Creation Tools:</strong></p>
                  <p>• AI-powered music generation and remixing</p>
                  <p>• Beat maker and virtual instruments</p>
                  <p>• Collaborate with other musicians</p>
                  <p>• Royalty-free sound library for content creators</p>
                  <p><strong>Copyright & Licensing:</strong></p>
                  <p>• Only upload music you own or have rights to</p>
                  <p>• Cover songs require proper licensing</p>
                  <p>• Copyright violations result in immediate removal</p>
                  <p>• Repeat offenders permanently banned</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="events">
                <AccordionTrigger>Events & Meetups</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Event Creation:</strong></p>
                  <p>• Create public or private events with full customization</p>
                  <p>• Set event details: date, time, location, description</p>
                  <p>• Manage attendee lists and RSVPs</p>
                  <p>• Send event updates and reminders</p>
                  <p>• Share event links on social media</p>
                  <p><strong>Ticketing Services:</strong></p>
                  <p>• Sell tickets directly through the platform</p>
                  <p>• Multiple ticket tiers and pricing options</p>
                  <p>• QR code tickets for easy check-in</p>
                  <p>• Automated refund processing</p>
                  <p>• Platform fee: 5% + €0.50 per ticket</p>
                  <p><strong>Event Types:</strong></p>
                  <p>• Virtual events with video streaming</p>
                  <p>• In-person meetups and gatherings</p>
                  <p>• Hybrid events (virtual + in-person)</p>
                  <p>• Recurring events and series</p>
                  <p>• Private group meetings</p>
                  <p><strong>Organizer Responsibilities:</strong></p>
                  <p>• Ensure event safety and security</p>
                  <p>• Comply with local laws and regulations</p>
                  <p>• Obtain necessary permits and insurance</p>
                  <p>• Honor refund policy for cancelled events</p>
                  <p>• Accurate event information and updates</p>
                  <p><strong>Liability:</strong></p>
                  <p>• Platform not liable for event outcomes</p>
                  <p>• Organizers responsible for attendee safety</p>
                  <p>• Attendees participate at own risk</p>
                  <p>• Report safety concerns immediately</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="groups">
                <AccordionTrigger>Groups & Communities</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Group Features:</strong></p>
                  <p>• Create public, private, or secret groups</p>
                  <p>• Unlimited members per group</p>
                  <p>• Shared content feeds and discussions</p>
                  <p>• File sharing and collaborative documents</p>
                  <p>• Event planning and polls</p>
                  <p>• Group video calls and live streams</p>
                  <p><strong>Group Management:</strong></p>
                  <p>• Admins can add/remove members</p>
                  <p>• Moderators help maintain group rules</p>
                  <p>• Customizable group settings and permissions</p>
                  <p>• Member approval required for private groups</p>
                  <p>• Ban abusive members</p>
                  <p><strong>Community Guidelines:</strong></p>
                  <p>• Groups must have clear rules and purpose</p>
                  <p>• Hate groups and extremist content prohibited</p>
                  <p>• Spam and commercial solicitation not allowed</p>
                  <p>• Respect member privacy and consent</p>
                  <p>• Report violations to platform administrators</p>
                  <p><strong>Premium Group Features:</strong></p>
                  <p>• Monetization options for exclusive content</p>
                  <p>• Advanced analytics and insights</p>
                  <p>• Custom branding and design</p>
                  <p>• Integration with external tools</p>
                  <p>• Priority support (€19.99/month)</p>
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
              For questions regarding these terms and conditions, please contact us via our online contact form available in the Contact section of the platform.
            </p>
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
