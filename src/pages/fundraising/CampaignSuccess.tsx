import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Share2, Heart, Home, ArrowRight, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function CampaignSuccess() {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action') || 'created';

  useEffect(() => {
    // Fire confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const campaignUrl = `${window.location.origin}/fundraising/${type}/${id}`;

  const handleShare = (platform: string) => {
    const text = action === 'donation' 
      ? "I just made a donation to support this campaign! 💖"
      : "I just created a fundraising campaign! Please help me spread the word! 🙏";
    
    const encodedUrl = encodeURIComponent(campaignUrl);
    const encodedText = encodeURIComponent(text);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(campaignUrl);
        toast({
          title: 'Link Copied!',
          description: 'Campaign link has been copied to your clipboard',
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5 dark:from-green-950/20 flex items-center justify-center py-12 px-4">
      <FloatingHowItWorks
        title="Campaign Success"
        intro="Confirmation after a successful donation."
        steps={[
          { title: "Payment confirmed", desc: "Stripe processed your donation in EUR." },
          { title: "Receipt on the way", desc: "Check your email for the tax receipt." },
          { title: "Share the campaign", desc: "Help the campaign reach its goal faster." },
          { title: "Track progress", desc: "Follow updates on the campaign page." },
          { title: "Donate again anytime", desc: "Set up recurring monthly donations if you wish." }
        ]}
      />
      <Card className="max-w-lg w-full border-green-500/30 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl text-green-700 dark:text-green-400">
            {action === 'donation' ? 'Thank You for Your Generosity!' : 'Campaign Submitted Successfully!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {action === 'donation' 
              ? 'Your donation makes a real difference. You are helping change someone\'s life today.'
              : 'Your campaign has been submitted for review. Our team will verify it within 24-48 hours.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {action !== 'donation' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                What happens next?
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1 list-disc list-inside">
                <li>Our admin team will review your campaign</li>
                <li>We'll verify the provided documentation</li>
                <li>Once approved, your campaign goes live!</li>
                <li>You'll receive an email notification</li>
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold text-center">Share the Campaign</h4>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-sky-500 hover:bg-sky-600 text-white border-0"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-blue-700 hover:bg-blue-800 text-white border-0"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => handleShare('copy')}
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              onClick={() => navigate(`/fundraising/${type}/${id}`)}
            >
              View Campaign
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
