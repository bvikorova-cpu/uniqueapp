import { Copyright, Shield, Lock, HelpCircle, Mail, FileText, BookOpen, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Age16Badge } from "@/components/Age16Badge";

// App-shell routes where the rich marketing footer is noise — hide it.
const APP_SHELL_PREFIXES = [
  "/messenger",
  "/wall",
  "/jobs",
  "/rewards",
  "/megatalent",
  "/games-hub",
  "/admin",
  "/checkout",
  "/auth",
  "/reset-password",
  "/profile",
  "/settings",
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { pathname } = useLocation();
  if (APP_SHELL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;


  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">U</span>
              </div>
              <span className="font-bold text-xl">UNIQUE</span>
              <Age16Badge size="xs" withLabel={false} withLink />
            </div>
            <p className="text-sm text-muted-foreground">
              Premium AI-powered platform with 50+ modules for creativity, entertainment, education, and commerce.
              Suitable for users aged 16 and over. Younger users can visit the{" "}
              <Link to="/kids-channel" className="text-primary hover:underline">Kids Channel</Link>.
            </p>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3 w-3" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Lock className="h-3 w-3" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-3 w-3" />
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Mail className="h-3 w-3" />
                  Contact Us
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@unique-platform.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  support@unique-platform.com
                </a>
              </li>
              <li>
                <a 
                  href="mailto:privacy@unique-platform.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  privacy@unique-platform.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/subscription" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Premium Subscription
                </Link>
              </li>
              <li>
                <Link 
                  to="/ai-credits-store" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  AI Credits Store
                </Link>
              </li>
              <li>
                <Link 
                  to="/referral" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Referral Program
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Copyright className="h-4 w-4" />
            <span>{currentYear} UNIQUE Tech. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap justify-center">
            <span>Bratislava, Slovak Republic</span>
            <span className="hidden md:inline">•</span>
            <span className="text-xs">GDPR & PCI-DSS Compliant</span>
            <span className="hidden md:inline">•</span>
            <Age16Badge size="xs" withLabel={false} variant="subtle" />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> All AI-generated content, predictions, and analyses are for entertainment and educational 
            purposes only. They do not constitute professional, medical, legal, or financial advice. Always consult qualified 
            professionals for important decisions. Stripe processes all payments securely. Commission fees apply to marketplace 
            transactions (10-30% depending on service type).
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
