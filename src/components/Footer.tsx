import { Copyright } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Copyright className="h-4 w-4" />
            <span>{currentYear} Unique. Všetky práva vyhradené.</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a 
              href="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Podmienky používania
            </a>
            <a 
              href="/terms#privacy" 
              className="hover:text-foreground transition-colors"
            >
              Ochrana súkromia
            </a>
            <a 
              href="/contact" 
              className="hover:text-foreground transition-colors"
            >
              Kontakt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
